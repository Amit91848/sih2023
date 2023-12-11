from abc import ABC, ABCMeta, abstractmethod
from typing import Dict, Any


class FileUploadService(ABC):
    @abstractmethod
    def get_presigned_url(self, file_name: str) -> str:
        pass

    @abstractmethod
    def upload(self, file_content: bytes, filename: str, metadata: Dict[str, Any] = None) -> str:
        pass
