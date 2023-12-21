import io
import os
from typing import Annotated, Union, Optional

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from pydantic import BaseModel
from crud.crud_file import create_file, get_user_files, delete_user_file, get_user_file
import tempfile
from crud.crud_summary import get_latest_summary, get_all_summaries_by_file_id
from crud.crud_grammar_check import get_grammar_check
from collections import defaultdict
from core.services.prakat.ocr import generate_ocr


from api.deps import CurrentUser, SessionDep, FileUploadServiceDep, EmbeddingDep, VectorStoreDep
from core.settings import settings
from core.utils import success_response, MB, generate_random_file_name
from langchain.document_loaders.pdf import PyMuPDFLoader
from langchain.vectorstores.pinecone import Pinecone
import requests
import pinecone
from pinecone.exceptions import ApiException
from core.services.vector_store.service import VectorStoreService
from langchain_core.embeddings import Embeddings


def get_pinecone_client():
    pinecone.init(api_key=settings.PINECONE_API_KEY,
                  environment=settings.PINECONE_ENVIRONMENT)
    return pinecone


router = APIRouter()


class FileUploadBody(BaseModel):
    pass


async def upload_text_to_vector_database(vector_store: VectorStoreService, embeddings: Embeddings, text: str, file_id: int):
    try:
        vector_store.upload_text(embedding=embeddings, file_id=file_id, index_name="prakat", text=text)
        print("uploaded to pinecone")   
    except ApiException:
        print("err while uploading to pinecone ")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Error uploading to pinecone")

    
    
async def upload_pdf_to_vector_database(vector_store: VectorStoreService, embeddings: Embeddings, file_url: str, file_id: int):
    # file_blob = requests.get(file_url)

    # if file_blob.status_code == 200:
    #     file_content = file_blob.content

    #     # Create a temporary file with a shorter name
    #     with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
    #         temp_file.write(file_content)
    #         temp_pdf_path = temp_file.name

        # try:
    pdf_loader = PyMuPDFLoader(file_path=file_url)
    pdf = pdf_loader.load()

    try:
        vector_store.upload_document(
            documents=pdf, embedding=embeddings, index_name="prakat", file_id=file_id)
    except ApiException:
        print("err while uploading to pinecone ")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Error uploading to pinecone")

        # finally:
        #     # Clean up: Delete the temporary file
        #     if temp_pdf_path:
        #         try:
        #             os.remove(temp_pdf_path)
        #         except Exception as e:
        #             print(f"Error deleting temporary file: {e}")
        
        


@router.post("/upload")
async def upload(embeddings: EmbeddingDep, vector_store: VectorStoreDep, upload_service: FileUploadServiceDep, session: SessionDep, file: UploadFile, current_user: CurrentUser):
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='No file found!!'
        )
    ispdf = file.content_type == "application/pdf"
    contents = await file.read()
    size = len(contents)

    if not 0 < size <= 100 * MB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Supported file size is 0 - 100 MB'
        )

    file_name = f'{generate_random_file_name(file_name=file.filename)}'

    file_url, isLocal = upload_service.upload(file_content=io.BytesIO(
        contents), file_name=file_name)
    print("uploaded pdf to local path")
    
    ocr_url = ""
         
    if not file_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Error uploading file!!")

    print("uploaded to pinecone")
    
    data = ""
    if not ispdf:
        img_data, ocr_url = generate_ocr(file_name=file_name, img_path=file_url)
        data = img_data

    file_obj = create_file(db=session, name=file.filename,
                           url=file_url, key=file_name, user_id=current_user.id,isLocal=isLocal,size=size, isPdf=ispdf, ocrText=data, ocrOgImage=ocr_url)
    
    if ispdf:
        await upload_pdf_to_vector_database(embeddings=embeddings, vector_store=vector_store, file_url=file_url, file_id=file_obj.id)
    else:
        print("Uploading txt to vector db")
        await upload_text_to_vector_database(embeddings=embeddings, vector_store=vector_store, text=data, file_id=file_obj.id)

    return success_response(data={"name": file.filename, "contentType": file.content_type, "url": file_obj.url, "key": file_obj.key})

    
@router.get("/summary/{file_id}")
async def get_file_summary(session: SessionDep, current_user: CurrentUser, file_id: int):
    file = get_user_file(session, current_user.id, file_id)

    if len(file) == 0:
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT,
                            detail="Couldn't find the file you are looking for!")

    summary = get_latest_summary(session, file_id)
    return success_response(data=summary)

@router.get("/{file_id}/grammar-check")
async def get_corrected_text(session: SessionDep, current_user: CurrentUser, file_id: int):
    file = get_user_file(session, current_user.id, file_id)

    if len(file) == 0:
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT,
                            detail="Couldn't find the file you are looking for!")

    db_grammar_check = get_grammar_check(session, file_id)
    return success_response(data=db_grammar_check)

@router.get("/{file_id}/summary/{type}")
async def get_all_file_summaries(session: SessionDep, current_user: CurrentUser, file_id: int, type: int):
    file = get_user_file(db=session, file_id=file_id, user_id=current_user.id)

    if len(file) == 0:
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT,
                            detail="Couldn't find the file you are looking for!")

    summaries = get_all_summaries_by_file_id(file_id=file_id, db=session, type=type)

    return success_response(data=summaries)

@router.get("/all")
async def user_files(session: SessionDep, current_user: CurrentUser):
    files = get_user_files(session, current_user.id)
    data = []
    for file in list(files):
        latest_file_summary = get_latest_summary(db=session,file_id=file.id)
        # Convert File object to dictionary
        file_dict = file.model_dump()
        if latest_file_summary:
            # Add additional key to the dictionary
            file_dict["summary_status"] = latest_file_summary.status
        data.append(file_dict)
    return success_response(data=data)


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
