from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import DatabaseError

from app.database import SessionLocal
from app.models.machine import Machine
from app.schemas.machine import MachineCreate
from app.services.entity_management import get_or_create_machine

router = APIRouter(prefix="/machines", tags=["Machines"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_machine(machine: MachineCreate, db: Session = Depends(get_db)):
    """
    Crée une machine ou retourne la machine existante si elle existe déjà.
    
    Critères de recherche: constructeur + modele + type_machine
    """
    try:
        # Get or create (reuses if exists)
        db_machine = get_or_create_machine(
            db,
            constructeur=machine.constructeur,
            modele=machine.modele,
            type_machine=machine.type_machine,
        )
        
        # Commit only if this is a new machine (has no ID in DB yet)
        db.commit()
        db.refresh(db_machine)
        
        return db_machine
        
    except DatabaseError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Database Error"
        )

@router.get("/")
def list_machines(db: Session = Depends(get_db)):
    return db.query(Machine).all()

@router.get("/types")
def get_machine_types(db: Session = Depends(get_db)):
    """
    Retourne la liste des types de machines existants (sans doublons).
    """
    types = db.query(Machine.type_machine).distinct().all()
    return [t[0] for t in types if t[0] is not None]

@router.get("/manufacturers/{machine_type}")
def get_manufacturers(machine_type: str, db: Session = Depends(get_db)):
    """
    Retourne la liste des fabricants pour un type de machine donné.
    
    Exemple: GET /machines/manufacturers/Linear%20Accelerator
    """
    manufacturers = db.query(Machine.constructeur).filter(
        Machine.type_machine == machine_type
    ).distinct().all()
    return [m[0] for m in manufacturers if m[0] is not None]

@router.get("/models/{machine_type}/{manufacturer}")
def get_models(machine_type: str, manufacturer: str, db: Session = Depends(get_db)):
    """
    Retourne la liste des modèles pour un type de machine et un fabricant donnés.
    
    Exemple: GET /machines/models/Linear%20Accelerator/Varian
    """
    models = db.query(Machine.modele).filter(
        Machine.type_machine == machine_type,
        Machine.constructeur == manufacturer
    ).distinct().all()
    return [m[0] for m in models if m[0] is not None]
