#!/usr/bin/env python3
"""
Clean up script to delete all data from database tables.
This helps avoid duplicate data issues during testing.
"""

from app.database import SessionLocal, engine, Base
from app.models import (
    article,
    experience,
    machine,
    detector,
    phantom,
    donnee,
    experience_machine,
    experience_detector,
    experience_phantom,
    column_mapping,
)

def clean_database():
    """Delete all data from all tables in the correct order (respecting foreign keys)."""
    db = SessionLocal()
    
    try:
        print("🗑️  Cleaning database...")
        print("")
        
        # Delete in reverse order of dependencies (children first, then parents)
        # This respects foreign key constraints
        
        tables_to_clean = [
            ("column_mappings", column_mapping.ColumnMapping),
            ("donnees", donnee.Donnee),
            ("experience_machine", experience_machine.ExperienceMachine),
            ("experience_detector", experience_detector.ExperienceDetector),
            ("experience_phantom", experience_phantom.ExperiencePhantom),
            ("experiences", experience.Experience),
            ("machines", machine.Machine),
            ("detecteurs", detector.Detector),
            ("phantoms", phantom.Phantom),
            ("articles", article.Article),
        ]
        
        for table_name, model_class in tables_to_clean:
            count = db.query(model_class).count()
            if count > 0:
                db.query(model_class).delete()
                db.commit()
                print(f"✅ Deleted {count} rows from {table_name}")
            else:
                print(f"⏭️  {table_name} is already empty")
        
        print("")
        print("🎉 Database cleaned successfully!")
        
    except Exception as e:
        print(f"❌ Error cleaning database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    import os
    
    # Confirm before proceeding
    print("⚠️  WARNING: This will delete ALL data from the database!")
    print("Are you sure you want to continue? (yes/no)")
    response = input().strip().lower()
    
    if response == "yes":
        clean_database()
    else:
        print("❌ Cancelled.")
        sys.exit(1)
