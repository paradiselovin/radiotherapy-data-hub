"""
Migration script to add position and orientation columns to experience_phantom table.
"""

from app.database import engine
from sqlalchemy import text

def migrate():
    with engine.begin() as conn:
        try:
            # Add position column if it doesn't exist
            conn.execute(text("""
                ALTER TABLE experience_phantom
                ADD COLUMN IF NOT EXISTS position VARCHAR;
            """))
            print("✓ Added position column to experience_phantom table")
        except Exception as e:
            print(f"✗ Error adding position column: {e}")

        try:
            # Add orientation column if it doesn't exist
            conn.execute(text("""
                ALTER TABLE experience_phantom
                ADD COLUMN IF NOT EXISTS orientation VARCHAR;
            """))
            print("✓ Added orientation column to experience_phantom table")
        except Exception as e:
            print(f"✗ Error adding orientation column: {e}")

if __name__ == "__main__":
    print("Starting migration...")
    migrate()
    print("Migration complete!")
