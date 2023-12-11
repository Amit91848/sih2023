from .VectorStoreService import VectorStoreService
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain.vectorstores.chroma import Chroma
import os
from typing import List, Dict, Optional


class ChromaService(VectorStoreService):
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._db = None
        return cls._instance

    def upload_document(self, documents: List[Document], embedding: Embeddings, index_name: str):
        try:
            self._db = Chroma.from_documents(documents=documents,
                                             embedding=embedding, collection_name=index_name, persist_directory=os.getcwd())
        except Exception as e:
            print(f"Error uploading documents to Chroma: {e}")

    def similarity_search(self, query: str, limit: int, metadata_filter: Optional[Dict[str, str]]) -> List[Document]:
        if self._db:
            try:
                return self._db.similarity_search(filter=metadata_filter, k=limit, query=query)
            except Exception as e:
                print(f"Error performing similarity search in Chroma: {e}")
        else:
            print("Chroma database is not initialized.")
            return []
