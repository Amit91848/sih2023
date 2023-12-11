from sqlmodel import Session, select, SQLModel
from models import User, UserCreate
from core.settings import settings
from crud.crud_user import create_user
from db.engine import engine
from api.endpoints.dto.usercreate import UserCreate


def init_db(session: Session) -> None:
    SQLModel.metadata.create_all(bind=engine)
    user = session.query(User).where(
        User.email == settings.FIRST_SUPERUSER).all()
    if len(user) == 0:
        user_obj = UserCreate(email=settings.FIRST_SUPERUSER,
                              password=settings.FIRST_SUPERUSER_PASSWORD, is_superuser=True)
        user = create_user(session, user=user_obj)
