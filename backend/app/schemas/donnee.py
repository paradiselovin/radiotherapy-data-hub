from pydantic import BaseModel
from typing import Optional, List

class ColumnMappingBase(BaseModel):
    column_name: str
    column_description: Optional[str] = None
    data_type: str
    unit: Optional[str] = None

class DonneeCreate(BaseModel):
    data_type: str
    file_format: str
    description: Optional[str] = None
    column_mappings: Optional[List[ColumnMappingBase]] = None  # Store column metadata with donnee
        
class DonneeOut(DonneeCreate):
    data_id: int
    experience_id: int
    file_path: str

    class Config:
        from_attributes = True
