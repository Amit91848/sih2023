import os
import secrets
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, EmailStr, HttpUrl, PostgresDsn, validator
from pydantic_settings import BaseSettings
from load_dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    PROJECT_NAME: str
    S3_BUCKET_NAME: str | None
    S3_BUCKET_REGION: str | None
    S3_SECRET_ACCESS_KEY: str | None
    S3_ACCESS_KEY: str | None
    S3_REGION_NAME: str | None
    DATABASE_URL: str | None
    FIRST_SUPERUSER: str | None
    FIRST_SUPERUSER_PASSWORD: str | None
    ACCESS_TOKEN_EXPIRE_MINUTES: int | None
    SECRET_KEY: str | None
    OPENAI_API_KEY: str | None
    PINECONE_API_KEY: str | None
    PINECONE_ENVIRONMENT: str | None

settings = Settings()
