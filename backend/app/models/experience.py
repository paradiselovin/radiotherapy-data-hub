from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Experience(Base):
    __tablename__ = "experiences"

    experience_id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    article_id = Column(Integer, ForeignKey("articles.article_id"))
    
    # Relations vers les tables de liaison
    machines = relationship("ExperienceMachine", back_populates="experience", cascade="all, delete-orphan")
    detectors = relationship("ExperienceDetector", back_populates="experience", cascade="all, delete-orphan")
    phantoms = relationship("ExperiencePhantom", back_populates="experience", cascade="all, delete-orphan")
    donnees = relationship("Donnee", back_populates="experience", cascade="all, delete-orphan")
    
