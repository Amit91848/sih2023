from crud.base import CRUDBase
from typing import Any, Dict, Optional, Union

from sqlalchemy.orm import Session

from models import File
from core.security import get_password_hash, verify_password


def create_file(db: Session, name: str, url: str, key: str, user_id: int, isLocal: bool, size: int, ocrText: str, ocrOgImage: str, isPdf: bool = True):
    db_file = File(name=name, url=url, key=key, user_id=user_id, isLocal=isLocal, size=size, isPdf=isPdf, ocrOgImage=ocrOgImage, ocrText=ocrText)
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file


def get_user_files(db: Session, user_id: int):
    files = db.query(File).filter(File.user_id == user_id).all()

    return files


def delete_user_file(db: Session, user_id: int, file_id: int):
    file = db.query(File).filter(
        File.id == file_id, File.user_id == user_id).delete()

    db.commit()

    return file


def get_user_file(db: Session, user_id: int, file_id: int):
    file = db.query(File).filter(File.id == file_id,
                                 File.user_id == user_id).all()

    return file
