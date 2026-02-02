from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.experience_machine import ExperienceMachine
from app.models.machine import Machine
from app.models.experience import Experience
from app.schemas.experience_machine import ExperienceMachineCreate, ExperienceMachineOut

router = APIRouter(prefix="/experiences", tags=["Experience-Machine"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/{experience_id}/machines", response_model=ExperienceMachineOut, status_code=status.HTTP_201_CREATED)
def add_machine_to_experience(
    experience_id: int,
    payload: ExperienceMachineCreate,
    db: Session = Depends(get_db),
):
    # Vérifier que l'expérience existe
    experience = db.query(Experience).filter(Experience.experience_id == experience_id).first()
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    
    # Vérifier que la machine existe
    machine = db.query(Machine).filter(Machine.machine_id == payload.machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    # Vérifier que la liaison n'existe pas déjà
    existing = db.query(ExperienceMachine).filter(
        ExperienceMachine.experience_id == experience_id,
        ExperienceMachine.machine_id == payload.machine_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Machine already linked to this experience")
    
    link = ExperienceMachine(
        experience_id=experience_id,
        machine_id=payload.machine_id,
        energy=payload.energy,
        collimation=payload.collimation,
        settings=payload.settings
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return link

