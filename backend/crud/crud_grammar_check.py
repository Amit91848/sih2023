from datetime import datetime
from sqlalchemy.orm import Session
from models import  GrammarCheck
from typing import Optional
from core.types import  Status
from core.utils import clean_text

def get_grammar_check(db: Session, file_id: int):
    db_grammar_check = db.query(GrammarCheck).filter(GrammarCheck.file_id == file_id).first()
    return db_grammar_check

def create_grammar_check(db: Session, input_text: str, corrected_text: str, file_id: int, user_id: int, status: Status):
    input_text = clean_text(text=input_text)
    db_grammar_check = GrammarCheck(input_text=input_text, corrected_text=corrected_text, file_id=file_id, user_id=user_id, status=status)
    db.add(db_grammar_check)
    db.commit()
    db.refresh(db_grammar_check)
    return db_grammar_check

def update_grammar_check(db: Session, grammar_check_id: int,status: Optional[Status], corrected_text: Optional[str]):
    db_grammar_check = db.query(GrammarCheck).filter(GrammarCheck.id == grammar_check_id).first()
    if db_grammar_check:
        if status is not None:
            db_grammar_check.status = status
        if corrected_text is not None:
            db_grammar_check.corrected_text = corrected_text
            db_grammar_check.updated_at = datetime.now()
        
        # Commit the changes to the database
        db.commit()
        # Refresh the summary in the session
        db.refresh(db_grammar_check)