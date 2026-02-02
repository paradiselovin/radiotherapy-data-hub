from pydantic import BaseModel
from typing import Optional

class ArticleCreate(BaseModel):
    titre: str
    auteurs: Optional[str] = None
    doi: Optional[str] = None

class ArticleOut(ArticleCreate):
    article_id: int

    class Config:
        from_attributes = True

class ArticleOut(ArticleCreate):
    article_id: int

    class Config:
        orm_mode = True
