from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from core.settings import settings
from dependencies.services.s3 import S3Service

router = APIRouter()


def create_upload_service():
    if settings.S3_ACCESS_KEY and settings.S3_SECRET_ACCESS_KEY:
        # s3_client = ...  # Instantiate your S3 client (boto3, aioboto, etc.)
        return S3Service()


upload_service = create_upload_service()


@router.get("/")
def upload():
    return upload_service.upload(file_data="some", filename="someo other")
