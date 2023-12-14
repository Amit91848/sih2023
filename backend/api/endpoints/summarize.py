from fastapi import APIRouter, HTTPException
from api.deps import LLMModelDep
import requests
from PyPDF2 import PdfReader

router = APIRouter()

@router.get("/summarize")
async def summarize_text(llm: LLMModelDep):
  # try:
    # return {"input_text": body.input_txt, "summary": summary}
  # finally:
    # llm.unload_model()
  try:
    
    # res.raise_for_status()
    # pdf_content = io.BytesIO(requests.get("https://phoenix-alpha-images.s3.amazonaws.com/17effe52cb1b90205bda_drylab.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAZFR6HXDKQZFW32FE%2F20231213%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20231213T160551Z&X-Amz-Expires=518400&X-Amz-SignedHeaders=host&X-Amz-Signature=e662b5bd40bb2e7e8b65d2aeb589195e487f4a44945eacfa61e4cf269a1c419e").content)
  
    pdf_doc = PdfReader(r"C:\Users\adwai\Downloads\bitcoin.pdf")
    txt_content = ""
    for page_num in range(len(pdf_doc.pages)):
      page = pdf_doc.pages[page_num]
      txt_content += page.extract_text()
    
    summary = llm.batch_summarize(text=txt_content, batch_size=512)
    return {"text_content": txt_content, "summary": summary}
  except requests.exceptions.RequestException as e:
    raise HTTPException(status_code=500, detail=f"Error downloading PDF: {str(e)}")

  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
  finally:
    llm.unload_model()
  