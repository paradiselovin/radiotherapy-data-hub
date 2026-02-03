# Connecting to the PostgreSQL database
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Get database URL from environment variable or use default for local development
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://dosimetry_user:password@localhost:5432/dosimetry_db")

print(f"🔗 Connecting to database...")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()
print("✅ Database connection established!")