from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Detector(Base):
    __tablename__ = "detecteurs"

    detecteur_id = Column(Integer, primary_key=True)
    type_detecteur = Column(String)
    modele = Column(String)
    constructeur = Column(String)
    
    # Relation vers ExperienceDetector
    experiences = relationship("ExperienceDetector", back_populates="detector")
