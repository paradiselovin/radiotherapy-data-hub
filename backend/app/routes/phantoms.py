from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import DatabaseError

from app.database import SessionLocal
from app.models.phantom import Phantom
from app.schemas.phantom import PhantomCreate

router = APIRouter(prefix="/phantoms", tags=["Phantoms"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_phantom(phantom: PhantomCreate, db: Session = Depends(get_db)):

    existing_phantom = db.query(Phantom).filter(
        Phantom.name == phantom.name,
        Phantom.phantom_type == phantom.phantom_type,
        Phantom.dimensions == phantom.dimensions,
        Phantom.material == phantom.material
    ).first()
    if existing_phantom:
        raise HTTPException(
            status_code=409,
            detail="Phantom already exists"
        )

    db_phantom = Phantom(**phantom.dict())
    db.add(db_phantom)
    
    try:
        db.commit()
    except DatabaseError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Database Error"
        )

    db.refresh(db_phantom)
    return db_phantom

@router.get("/")
def list_phantoms(db: Session = Depends(get_db)):
    return db.query(Phantom).all()
