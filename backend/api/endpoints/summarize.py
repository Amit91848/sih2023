from fastapi import APIRouter
from pydantic import BaseModel
from api.deps import LLMModelDep
import gc

class Summarize(BaseModel):
    input_txt: str

router = APIRouter()

@router.post("/summarize")
async def summarize_text(llm: LLMModelDep,body: Summarize):
  try:
    summary = llm.summarize(text=body.input_txt)
    return {"input_text": body.input_txt, "summary": summary}
  finally:
    llm.unload_model()
  