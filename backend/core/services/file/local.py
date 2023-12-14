import os
from typing import Dict, Any
from core.services.file.fileUploadService import FileUploadService


class LocalUploadService(FileUploadService):
    def __init__(self, local_storage_path: str) -> None:
        self.local_storage_path = local_storage_path

    def get_presigned_url(self, file_name: str) -> str:
        return f"{self.local_storage_path}/{file_name}"

    def upload(self, file_content, file_name: str, metadata: Dict[str, Any] = None) -> str:
        try:
            contents = file_content.read()
            with open(os.path.join(self.local_storage_path, file_name), 'wb') as local_file:
                local_file.write(contents)
            print("Local save successful")

            url = self.get_presigned_url(file_name)
            return url, True
        except Exception as e:
            print(f"Local save failed: {e}")
            return None
