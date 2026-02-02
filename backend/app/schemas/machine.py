from pydantic import BaseModel
from typing import Optional

class MachineCreate(BaseModel):
    constructeur: Optional[str] = None
    modele: str
    type_machine: Optional[str] = None

class MachineOut(MachineCreate):
    machine_id: int

    class Config:
        orm_mode = True
