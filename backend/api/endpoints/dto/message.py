from typing import Optional
from pydantic import BaseModel


class GetAllMessage(BaseModel):
    limit: int = 10
    cursor: Optional[int] = None
