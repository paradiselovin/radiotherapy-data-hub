from pydantic import BaseModel
from typing import Optional

class ExperienceDetectorCreate(BaseModel):
    detector_id: int
    position: Optional[str] = None
    depth: Optional[str] = None
    orientation: Optional[str] = None

class ExperienceDetectorOut(ExperienceDetectorCreate):
    experience_id: int

    class Config:
        orm_mode = True
