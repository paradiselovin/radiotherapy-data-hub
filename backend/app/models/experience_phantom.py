from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from app.database import Base

class ExperiencePhantom(Base):
    __tablename__ = "experience_phantom"

    experience_id = Column(Integer, ForeignKey("experiences.experience_id"), primary_key=True)
    phantom_id = Column(Integer, ForeignKey("phantoms.phantom_id"), primary_key=True)
    
    # Paramètres spécifiques à l'expérience
    position = Column(String, nullable=True)
    orientation = Column(String, nullable=True)
    
    # Relations
    experience = relationship("Experience", back_populates="phantoms")
    phantom = relationship("Phantom", back_populates="experiences")
