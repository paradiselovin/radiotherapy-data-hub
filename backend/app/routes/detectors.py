from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import DatabaseError

from app.database import SessionLocal
from app.models.detector import Detector
from app.schemas.detector import DetectorCreate
from app.services.entity_management import get_or_create_detector

router = APIRouter(prefix="/detectors", tags=["Detectors"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_detector(detector: DetectorCreate, db: Session = Depends(get_db)):
    """
    Crée un détecteur ou retourne le détecteur existant si il existe déjà.
    
    Critères de recherche: type_detecteur + modele + constructeur
    """
    try:
        # Get or create (reuses if exists)
        db_detector = get_or_create_detector(
            db,
            type_detecteur=detector.type_detecteur,
            modele=detector.modele,
            constructeur=detector.constructeur
        )
        
        # Commit
        db.commit()
        db.refresh(db_detector)
        
        return db_detector
        
    except DatabaseError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Database Error"
        )

@router.get("/")
def list_detectors(db: Session = Depends(get_db)):
    return db.query(Detector).all()

@router.get("/types")
def get_detector_types(db: Session = Depends(get_db)):
    """
    Retourne la liste des types de détecteurs existants (sans doublons).
    """
    types = db.query(Detector.type_detecteur).distinct().all()
    return [t[0] for t in types if t[0] is not None]

@router.get("/manufacturers/{detector_type}")
def get_manufacturers(detector_type: str, db: Session = Depends(get_db)):
    """
    Retourne la liste des fabricants pour un type de détecteur donné.
    
    Exemple: GET /detectors/manufacturers/Ion%20Chamber
    """
    manufacturers = db.query(Detector.constructeur).filter(
        Detector.type_detecteur == detector_type
    ).distinct().all()
    return [m[0] for m in manufacturers if m[0] is not None]

@router.get("/models/{detector_type}/{manufacturer}")
def get_models(detector_type: str, manufacturer: str, db: Session = Depends(get_db)):
    """
    Retourne la liste des modèles pour un type de détecteur et un fabricant donnés.
    
    Exemple: GET /detectors/models/Ion%20Chamber/Varian
    """
    models = db.query(Detector.modele).filter(
        Detector.type_detecteur == detector_type,
        Detector.constructeur == manufacturer
    ).distinct().all()
    return [m[0] for m in models if m[0] is not None]
