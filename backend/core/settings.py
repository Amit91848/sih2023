import os
import secrets
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, EmailStr, HttpUrl, PostgresDsn, validator
from pydantic_settings import BaseSettings
from load_dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    PROJECT_NAME: str
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    S3_BUCKET_NAME: str | None
    S3_BUCKET_REGION: str | None
    S3_SECRET_ACCESS_KEY: str | None
    S3_ACCESS_KEY: str | None


settings = Settings()
