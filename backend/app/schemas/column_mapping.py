from pydantic import BaseModel
from typing import Optional

class ColumnMappingCreate(BaseModel):
    column_name: str
    column_description: Optional[str] = None
    data_type: str  # numeric, categorical, text, datetime
    unit: Optional[str] = None

class ColumnMappingOut(ColumnMappingCreate):
    mapping_id: int
    data_id: int

    class Config:
        from_attributes = True
