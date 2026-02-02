from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.experience_phantom import ExperiencePhantom
from app.models.phantom import Phantom
from app.models.experience import Experience
from app.schemas.experience_phantom import ExperiencePhantomCreate, ExperiencePhantomOut

router = APIRouter(prefix="/experiences", tags=["Experience-Phantom"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/{experience_id}/phantoms", response_model=ExperiencePhantomOut, status_code=status.HTTP_201_CREATED)
def add_phantom_to_experience(
    experience_id: int,
    payload: ExperiencePhantomCreate,
    db: Session = Depends(get_db),
):
    # Vérifier que l'expérience existe
    experience = db.query(Experience).filter(Experience.experience_id == experience_id).first()
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    
    # Vérifier que le phantom existe
    phantom = db.query(Phantom).filter(Phantom.phantom_id == payload.phantom_id).first()
    if not phantom:
        raise HTTPException(status_code=404, detail="Phantom not found")
    
    # Vérifier que la liaison n'existe pas déjà
    existing = db.query(ExperiencePhantom).filter(
        ExperiencePhantom.experience_id == experience_id,
        ExperiencePhantom.phantom_id == payload.phantom_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Phantom already linked to this experience")
    
    link = ExperiencePhantom(
        experience_id=experience_id,
        phantom_id=payload.phantom_id
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return link
