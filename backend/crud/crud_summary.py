from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from models import Summary, File
from typing import Optional
from core.types import BatchSize, Status
from sqlmodel import select

def create_summary(db: Session, type: BatchSize, file_id: int, summary: str, user_id: int, status: Status):
    db_summary = Summary(type=type, file_id=file_id, summary=summary, user_id=user_id, status=status)
    db.add(db_summary)
    db.commit()
    db.refresh(db_summary)
    return db_summary

def update_summary(db:Session, summary_id: int, status: Optional[Status], summary: Optional[str]):
    db_summary = db.query(Summary).filter(Summary.id == summary_id).first()
    if db_summary:
        if status is not None:
            db_summary.status = status
        if summary is not None:
            db_summary.summary = summary
            db_summary.updated_at = datetime.now()
        
        # Commit the changes to the database
        db.commit()
        # Refresh the summary in the session
        db.refresh(db_summary)

    return db_summary

def get_latest_summary(db: Session, file_id: int):
    file_latest_summary = db.query(Summary).filter(Summary.file_id == file_id).order_by(desc(Summary.updated_at)).first()
    return file_latest_summary

def get_all_summaries_by_file_id(db: Session, file_id: int, type: BatchSize):
    summary =  db.query(Summary).filter(Summary.file_id == file_id, Summary.type == type).order_by(desc(Summary.updated_at)).first()
    return summary

def get_short_summary(db: Session, file_id: int):
    summary = db.query(Summary).filter(Summary.file_id == file_id, Summary.type == 0).order_by(desc(Summary.updated_at)).first()
    
    return summary

# def get_user_files(db: Session, user_id: int):
#     files = db.query(File).filter(File.user_id == user_id).all()

#     return files


# def delete_user_file(db: Session, user_id: int, file_id: int):
#     file = db.query(File).filter(
#         File.id == file_id, File.user_id == user_id).delete()

#     db.commit()

#     return file


# def get_user_file(db: Session, user_id: int, file_id: int):
#     file = db.query(File).filter(File.id == file_id,
#                                  File.user_id == user_id).all()

#     return file
