from fastapi import APIRouter


from api.endpoints import file, auth, message, summarize,  compute

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(file.router, prefix="/file", tags=["files"])
api_router.include_router(message.router, prefix="/message", tags=["messages"])
api_router.include_router(summarize.router, prefix="/llm", tags=["llm"])
api_router.include_router(compute.router, prefix="/compute", tags=["compute"])