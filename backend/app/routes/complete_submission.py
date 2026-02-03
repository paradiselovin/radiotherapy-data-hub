"""
Endpoint pour créer une soumission complète (article, expérience, données) en une seule transaction.
Cela garantit que soit tout est créé, soit rien n'est créé (atomicité).
"""
import json
import shutil
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import DatabaseError, IntegrityError

from app.database import SessionLocal
from app.models.article import Article
from app.models.experience import Experience
from app.models.donnee import Donnee
from app.models.experience_machine import ExperienceMachine
from app.models.experience_detector import ExperienceDetector
from app.models.experience_phantom import ExperiencePhantom
from app.models.column_mapping import ColumnMapping
from app.services.entity_management import (
    get_or_create_machine,
    get_or_create_detector,
    get_or_create_phantom,
)

router = APIRouter(prefix="/complete", tags=["Complete Submission"])

UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/submit", status_code=status.HTTP_201_CREATED)
def submit_complete_experiment(
    # Article fields
    title: str = Form(...),
    authors: str = Form(...),
    doi: str = Form(None),
    
    # Experience fields
    experience_description: str = Form(...),
    
    # Machines (JSON array)
    machines: str = Form(...),
    
    # Detectors (JSON array)
    detectors: str = Form(...),
    
    # Phantoms (JSON array)
    phantoms: str = Form(...),
    
    # Data fields
    file: UploadFile = File(...),
    data_type: str = Form(...),
    data_description: str = Form(None),
    columnMapping: str = Form(None),
    
    db: Session = Depends(get_db),
):
    """
    Crée un article, une expérience, lie les machines/détecteurs/fantômes,
    et upload le fichier de données, tout dans une seule transaction.
    
    Si une erreur se produit à tout moment, TOUT est annulé (rollback).
    """
    try:
        print("📝 Starting complete submission...")
        
        # Step 1: Create Article
        print("📝 Step 1: Creating article...")
        article = Article(
            titre=title,
            auteurs=authors,
            doi=doi if doi else None,
        )
        db.add(article)
        db.flush()  # Get article_id without committing
        print(f"✅ Article created with ID: {article.article_id}")
        
        # Step 2: Create Experience
        print("📝 Step 2: Creating experience...")
        experience = Experience(
            article_id=article.article_id,
            description=experience_description,
        )
        db.add(experience)
        db.flush()  # Get experience_id
        print(f"✅ Experience created with ID: {experience.experience_id}")
        
        # Step 3: Get or create and link Machines
        print("📝 Step 3: Getting/creating and linking machines...")
        machines_data = json.loads(machines)
        print(f"Raw machines JSON: {machines}")
        print(f"Parsed machines data: {machines_data}")
        linked_machines = []
        for machine_info in machines_data:
            print(f"  Processing machine: {machine_info}")
            # Get or create machine (will reuse if exists)
            machine = get_or_create_machine(
                db,
                constructeur=machine_info.get("manufacturer"),
                modele=machine_info.get("model"),
                type_machine=machine_info.get("machineType"),
            )
            linked_machines.append(machine)
            
            # Link to experience with parameters
            energy_val = machine_info.get("energy")
            collimation_val = machine_info.get("collimation")
            settings_val = machine_info.get("settings")
            print(f"  Parameters - energy: {energy_val}, collimation: {collimation_val}, settings: {settings_val}")
            
            link = ExperienceMachine(
                experience_id=experience.experience_id,
                machine_id=machine.machine_id,
                energy=energy_val,
                collimation=collimation_val,
                settings=settings_val,
            )
            db.add(link)
        db.flush()
        print(f"✅ {len(linked_machines)} machines linked to experience")
        
        # Step 4: Get or create and link Detectors
        print("📝 Step 4: Getting/creating and linking detectors...")
        detectors_data = json.loads(detectors)
        linked_detectors = []
        for detector_info in detectors_data:
            # Get or create detector (will reuse if exists)
            detector = get_or_create_detector(
                db,
                type_detecteur=detector_info.get("detectorType"),
                modele=detector_info.get("model"),
                constructeur=detector_info.get("manufacturer"),
            )
            linked_detectors.append(detector)
            
            # Link to experience with parameters
            link = ExperienceDetector(
                experience_id=experience.experience_id,
                detector_id=detector.detecteur_id,
                position=detector_info.get("position"),
                depth=detector_info.get("depth"),
                orientation=detector_info.get("orientation"),
            )
            db.add(link)
        db.flush()
        print(f"✅ {len(linked_detectors)} detectors linked to experience")
        
        # Step 5: Get or create and link Phantoms
        print("📝 Step 5: Getting/creating and linking phantoms...")
        phantoms_data = json.loads(phantoms)
        linked_phantoms = []
        for phantom_info in phantoms_data:
            # Get or create phantom (will reuse if exists)
            phantom = get_or_create_phantom(
                db,
                name=phantom_info.get("name"),
                phantom_type=phantom_info.get("phantom_type"),
                dimensions=phantom_info.get("dimensions"),
                material=phantom_info.get("material"),
            )
            linked_phantoms.append(phantom)
            
            # Link to experience with parameters
            link = ExperiencePhantom(
                experience_id=experience.experience_id,
                phantom_id=phantom.phantom_id,
                position=phantom_info.get("position"),
                orientation=phantom_info.get("orientation"),
            )
            db.add(link)
        db.flush()
        print(f"✅ {len(linked_phantoms)} phantoms linked to experience")
        
        # Step 6: Upload data file and create column mappings
        print("📝 Step 6: Uploading data file...")
        file_path = f"{UPLOAD_DIR}/{experience.experience_id}_{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        donnee = Donnee(
            experience_id=experience.experience_id,
            data_type=data_type,
            file_format=file.filename.split(".")[-1],
            file_path=file_path,
            description=data_description,
        )
        db.add(donnee)
        db.flush()
        print(f"✅ Data file uploaded with ID: {donnee.data_id}")

        # Step 7: Create column mappings if provided
        if columnMapping:
            print("📝 Step 7: Creating column mappings...")
            try:
                mappings = json.loads(columnMapping)
                if isinstance(mappings, list):
                    for mapping in mappings:
                        # Support both camelCase (from frontend) and snake_case
                        column_name = mapping.get("column_name") or mapping.get("name")
                        data_type_col = mapping.get("data_type") or mapping.get("dataType")
                        column_description = mapping.get("column_description") or mapping.get("description")
                        col_unit = mapping.get("unit")
                        
                        # Only create if we have at least column_name and data_type
                        if column_name and data_type_col:
                            column_map = ColumnMapping(
                                data_id=donnee.data_id,
                                column_name=column_name,
                                column_description=column_description,
                                data_type=data_type_col,
                                unit=col_unit,
                            )
                            db.add(column_map)
                print(f"✅ Column mappings created")
            except json.JSONDecodeError as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid columnMapping format: {str(e)}"
                )
        
        # Commit everything
        print("📝 Committing all changes to database...")
        db.commit()
        print("🎉 Complete submission successful!")
        
        return {
            "article_id": article.article_id,
            "experience_id": experience.experience_id,
            "data_id": donnee.data_id,
            "machines_count": len(linked_machines),
            "detectors_count": len(linked_detectors),
            "phantoms_count": len(linked_phantoms),
        }
        
    except (DatabaseError, IntegrityError) as e:
        db.rollback()
        print(f"❌ Database Error: {str(e)}")
        
        # Clean up uploaded file if it exists
        if 'file_path' in locals() and os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"🗑️ Cleaned up uploaded file: {file_path}")
            except Exception as cleanup_error:
                print(f"⚠️ Failed to clean up file: {cleanup_error}")
        
        raise HTTPException(
            status_code=409,
            detail=f"Database Error: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {str(e)}")
        
        # Clean up uploaded file if it exists
        if 'file_path' in locals() and os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"🗑️ Cleaned up uploaded file: {file_path}")
            except Exception as cleanup_error:
                print(f"⚠️ Failed to clean up file: {cleanup_error}")
        
        raise HTTPException(
            status_code=500,
            detail=f"Error: {str(e)}"
        )
