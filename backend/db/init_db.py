from sqlmodel import Session, select, SQLModel
from models import User, UserCreate
from core.settings import settings
import crud
from db.engine import engine


def init_db(session: Session) -> None:
    SQLModel.metadata.create_all(bind=engine)
    user = session.exec(select(User).where(
        User.email == settings.FIRST_SUPERUSER))
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            is_superuser=True,
            password=settings.FIRST_SUPERUSER_PASSWORD
        )

        user = crud.create_user(session=session, user_create=user_in)
