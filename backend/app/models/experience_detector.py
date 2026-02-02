from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from app.database import Base

class ExperienceDetector(Base):
    __tablename__ = "experience_detecteur"

    experience_id = Column(Integer, ForeignKey("experiences.experience_id"), primary_key=True)
    detecteur_id = Column(Integer, ForeignKey("detecteurs.detecteur_id"), primary_key=True)

    position = Column(String)
    depth = Column(String)
    orientation = Column(String)
    
    # Relations
    experience = relationship("Experience", back_populates="detectors")
    detector = relationship("Detector", back_populates="experiences")
