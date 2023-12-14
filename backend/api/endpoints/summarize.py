from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from api.deps import create_llm_model_service, SessionDep, CurrentUser
from pydantic import BaseModel
from crud.crud_file import get_user_file
from crud.crud_summary import create_summary, update_summary
from langchain.document_loaders.pdf import PyMuPDFLoader
from core.types import BatchSize,Status

class SummarizeBody(BaseModel):
  fileId: int
  batchSize: BatchSize

router = APIRouter()

def call_batch_summarize(session: SessionDep, txt_content: str, summary_id: int, batch_size: BatchSize):
  llm = create_llm_model_service()
  llm.batch_summarize(session=session, summary_id=summary_id, text=txt_content[:500], batch_size=batch_size)

@router.post("/summarize")
async def summarize_text(session: SessionDep, currentUser: CurrentUser, body: SummarizeBody, bg_tasks: BackgroundTasks):
  # try:
    file = get_user_file(db=session, user_id=currentUser.id, file_id=body.fileId)

    if not file:
      raise HTTPException(status=status.HTTP_404, detail="File not found")

    pdf_loader = PyMuPDFLoader(file_path=file[0].url)
    pdf = pdf_loader.load()
    txt_content = ""
    for page_num in range(len(pdf)):
      page = pdf[page_num].page_content
      txt_content += page
      
    db_summary = create_summary(session, type=body.batchSize, file_id=file[0].id, summary="", user_id=currentUser.id, status=Status.PENDING)
      
    bg_tasks.add_task(call_batch_summarize, session=session, summary_id=db_summary.id, txt_content=txt_content[:500], batch_size=body.batchSize)
      
    return {"text_content": txt_content[:500], "message": "We are processing your summary request"}
  # finally:
  #   llm.unload_model()
  