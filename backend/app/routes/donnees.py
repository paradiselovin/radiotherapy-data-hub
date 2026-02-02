import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import DatabaseError

from app.database import SessionLocal
from app.models.donnee import Donnee
from app.models.experience import Experience
from app.schemas.donnee import DonneeCreate

router = APIRouter(prefix="/donnees", tags=["Donnees"])

UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload/{experience_id}", status_code=status.HTTP_201_CREATED)
def upload_donnee(
    experience_id: int,
    file: UploadFile = File(...),
    data_type: str = Form(...),
    unit: str = Form(None),
    description: str = Form(None),
    db: Session = Depends(get_db),
):
    # Vérifier que l'expérience existe
    experience = db.query(Experience).filter(Experience.experience_id == experience_id).first()
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    
    donnee_data = DonneeCreate(
        data_type=data_type,
        unit=unit,
        file_format=file.filename.split(".")[-1],
        description=description,
    )

    # Saving the file
    file_path = f"{UPLOAD_DIR}/{experience_id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Database insertion
    donnee = Donnee(
        experience_id=experience_id,
        data_type=donnee_data.data_type,
        unit=donnee_data.unit,
        file_format=donnee_data.file_format,
        file_path=file_path,
        description=donnee_data.description,
    )

    db.add(donnee)
    try:
        db.commit()
    except DatabaseError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Database Error"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
    )

    db.refresh(donnee)
    return donnee

@router.get("/")
def list_donnees(db: Session = Depends(get_db)):
    return db.query(Donnee).all()
