from typing import Generator, Annotated
from sqlmodel import Session

from db.engine import engine

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from models import User, TokenPayload
from jose import jwt, JWTError
from core.settings import settings
from core.security import ALGORITHM
from pydantic import ValidationError


def get_db() -> Generator:
    with Session(engine) as session:
        yield session


reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"/api/login/access-token"
)


SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]


def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=ALGORITHM)
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Could not validate credentials")

    user = session.get(User, token_data.sub)
    if not user:
        print("Cookie user not found")
        raise HTTPException(status_code=404, detail="User not found")
    return user


def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


CurrentUser = Annotated[User, Depends(get_current_active_user)]


def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user
