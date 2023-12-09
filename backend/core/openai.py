from langchain.embeddings import OpenAIEmbeddings
from core.settings import settings

from fastapi import HTTPException, status


def get_openai_embeddings():
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="OpenAI Api key not found!!!!")

    return OpenAIEmbeddings(api_key=settings.OPENAI_API_KEY)
