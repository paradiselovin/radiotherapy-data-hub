from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ColumnMapping(Base):
    """
    Stores metadata about columns in a dataset uploaded as donnee.
    Each dataset can have multiple columns with different types and units.
    """
    __tablename__ = "column_mappings"

    mapping_id = Column(Integer, primary_key=True, index=True)
    data_id = Column(Integer, ForeignKey("donnees.data_id"), nullable=False)
    
    column_name = Column(String, nullable=False)  # e.g., "depth", "dose", "x_position"
    column_description = Column(String)  # e.g., "Depth in mm"
    data_type = Column(String, nullable=False)  # e.g., "numeric", "categorical", "text", "datetime"
    unit = Column(String)  # e.g., "mm", "Gy", "cm", etc.
    
    # Relation towards Donnee
    donnee = relationship("Donnee", back_populates="column_mappings")
