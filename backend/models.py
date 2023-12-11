from typing import Union, List, Type, Dict, Any
from pydantic import BaseModel, EmailStr
from sqlmodel import Field, Relationship, SQLModel, ForeignKey, Enum, DATETIME, Text
from datetime import datetime
from sqlalchemy import Column


# class UploadStatus(str, Enum):
#     PENDING = "PENDING"
#     PROCESSING = "PROCESSING"
#     FAILED = "FAILED"
#     SUCCESS = "SUCCESS"


class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    is_active: bool = True
    is_superuser: bool = False
    full_name: Union[str, None] = None


class Message(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True, index=True, unique=True)
    text: str = Field(Text)

    isUserMessage: bool = Field()

    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    user: "User" = Relationship(back_populates="messages")
    user_id: int = Field(foreign_key="user.id")

    file: "File" = Relationship(back_populates="messages")
    file_id: int = Field(foreign_key="file.id")


class File(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True, index=True, unique=True)
    name: str
    url: str
    key: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    user_id: int = Field(foreign_key="user.id")  # Define the foreign key here
    user: "User" = Relationship(back_populates="files")

    messages: List["Message"] = Relationship(back_populates="file", sa_relationship_kwargs={
                                             "cascade": "all, delete-orphan"})


class User(UserBase, table=True):
    id: Union[int, None] = Field(default=None, primary_key=True)
    hashed_password: str

    files: List[File] = Relationship(back_populates="user")
    messages: List["Message"] = Relationship(back_populates="user")


class UserCreate(UserBase):
    password: str


class UserUpdate(UserBase):
    email: Union[str, None] = None
    password: Union[str, None] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: Union[int, None] = None
