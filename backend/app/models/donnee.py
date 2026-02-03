from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Donnee(Base):
    __tablename__ = "donnees"

    data_id = Column(Integer, primary_key=True, index=True)
    experience_id = Column(Integer, ForeignKey("experiences.experience_id"), nullable=False)

    data_type = Column(String, nullable=False)      
    file_format = Column(String)                   
    file_path = Column(String, nullable=False)

    description = Column(String)
    
    # Relation vers Experience
    experience = relationship("Experience", back_populates="donnees")
    # Relation vers ColumnMapping (one-to-many)
    column_mappings = relationship("ColumnMapping", back_populates="donnee", cascade="all, delete-orphan")
