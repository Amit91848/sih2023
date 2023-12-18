import logging
from typing import Union
from starlette.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import logging

from sqlmodel import Session

from db.engine import engine, get_session
from core.settings import settings
from api.api import api_router

from db.init_db import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init() -> None:
    with Session(engine) as session:
        init_db(session)


def main() -> None:
    if not settings.PINECONE_API_KEY and not settings.PINECONE_ENVIRONMENT:
        print("Pinecone not present")
    else:
        print("Pinecone present")
    logger.info("Creating initial data")
    init()
    logger.info("Initial data created")


main()

app = FastAPI(
    title=settings.PROJECT_NAME,
)

# if settings.BACKEND_CORS_ORIGINS:
app.add_middleware(
    CORSMiddleware,
    # allow_origins=[str(origin)
    #                for origin in settings.BACKEND_CORS_ORIGINS],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": settings.PROJECT_NAME}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


app.include_router(api_router, prefix="/api")
