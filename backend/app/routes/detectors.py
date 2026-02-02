from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import DatabaseError

from app.database import SessionLocal
from app.models.detector import Detector
from app.schemas.detector import DetectorCreate

router = APIRouter(prefix="/detectors", tags=["Detectors"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_detector(detector: DetectorCreate, db: Session = Depends(get_db)):

    # Pre-verifying
    existing_detector = db.query(Detector).filter(
        Detector.type_detecteur == detector.type_detecteur,
        Detector.modele == detector.modele,
        Detector.constructeur == detector.constructeur
    ).first()
    if existing_detector:
        raise HTTPException(
            status_code=409,
            detail="Detector already exists"
        )
    
    db_detector = Detector(
        type_detecteur=detector.type_detecteur,
        modele=detector.modele,
        constructeur=detector.constructeur
    )
    db.add(db_detector)

    try:
        db.commit()
    except DatabaseError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Database Error"
        )
    
    db.refresh(db_detector)
    return db_detector

@router.get("/")
def list_detectors(db: Session = Depends(get_db)):
    return db.query(Detector).all()
