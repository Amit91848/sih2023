from api.deps import CurrentUser, SessionDep
from typing import Optional

from fastapi import APIRouter, status, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from crud.crud_message import get_all_messages, find_prev_messages, format_message, create_message
from crud.crud_file import get_user_file
from core.utils import success_response
from langchain.callbacks import AsyncIteratorCallbackHandler
from typing import AsyncIterable
import asyncio
from core.services.prakat.llama import LocalModel
from openai import OpenAI
from core.settings import settings
from api.deps import EmbeddingDep, VectorStoreDep, create_rag_model_service
from sse_starlette.sse import EventSourceResponse, ServerSentEvent


openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)


router = APIRouter()


class MessageBody(BaseModel):
    message: str
    fileId: int

async def send_message(content: str, model: LocalModel) -> AsyncIterable[str]:
    callback = AsyncIteratorCallbackHandler()
  
    task = asyncio.create_task(
        model.stream_inference(content)
    )

    try:
        async for token in callback.aiter():
            yield token
    except Exception as e:
        print(f"Caught exception: {e}")
    finally:
        callback.done.set()

    await task

@router.post("/")
async def post_message(request: Request,vector_store: VectorStoreDep, embeddings: EmbeddingDep, session: SessionDep, current_user: CurrentUser):
    data = await request.json()
    fileId = data["fileId"]
    originalMsg = data["message"]
    print(fileId, originalMsg)
    file = get_user_file(session, current_user.id, fileId)

    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="File could not be found")

    message = create_message(session, fileId,
                             current_user.id, originalMsg)

    if not message:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, details="Error storing message")

    results = vector_store.similarity_search(originalMsg, 2, {"file_id": file[0].id})
    print(results)
    context_text = "\n\n".join([result for result in results])

    prev_messages = find_prev_messages(
        session, fileId, current_user.id, 6)
    formatted_prev_messages = [format_message(msg) for msg in prev_messages]

    rag_ai = create_rag_model_service()
    request.app.state.current_model = rag_ai
    async def stream():
        acc_response = ""
        ai_response = rag_ai.stream_inference(query=originalMsg, context=context_text)
        for token in ai_response: # GenerationStepResult
            acc_response += token.token
            print(token.token)
            yield ServerSentEvent(data=token.token, event="EventName")
        ai_message = create_message(db=session, file_id=fileId, user_id=current_user.id, message=acc_response, isUser=False)
        request.app.state.current_model = None
    # ai_response = rag_ai.stream_inference(query=originalMsg)
    # create_message(db=session, file_id=fileId, user_id=current_user.id, message=ai_response, isUser=False)
    # generator = send_message(originalMsg, model=rag_ai)
    return EventSourceResponse(content=stream(), media_type='text/event-stream')
    # return success_response(data=ai_response)


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
