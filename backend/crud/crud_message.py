from typing import Optional, List, Dict
from models import User, File, Message
from sqlmodel import Session, select, column
from sqlalchemy import desc, asc, text

from fastapi import HTTPException, status

from .crud_file import get_user_file


def format_message(message):
    return {
        "role": "user" if message.isUserMessage else "assistant",
        "content": message.text,
    }


def create_message(db: Session, file_id: int, user_id: int, message: str, isUser: bool = True):
    db_message = Message(user_id=user_id, file_id=file_id,
                         isUserMessage=isUser, text=message)

    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def get_all_messages(db: Session, cursor: Optional[int], file_id: int, limit: Optional[int] = 10):
    query = select(Message).limit(limit).where(
        Message.file_id == file_id).order_by(desc(Message.created_at))

    if cursor:
        query = query.where(Message.id > cursor)

    messages = db.exec(query).all()

    has_more = len(messages) >= limit
    return messages, has_more


def find_prev_messages(db: Session, file_id: int, user_id: int, count: int = 10) -> List[Optional[Message]]:
    messages = db.query(Message).filter(Message.file_id == file_id, Message.user_id ==
                                        user_id).order_by(Message.created_at.asc()).limit(count).all()

    return messages
