"""
Migration script to refactor the database schema.
Remove experience_id columns from machines, detectors, and phantoms tables.
"""

from app.database import engine
from sqlalchemy import text

def migrate():
    with engine.begin() as conn:
        # Drop foreign key constraints and columns
        try:
            # Drop FK and column from machines table
            conn.execute(text("""
                ALTER TABLE machines
                DROP CONSTRAINT IF EXISTS machines_experience_id_fkey;
            """))
            conn.execute(text("""
                ALTER TABLE machines
                DROP COLUMN IF EXISTS experience_id;
            """))
            print("✓ Dropped experience_id from machines table")
        except Exception as e:
            print(f"✗ Error dropping from machines: {e}")

        try:
            # Drop FK and column from detecteurs table
            conn.execute(text("""
                ALTER TABLE detecteurs
                DROP CONSTRAINT IF EXISTS detecteurs_experience_id_fkey;
            """))
            conn.execute(text("""
                ALTER TABLE detecteurs
                DROP COLUMN IF EXISTS experience_id;
            """))
            print("✓ Dropped experience_id from detecteurs table")
        except Exception as e:
            print(f"✗ Error dropping from detecteurs: {e}")

        try:
            # Drop FK and column from phantoms table
            conn.execute(text("""
                ALTER TABLE phantoms
                DROP CONSTRAINT IF EXISTS phantoms_experience_id_fkey;
            """))
            conn.execute(text("""
                ALTER TABLE phantoms
                DROP COLUMN IF EXISTS experience_id;
            """))
            print("✓ Dropped experience_id from phantoms table")
        except Exception as e:
            print(f"✗ Error dropping from phantoms: {e}")

        # Ensure all tables exist with new structure
        try:
            # Create experience_machine if it doesn't exist (with proper FK structure)
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS experience_machine (
                    experience_id INTEGER NOT NULL REFERENCES experiences(experience_id),
                    machine_id INTEGER NOT NULL REFERENCES machines(machine_id),
                    energy VARCHAR,
                    collimation VARCHAR,
                    settings VARCHAR,
                    PRIMARY KEY (experience_id, machine_id)
                );
            """))
            print("✓ Ensured experience_machine table structure")
        except Exception as e:
            print(f"✗ Error with experience_machine: {e}")

        try:
            # Create experience_detector if it doesn't exist
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS experience_detector (
                    experience_id INTEGER NOT NULL REFERENCES experiences(experience_id),
                    detector_id INTEGER NOT NULL REFERENCES detecteurs(detecteur_id),
                    position VARCHAR,
                    depth VARCHAR,
                    orientation VARCHAR,
                    PRIMARY KEY (experience_id, detector_id)
                );
            """))
            print("✓ Ensured experience_detector table structure")
        except Exception as e:
            print(f"✗ Error with experience_detector: {e}")

        try:
            # Create experience_phantom if it doesn't exist
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS experience_phantom (
                    experience_id INTEGER NOT NULL REFERENCES experiences(experience_id),
                    phantom_id INTEGER NOT NULL REFERENCES phantoms(phantom_id),
                    PRIMARY KEY (experience_id, phantom_id)
                );
            """))
            print("✓ Ensured experience_phantom table structure")
        except Exception as e:
            print(f"✗ Error with experience_phantom: {e}")

    print("\n✓ Migration completed successfully!")

if __name__ == "__main__":
    migrate()
