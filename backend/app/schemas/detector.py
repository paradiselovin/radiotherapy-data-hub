from pydantic import BaseModel
from typing import Optional

class DetectorCreate(BaseModel):
    type_detecteur: Optional[str] = None
    modele: Optional[str] = None
    constructeur: Optional[str] = None

class DetectorOut(DetectorCreate):
    detecteur_id: int

    class Config:
        orm_mode = True
