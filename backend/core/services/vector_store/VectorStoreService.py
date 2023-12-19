from abc import ABC, abstractmethod
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from typing import List, Optional, Dict


class VectorStoreService(ABC):
    @abstractmethod
    def upload_document(self, documents: List[Document], embedding: Embeddings, index_name: str, file_id: int):
        pass

    def similarity_search(self, query: str, limit: int, metadata_filter: Optional[Dict[str, str]]) -> List[Document]:
        pass
    
    def upload_text(self, text: str, embedding: Embeddings, index_name: str, file_id: int):
        pass
