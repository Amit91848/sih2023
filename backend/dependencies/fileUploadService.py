from abc import ABC, ABCMeta, abstractmethod
from typing import Dict, Any


class FileUploadService(ABC):
    @abstractmethod
    def upload(self, file_content: bytes, filename: str, metadata: Dict[str, Any] = None) -> str:
        pass
