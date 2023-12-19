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
from core.services.prakat.batching import Batching



class ChromaService(VectorStoreService):
    def upload_text(self, text: str, embedding: Embeddings, index_name: str, file_id: int):
        client = chromadb.PersistentClient(path=os.getcwd())
        collection = client.get_or_create_collection(name=index_name)
        
        sentence_transformer = SentenceTransformer("all-MiniLM-L6-v2")
        
        batching = Batching()
        sets = batching.get_sets(text=text, set_size=2)
        
        documents_str = []
        embeddings = []
        ids = []
        metadatas = []
        
        for i in range(len(sets)):
            batch = ''.join(sets[i])
            emb = sentence_transformer.encode(batch).tolist()
            id = uuid.uuid4()
            
            metadatas.append({"file_id": file_id})
            ids.append(str(id))
            embeddings.append(emb)
            documents_str.append(batch)
            
        
        collection.add(documents=documents_str, embeddings=embeddings, metadatas=metadatas, ids=ids)
        
    
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
            batching = Batching()
            sets = batching.get_sets(text=page, set_size=3)

            for i in range(len(sets)):
                batch = ''.join(sets[i])
                emb = sentence_transformer.encode(batch).tolist()
                id = uuid.uuid4()
                
                metadatas.append({"file_id": file_id})
                ids.append(str(id))
                embeddings.append(emb)
                documents_str.append(batch)
    
            collection.add(documents=documents_str, embeddings=embeddings, metadatas=metadatas, ids=ids)
            documents_str = []
            embeddings = []
            ids = []
            metadatas = [] 
            

    def similarity_search(self, query: str, limit: int, metadata_filter: Dict[str, int] | None) -> List[Document]:
        client = chromadb.PersistentClient(path=os.getcwd())
        collection = client.get_collection("prakat")

        sentence_transformer = SentenceTransformer("all-MiniLM-L6-v2")
        query_emb = sentence_transformer.encode(query).tolist()

        search_results = collection.query(query_embeddings=[query_emb], n_results=limit, where=metadata_filter)
        return search_results["documents"][0]
