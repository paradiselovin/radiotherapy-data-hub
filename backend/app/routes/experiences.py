from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import SessionLocal
from app.models.experience import Experience
from app.models.experience_machine import ExperienceMachine
from app.models.experience_phantom import ExperiencePhantom
from app.models.experience_detector import ExperienceDetector
from app.models.article import Article
from app.schemas.experience import ExperienceCreate

router = APIRouter(prefix="/experiences", tags=["Experiences"])

# --- Dependency pour la DB ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Create Experience ---
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_experience(experience: ExperienceCreate, db: Session = Depends(get_db)):
    # Si un `article_id` est fourni, vérifier que l'article existe
    if experience.article_id is not None:
        article = db.query(Article).filter(
            Article.article_id == experience.article_id
        ).first()

        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

    db_experience = Experience(
        description=experience.description,
        article_id=experience.article_id if experience.article_id is not None else None
    )
    db.add(db_experience)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Database conflict")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    db.refresh(db_experience)

    return {
        "experience_id": db_experience.experience_id,
        "description": db_experience.description,
        "article_id": db_experience.article_id
    }


# --- List all Experiences ---
@router.get("/")
def list_experiences(db: Session = Depends(get_db)):
    experiences = db.query(Experience).all()
    return [
        {
            "experience_id": e.experience_id,
            "description": e.description,
            "article_id": e.article_id
        }
        for e in experiences
    ]


# --- Get Summary for Wizard ---
@router.get("/{experience_id}/summary")
def get_experiment_summary(experience_id: int, db: Session = Depends(get_db)):
    experience = db.query(Experience).filter(
        Experience.experience_id == experience_id
    ).first()

    if not experience:
        raise HTTPException(status_code=404, detail="Expérience non trouvée")

    # Machines associées
    machines = [
        {
            "constructeur": m.machine.constructeur,
            "modele": m.machine.modele,
            "type_machine": m.machine.type_machine,
            "energy": m.energy,
            "collimation": m.collimation,
            "settings": m.settings,
        }
        for m in experience.machines
    ]

    # Phantoms associés
    phantoms = [
        {
            "phantom_type": p.phantom.phantom_type,
            "manufacturer": p.phantom.manufacturer,
            "model": p.phantom.model,
            "dimensions": p.phantom.dimensions,
            "material": p.phantom.material,
            "position": p.position,
            "orientation": p.orientation,
        }
        for p in experience.phantoms
    ]

    # Détecteurs associés
    detectors = [
        {
            "type_detecteur": d.detector.type_detecteur,
            "modele": d.detector.modele,
            "constructeur": d.detector.constructeur,
            "position": d.position,
            "depth": d.depth,
            "orientation": d.orientation,
        }
        for d in experience.detectors
    ]

    # Données uploadées
    data_files = [
        {
            "file_path": f.file_path,
            "data_type": f.data_type,
            "unit": f.unit,
            "description": f.description,
        }
        for f in experience.donnees
    ]

    return {
        "description": experience.description,
        "machines": machines,
        "phantoms": phantoms,
        "detectors": detectors,
        "data": data_files,
    }
