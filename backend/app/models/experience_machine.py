from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from app.database import Base

class ExperienceMachine(Base):
    __tablename__ = "experience_machine"

    experience_id = Column(
        Integer, ForeignKey("experiences.experience_id"), primary_key=True
    )
    machine_id = Column(
        Integer, ForeignKey("machines.machine_id"), primary_key=True
    )
    
    energy = Column(String)
    collimation = Column(String)
    settings = Column(String)
    
    # Relations
    experience = relationship("Experience", back_populates="machines")
    machine = relationship("Machine", back_populates="experiences")
