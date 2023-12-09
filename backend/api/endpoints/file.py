import io
import os
from typing import Annotated, Union, Optional

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from pydantic import BaseModel
from crud.crud_file import create_file, get_user_files, delete_user_file, get_user_file
import tempfile

from api.deps import CurrentUser, SessionDep
from core.settings import settings
from core.utils import success_response, error_response, MB, generate_random_file_name
from dependencies.services.s3 import S3Service
from crud.crud_message import get_all_messages
from langchain.document_loaders.pdf import PyMuPDFLoader
from langchain.vectorstores.pinecone import Pinecone
import requests
from core.openai import get_openai_embeddings
import pinecone
from pinecone.exceptions import ApiException
from pypdf import PdfFileReader, PdfReader


def get_pinecone_client():
    pinecone.init(api_key=settings.PINECONE_API_KEY,
                  environment=settings.PINECONE_ENVIRONMENT)
    return pinecone


router = APIRouter()


class FileUploadBody(BaseModel):
    pass


def create_upload_service():
    if settings.S3_ACCESS_KEY and settings.S3_SECRET_ACCESS_KEY:
        # s3_client = ...  # Instantiate your S3 client (boto3, aioboto, etc.)
        return S3Service()


async def upload_to_vector_database(file_url: str):
    file_blob = requests.get(file_url)

    if file_blob.status_code == 200:
        file_content = file_blob.content

        # Create a temporary file with a shorter name
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(file_content)
            temp_pdf_path = temp_file.name

        try:
            # Create PyMuPDFLoader instance using the temporary file path
            pdf_loader = PyMuPDFLoader(file_path=temp_pdf_path)
            pdf = pdf_loader.load()
            pinecone_client = get_pinecone_client()
            pinecone_client.Index(index_name="prakat")

            embeddings = get_openai_embeddings()

            try:
                Pinecone.from_documents(
                    documents=pdf, embedding=embeddings, index_name="prakat")
            except ApiException:
                print("err while uploading to pinecone ")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Error uploading to pinecone")

        finally:
            # Clean up: Delete the temporary file
            if temp_pdf_path:
                try:
                    os.remove(temp_pdf_path)
                except Exception as e:
                    print(f"Error deleting temporary file: {e}")


upload_service = create_upload_service()


@router.post("/upload")
async def upload(session: SessionDep, file: UploadFile, current_user: CurrentUser):
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='No file found!!'
        )

    contents = await file.read()
    size = len(contents)

    if not 0 < size <= 100 * MB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Supported file size is 0 - 100 MB'
        )

    file_name = f'{generate_random_file_name(file_name=file.filename)}'

    file_url = upload_service.upload(file_content=io.BytesIO(
        contents), file_name=file_name)
    print("uploaded to aws")

    if not file_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Error uploading file!!")

    await upload_to_vector_database(file_url)
    print("uploaded to pinecone")

    file_obj = create_file(db=session, name=file.filename,
                           url=file_url, key=file_name, user_id=current_user.id)

    return success_response(data={"name": file.filename, "contentType": file.content_type, "url": file_obj.url, "key": file_obj.key})


@router.get("/all")
async def user_files(session: SessionDep, current_user: CurrentUser):
    files = get_user_files(session, current_user.id)

    return success_response(data=files)


@router.get("/{file_id}")
async def get_file(session: SessionDep, current_user: CurrentUser, file_id: Union[int, None] = None):
    file = get_user_file(session, current_user.id, file_id)

    if len(file) == 0:
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT,
                            detail="Couldn't find the file you are looking for!")

    return success_response(data=file[0])


@router.delete("/{file_id}")
async def delete_file(session: SessionDep, current_user: CurrentUser, file_id: Union[int, None] = None):
    file = delete_user_file(session, current_user.id, file_id)

    return success_response()
