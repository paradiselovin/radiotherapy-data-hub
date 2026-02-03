"""
Migration script to remove unit column from donnees table.
"""

from app.database import engine
from sqlalchemy import text

def migrate():
    with engine.begin() as conn:
        try:
            # Drop unit column from donnees table
            conn.execute(text("""
                ALTER TABLE donnees
                DROP COLUMN IF EXISTS unit;
            """))
            print("✓ Dropped unit column from donnees table")
        except Exception as e:
            print(f"✗ Error dropping unit column: {e}")

if __name__ == "__main__":
    print("Starting migration...")
    migrate()
    print("Migration complete!")
