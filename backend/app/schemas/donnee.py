from pydantic import BaseModel, validator
from typing import Optional, List

class ColumnMappingBase(BaseModel):
    column_name: str
    column_description: Optional[str] = None
    data_type: str
    unit: Optional[str] = None

class DonneeCreate(BaseModel):
    data_type: str
    unit: Optional[str] = None
    file_format: str
    description: Optional[str] = None
    column_mappings: Optional[List[ColumnMappingBase]] = None  # Store column metadata with donnee

    @validator("unit")
    def check_unit(cls, v):
        if v is None:
            return v
        v = v.strip()
        # Normalize to standard format: Gy, mGy, cGy (case-insensitive input)
        allowed_normalized = {"gy": "Gy", "mgy": "mGy", "cgy": "cGy"}
        v_lower = v.lower()
        if v_lower not in allowed_normalized:
            raise ValueError(f"Unité invalide : {v}. Valeurs acceptées: Gy, mGy, cGy")
        return allowed_normalized[v_lower]
        
class DonneeOut(DonneeCreate):
    data_id: int
    experience_id: int
    file_path: str

    class Config:
        from_attributes = True
