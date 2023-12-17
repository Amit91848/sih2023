from fastapi import APIRouter

from huggingface_hub import HfApi
from core.utils import success_response

router = APIRouter()

@router.get("/{model_name}")
async def search_for_models(model_name: str):

    hf_api = HfApi()
    
    models = hf_api.list_models(search=model_name, sort="downloads", direction=-1, limit=15, full=True)

    res_model = []

    for model in models:
       res_model.append(model) 

    return success_response(data=res_model)

    
@router.get("/{model_user}/{model_id}/info")
async def search_model_info(model_id: str, model_user):
    hf_api = HfApi()
    
    info = hf_api.repo_info(repo_id=f"{model_user}/{model_id}", token="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", files_metadata=True)

    return success_response(data=info)
    