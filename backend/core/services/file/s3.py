from core.services.file.fileUploadService import FileUploadService
import boto3
from boto3.exceptions import S3UploadFailedError
from core.settings import settings
from botocore.config import Config
import mimetypes

from typing import Dict, Any


class S3Service(FileUploadService):
    def __init__(self) -> None:
        self.s3 = boto3.client(
            's3',
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
            region_name=settings.S3_REGION_NAME,
            config=Config(signature_version='s3v4')
        )
        self.s3_bucket = settings.S3_BUCKET_NAME

    def get_presigned_url(self, file_name: str):
        url = self.s3.generate_presigned_url('get_object', Params={
                                             "Bucket": self.s3_bucket, "Key": file_name}, ExpiresIn=60 * 60 * 24 * 6)
        print(url)
        return url

    def upload(self, file_content: bytes, file_name: str, metadata: Dict[str, Any] = None) -> str:
        try:
            content_type, _ = mimetypes.guess_type(file_name)

            if not content_type:
                content_type = 'application/octet-stream'

            self.s3.upload_fileobj(
                file_content, self.s3_bucket, file_name, {'ContentType': content_type})
            print("Upload successful")

            url = self.get_presigned_url(file_name)
            return url, False

            # return f"https://s3.amazonaws.com/{self.s3_bucket}/{file_name}"
        except S3UploadFailedError as e:
            print(f"S3 Upload failed: {e}")
        # except ClientError as e:
        #     print(f"An error occurred: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error: {e}")
            return None
