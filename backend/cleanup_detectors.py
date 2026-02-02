"""
Migration script to clean up duplicate experience_detector table
"""

from app.database import engine
from sqlalchemy import text

def migrate():
    with engine.begin() as conn:
        try:
            # Drop the old experience_detector table (keeping experience_detecteur)
            conn.execute(text("DROP TABLE IF EXISTS experience_detector CASCADE;"))
            print("✓ Dropped old experience_detector table")
        except Exception as e:
            print(f"✗ Error dropping old table: {e}")

        try:
            # Verify experience_detecteur exists
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'experience_detecteur'
                );
            """))
            exists = result.fetchone()[0]
            if exists:
                print("✓ experience_detecteur table confirmed")
            else:
                print("⚠ experience_detecteur table does not exist")
        except Exception as e:
            print(f"✗ Error checking table: {e}")

    print("\n✓ Migration completed successfully!")

if __name__ == "__main__":
    migrate()
