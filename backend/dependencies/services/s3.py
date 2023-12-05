from dependencies.fileUploadService import FileUploadService
import boto3
from boto3.resources.base import ServiceResource

from typing import Dict, Any


class S3Service(FileUploadService):
    def __init__(self) -> None:
        self.s3_client: ServiceResource = boto3.resource('s3')

    def upload(self, file_data: str, filename: str, metadata: Dict[str, Any] = None) -> str:
        return "WIP"
