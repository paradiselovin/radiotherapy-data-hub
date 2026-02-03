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
    
    Critères de recherche: name + phantom_type
    (dimensions et material peuvent varier pour le même fantôme)
    """
    try:
        # Get or create (reuses if exists)
        db_phantom = get_or_create_phantom(
            db,
            name=phantom.name,
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

@router.get("/types")
def get_phantom_types(db: Session = Depends(get_db)):
    """
    Retourne la liste des types de fantômes existants (sans doublons).
    """
    types = db.query(Phantom.phantom_type).distinct().all()
    return [t[0] for t in types if t[0] is not None]

@router.get("/names/{phantom_type}")
def get_names(phantom_type: str, db: Session = Depends(get_db)):
    """
    Retourne la liste des noms de fantômes pour un type donné.
    
    Exemple: GET /phantoms/names/RW3%20Slab
    """
    names = db.query(Phantom.name).filter(
        Phantom.phantom_type == phantom_type
    ).distinct().all()
    return [n[0] for n in names if n[0] is not None]

@router.get("/dimensions/{phantom_type}/{name}")
def get_dimensions(phantom_type: str, name: str, db: Session = Depends(get_db)):
    """
    Retourne la liste des dimensions pour un type et un nom de fantôme donnés.
    
    Exemple: GET /phantoms/dimensions/RW3%20Slab/RW3
    """
    dimensions = db.query(Phantom.dimensions).filter(
        Phantom.phantom_type == phantom_type,
        Phantom.name == name
    ).distinct().all()
    return [d[0] for d in dimensions if d[0] is not None]
