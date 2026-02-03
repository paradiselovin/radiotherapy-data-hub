import re
from pydantic import BaseModel, validator
from typing import Optional

class PhantomCreate(BaseModel):
    phantom_type: Optional[str] = None
    manufacturer: Optional[str] = None
    model: str  # Required
    dimensions: Optional[str] = None
    material: Optional[str] = None

    @validator("dimensions")
    def dimensions_format(cls, v):
        if v is None:
            return v
        pattern = r"^\d+x\d+x\d+$"
        if not re.match(pattern, v):
            raise ValueError(
                "Invalid dimensions format (expected: NxNxN, e.g. 10x10x10)"
            )
        return v


class PhantomOut(PhantomCreate):
    phantom_id: int

    class Config:
        orm_mode = True