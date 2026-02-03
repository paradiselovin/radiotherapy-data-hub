from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import DatabaseError

from app.database import SessionLocal
from app.models.phantom import Phantom
from app.schemas.phantom import PhantomCreate
from app.services.entity_management import get_or_create_phantom

router = APIRouter(prefix="/phantoms", tags=["Phantoms"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_phantom(phantom: PhantomCreate, db: Session = Depends(get_db)):
    """
    Crée un fantôme ou retourne le fantôme existant si il existe déjà.
    
    Critères de recherche: manufacturer + model + phantom_type
    (dimensions et material peuvent varier pour le même fantôme)
    """
    try:
        # Get or create (reuses if exists)
        db_phantom = get_or_create_phantom(
            db,
            manufacturer=phantom.manufacturer,
            model=phantom.model,
            phantom_type=phantom.phantom_type,
            dimensions=phantom.dimensions,
            material=phantom.material
        )
        
        # Commit
        db.commit()
        db.refresh(db_phantom)
        
        return db_phantom
        
    except DatabaseError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Database Error"
        )

@router.get("/")
def list_phantoms(db: Session = Depends(get_db)):
    return db.query(Phantom).all()

@router.get("/manufacturers/{phantom_type}")
def get_manufacturers(phantom_type: str, db: Session = Depends(get_db)):
    """
    Retourne la liste des fabricants de fantômes pour un type donné.
    
    Exemple: GET /phantoms/manufacturers/homogeneous
    """
    manufacturers = db.query(Phantom.manufacturer).filter(
        Phantom.phantom_type == phantom_type
    ).distinct().all()
    return [m[0] for m in manufacturers if m[0] is not None]

@router.get("/models/{phantom_type}")
def get_models(phantom_type: str, db: Session = Depends(get_db)):
    """
    Retourne la liste des modèles de fantômes pour un type donné.
    
    Exemple: GET /phantoms/models/homogeneous
    """
    models = db.query(Phantom.model).filter(
        Phantom.phantom_type == phantom_type
    ).distinct().all()
    return [m[0] for m in models if m[0] is not None]

@router.get("/dimensions/{phantom_type}/{manufacturer}/{model}")
def get_dimensions(phantom_type: str, manufacturer: str, model: str, db: Session = Depends(get_db)):
    """
    Retourne la liste des dimensions pour un type, fabricant et modèle donnés.
    
    Exemple: GET /phantoms/dimensions/homogeneous/IAEA/Water%20Phantom
    """
    dimensions = db.query(Phantom.dimensions).filter(
        Phantom.phantom_type == phantom_type,
        Phantom.manufacturer == manufacturer,
        Phantom.model == model
    ).distinct().all()
    return [d[0] for d in dimensions if d[0] is not None]
