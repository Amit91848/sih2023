from crud.base import CRUDBase
from typing import Any, Dict, Optional, Union

from sqlalchemy.orm import Session

from models import UserCreate, User, UserUpdate
from api.endpoints.dto.usercreate import UserCreate
from core.security import get_password_hash, verify_password


def get_user_by_email(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
    return user


def create_user(db: Session, user: UserCreate) -> User:
    db_user = User(email=user.email,
                   hashed_password=get_password_hash(user.password))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, user: UserCreate) -> Optional[User]:
    db_user = get_user_by_email(db, user.email)

    if not db_user:
        return None
    if not verify_password(user.password, db_user.hashed_password):
        return None

    return db_user


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        db_obj = User(
            email=obj_in.email,
            hashed_password=get_password_hash(obj_in.password),
            full_name=obj_in.full_name,
            is_superuser=obj_in.is_superuser,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        if update_data["password"]:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def is_active(self, user: User) -> bool:
        return user.is_active

    def is_superuser(self, user: User) -> bool:
        return user.is_superuser


user = CRUDUser(User)
