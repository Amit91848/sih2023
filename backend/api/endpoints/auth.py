from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from .dto.usercreate import UserCreate
from core.settings import settings
from api import deps
from crud.crud_user import user, get_user_by_email, create_user, authenticate_user
from api.deps import (SessionDep, get_current_user, CurrentUser)
# from crud import create_user
from core.security import create_access_token
from datetime import timedelta
from pydantic import BaseModel

router = APIRouter()


@router.post("/test-token")
async def test_token():
    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token("23", access_token_expires)
    }


@router.post('/register')
async def register_user(user: UserCreate, db: Session = Depends(deps.get_db)):
    user_already_exists = get_user_by_email(db=db, email=user.email)

    if user_already_exists:
        raise HTTPException(
            status_code=409, detail="User with this email already exists")

    new_user = create_user(db, user)
    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    return {
        "access_token": create_access_token(new_user.id, access_token_expires)
    }


@router.post('/login/access-token')
async def login_user(user: UserCreate, db: Session = Depends(deps.get_db)):
    db_user = authenticate_user(db, user)

    if not db_user:
        raise HTTPException(
            status_code=400, detail="Incorrect email or password")

    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    return {
        "access_token": create_access_token(db_user.id, access_token_expires)
    }


class UserOut(BaseModel):
    id: int
    email: str


@router.post("/me")
async def me(session: SessionDep, current_user: CurrentUser) -> UserOut:
    return current_user
