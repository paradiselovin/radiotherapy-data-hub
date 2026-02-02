from pydantic import BaseModel, validator
from typing import Optional

class DonneeCreate(BaseModel):
    data_type: str
    unit: Optional[str] = None
    file_format: str
    description: Optional[str] = None

    @validator("unit")
    def check_unit(cls, v):
        if v is None:
            return v
        v = v.strip()
        allowed = {"Gy", "mGy", "cGy"}
        if v not in allowed:
            raise ValueError(f"Unité invalide : {v}")
        return v
        
class DonneeOut(DonneeCreate):
    data_id: int
    experience_id: int
    file_path: str

    class Config:
        orm_mode = True
