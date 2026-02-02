from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.experience_detector import ExperienceDetector
from app.models.detector import Detector
from app.models.experience import Experience
from app.schemas.experience_detector import (
    ExperienceDetectorCreate,
    ExperienceDetectorOut,
)

router = APIRouter(prefix="/experiences", tags=["Experience-Detector"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/{experience_id}/detectors", response_model=ExperienceDetectorOut, status_code=status.HTTP_201_CREATED)
def add_detector_to_experience(
    experience_id: int,
    payload: ExperienceDetectorCreate,
    db: Session = Depends(get_db),
):
    # Vérifier que l'expérience existe
    experience = db.query(Experience).filter(Experience.experience_id == experience_id).first()
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    
    # Vérifier que le détecteur existe
    detector = db.query(Detector).filter(Detector.detecteur_id == payload.detector_id).first()
    if not detector:
        raise HTTPException(status_code=404, detail="Detector not found")
    
    # Vérifier que la liaison n'existe pas déjà
    existing = db.query(ExperienceDetector).filter(
        ExperienceDetector.experience_id == experience_id,
        ExperienceDetector.detector_id == payload.detector_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Detector already linked to this experience")
    
    link = ExperienceDetector(
        experience_id=experience_id,
        detector_id=payload.detector_id,
        position=payload.position,
        depth=payload.depth,
        orientation=payload.orientation
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return link
