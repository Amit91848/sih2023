import os
from typing import Dict, Any
from core.services.file.fileUploadService import FileUploadService


class LocalUploadService(FileUploadService):
    def __init__(self, local_storage_path: str) -> None:
        self.local_storage_path = local_storage_path

    def get_presigned_url(self, file_name: str) -> str:
        return f"file://{self.local_storage_path}/{file_name}"

    def upload(self, file_content: bytes, filename: str, metadata: Dict[str, Any] = None) -> str:
        try:
            with open(os.path.join(self.local_storage_path, filename), 'wb') as local_file:
                local_file.write(file_content)
            print("Local save successful")

            url = self.get_presigned_url(filename)
            return url
        except Exception as e:
            print(f"Local save failed: {e}")
            return None
