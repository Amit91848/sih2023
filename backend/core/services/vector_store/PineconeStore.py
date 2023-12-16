from .VectorStoreService import VectorStoreService
from langchain.vectorstores.pinecone import Pinecone
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from typing import List, Optional, Dict


class PineconeService(VectorStoreService):
    def upload_document(self, documents: List[Document], embedding: Embeddings, index_name: str, file_id: int):
        Pinecone.from_documents(
            documents=documents, embedding=embedding, index_name=index_name)

    def similarity_search(self, query: str, limit: int, metadata_filter: Optional[Dict[str, str]]) -> List[Document]:
        return Pinecone.similarity_search(query=query, k=limit, filter=metadata_filter)
