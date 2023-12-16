from api.deps import CurrentUser, SessionDep
from typing import Optional

from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel
from crud.crud_message import get_all_messages, find_prev_messages, format_message, create_message
from crud.crud_file import get_user_file
from core.utils import success_response
from openai import OpenAI
from core.settings import settings
from langchain.vectorstores.pinecone import Pinecone
from api.deps import EmbeddingDep, VectorStoreDep


openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)


router = APIRouter()


class MessageBody(BaseModel):
    message: str
    fileId: int


@router.post("/")
async def post_message(vector_store: VectorStoreDep, embeddings: EmbeddingDep, session: SessionDep, current_user: CurrentUser, body: MessageBody):
    file = get_user_file(session, current_user.id, body.fileId)

    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="File could not be found")

    message = create_message(session, body.fileId,
                             current_user.id, body.message)

    if not message:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, details="Error storing message")

    results = vector_store.similarity_search(body.message, 5, {"file_id": file[0].id})
    context_text = "\n\n".join([result for result in results])

    prev_messages = find_prev_messages(
        session, body.fileId, current_user.id, 6)
    formatted_prev_messages = [format_message(msg) for msg in prev_messages]

    message_prompt = """
                Use the following pieces of context (Extracted from user uploaded document) (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer. If question does not exist in context do not answer

                \n----------------\n
                    PREVIOUS CONVERSATION:

                    {}
                \n----------------\n

                  CONTEXT:
                  {}

                  USER INPUT: {}
             """

    ai_res = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        temperature=0,
        # stream=True,
        messages=[
            {"role": "system",
                "content": "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format."},
            {"role": "user", "content": message_prompt.format(formatted_prev_messages, context_text, body.message)

             }
        ]
    )

    ai_message = create_message(
        session, body.fileId, current_user.id, ai_res.choices[0].message.content, False)

    return ai_res


@router.get("/all")
async def get_all_file_messages(session: SessionDep, current_user: CurrentUser, file_id: Optional[int], cursor: Optional[int] = None, limit: int = 2):
    file = get_user_file(session, current_user.id, file_id)

    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="File does not exist")

    messages, has_more = get_all_messages(session, cursor, file_id, limit)

    next_cursor = messages[-1].id if has_more else None

    messages = messages[:limit]

    return success_response(data={"messages": messages, "nextCursor": next_cursor})
