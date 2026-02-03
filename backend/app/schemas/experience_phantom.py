from pydantic import BaseModel
from typing import Optional

class ExperiencePhantomCreate(BaseModel):
    """
    Données pour ajouter un fantôme à une expérience.
    Peut contenir soit :
    - phantom_id uniquement (si le fantôme existe)
    - phantom_type/manufacturer/model/dimensions/material (pour créer ou récupérer)
    Inclut position et orientation spécifiques à cette expérience
    """
    # Identifiant du fantôme (optionnel si on fournit les détails)
    phantom_id: Optional[int] = None
    
    # Détails du fantôme (optionnel si on fournit l'ID)
    phantom_type: Optional[str] = None
    manufacturer: Optional[str] = None
    model: str  # Required
    dimensions: Optional[str] = None
    material: Optional[str] = None
    
    # Paramètres spécifiques à cette expérience
    position: Optional[str] = None
    orientation: Optional[str] = None

class ExperiencePhantomOut(ExperiencePhantomCreate):
    experience_id: int

    class Config:
        orm_mode = True
