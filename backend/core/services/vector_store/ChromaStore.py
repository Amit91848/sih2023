from .VectorStoreService import VectorStoreService
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain.vectorstores.chroma import Chroma
from langchain.text_splitter import CharacterTextSplitter
import chromadb 
import os
from typing import List, Dict, Optional
from sentence_transformers import SentenceTransformer
import uuid

# class ChromaService(VectorStoreService):
#     _instance = None

#     def __new__(cls):
#         if cls._instance is None:
#             cls._instance = super().__new__(cls)
#             cls._instance._db = None
#         return cls._instance

#     def upload_document(self, documents: List[Document], embedding: Embeddings, index_name: str, file_id: int):
#         try:
#             self._db = Chroma.from_documents(documents=documents,
#                                              embedding=embedding, collection_name=index_name, persist_directory=os.getcwd(), collection_metadata={"file_id":file_id})

        
#             print(self._db.get())
#         except Exception as e:
#             print(f"Error uploading documents to Chroma: {e}")

#     def similarity_search(self, query: str, limit: int, metadata_filter: Optional[Dict[str, str]] = None) -> List[Document]:
#         print("self: ", self._db)
#         if self._db:
#             try:
#                 return self._db.similarity_search(filter=metadata_filter, k=limit, query=query)
#             except Exception as e:
#                 print(f"Error performing similarity search in Chroma: {e}")
#         else:
#             print("Chroma database is not initialized.")
#             return []

class ChromaService(VectorStoreService):
    def upload_document(self, documents: List[Document], embedding: Embeddings, index_name: str, file_id: int):
        client = chromadb.PersistentClient(path=os.getcwd())
        collection = client.get_or_create_collection(name=index_name)

        sentence_transformer = SentenceTransformer("all-MiniLM-L6-v2")

        documents_str = []
        embeddings = []
        ids = []
        metadatas = []

        for document in range(len(documents)):
            page = documents[document].page_content
            emb = sentence_transformer.encode(page).tolist()
            id = uuid.uuid4()
            
            metadatas.append({"file_id": file_id})
            ids.append(str(id))
            embeddings.append(emb)
            documents_str.append(page)


        collection.add(documents=documents_str, embeddings=embeddings, metadatas=metadatas, ids=ids)

    def similarity_search(self, query: str, limit: int, metadata_filter: Dict[str, int] | None) -> List[Document]:
        client = chromadb.PersistentClient(path=os.getcwd())
        collection = client.get_collection("prakat")

        sentence_transformer = SentenceTransformer("all-MiniLM-L6-v2")
        query_emb = sentence_transformer.encode(query).tolist()

        search_results = collection.query(query_embeddings=[query_emb], n_results=limit, where=metadata_filter)
        return search_results["documents"][0]
