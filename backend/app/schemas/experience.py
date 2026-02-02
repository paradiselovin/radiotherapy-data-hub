from pydantic import BaseModel
from typing import Optional

class ExperienceCreate(BaseModel):
    description: str
    article_id: Optional[int] = None


class ExperienceOut(ExperienceCreate):
    experience_id: int

    class Config:
        orm_mode = True
