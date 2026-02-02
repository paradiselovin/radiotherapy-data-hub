from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Machine(Base):
    __tablename__ = "machines"

    machine_id = Column(Integer, primary_key=True, index=True)
    constructeur = Column(String)
    modele = Column(String, nullable=False)
    type_machine = Column(String)
    
    # Relation vers ExperienceMachine
    experiences = relationship("ExperienceMachine", back_populates="machine")
