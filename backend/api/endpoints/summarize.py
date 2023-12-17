from fastapi import APIRouter, HTTPException, status, BackgroundTasks, Request
from api.deps import create_summarizer_model_service, create_grammar_check_model_service, SessionDep, CurrentUser
from pydantic import BaseModel
from crud.crud_file import get_user_file
from crud.crud_summary import create_summary, update_summary
from crud.crud_grammar_check import create_grammar_check, update_grammar_check
from langchain.document_loaders.pdf import PyMuPDFLoader
from core.types import BatchSize,Status
from datetime import datetime

class SummarizeBody(BaseModel):
  fileId: int
  batchSize: BatchSize
  
class SummarizeText(BaseModel):
  text: str
  batchSize: BatchSize

class GrammarBody(BaseModel):
  fileId: int

router = APIRouter()

def call_batch_summarize(request: Request, session: SessionDep, txt_content: str, summary_id: int, batch_size: BatchSize):
  llm = create_summarizer_model_service()
  request.app.state.current_model = llm
  full_summary = llm.batch_summarize(text=txt_content[:2000], batch_size=batch_size)
  update_summary(db=session, summary_id=summary_id, status=Status.SUCCESS, summary=full_summary)
  request.app.state.current_model = None
  return full_summary

def call_grammar_check(request: Request, session: SessionDep, txt_content: str, grammar_check_id: int):
  llm = create_grammar_check_model_service()
  request.app.state.current_model = llm
  corrected_text = llm.grammar_check(text=txt_content[:2000])
  update_grammar_check(db=session, grammar_check_id=grammar_check_id, status=Status.SUCCESS, corrected_text=corrected_text)
  request.app.state.current_model = None
  return corrected_text

@router.post("/grammar-check")
async def grammar_check(request: Request, currentUser: CurrentUser, session: SessionDep, body: GrammarBody, bg_tasks: BackgroundTasks):  
    file = get_user_file(db=session, user_id=currentUser.id, file_id=body.fileId)

    if not file:
      raise HTTPException(status=status.HTTP_404, detail="File not found")

    pdf_loader = PyMuPDFLoader(file_path=file[0].url)
    pdf = pdf_loader.load()
    txt_content = ""
    for page_num in range(len(pdf)):
      page = pdf[page_num].page_content
      txt_content += page
      
    db_grammar_check  = create_grammar_check(session, input_text=txt_content, file_id=file[0].id, corrected_text="", user_id=currentUser.id, status=Status.PENDING)
    
    bg_tasks.add_task(call_grammar_check, request=request, session=session, grammar_check_id=db_grammar_check.id, txt_content=txt_content)

    return {"text_content": txt_content}
  
@router.post("/summarizeText")
async def summarize_text(request: Request, currentUser: CurrentUser, body: SummarizeText):
  start_time = datetime.now()
  
  llm = create_summarizer_model_service()
  request.app.state.current_model = llm
  full_summary = llm.batch_summarize(text=body.text, batch_size=body.batchSize)
  request.app.state.current_model = None
  
  end_time = datetime.now()
  elapsed_time = end_time - start_time
  
  return {"summary": full_summary, "time_taken": elapsed_time}

@router.post("/summarize")
async def summarize_doc(request: Request, session: SessionDep, currentUser: CurrentUser, body: SummarizeBody, bg_tasks: BackgroundTasks):
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
      
    bg_tasks.add_task(call_batch_summarize, request=request, session=session, summary_id=db_summary.id, txt_content=txt_content, batch_size=body.batchSize)
    # summary = call_batch_summarize(request=request, session=session, summary_id=1, txt_content=txt_content[:20000], batch_size=body.batchSize)
      
    return {"text_content": txt_content}
  # finally:
  #   llm.unload_model()
  