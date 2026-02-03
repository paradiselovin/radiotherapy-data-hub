from pydantic import BaseModel
from typing import Optional

class ExperiencePhantomCreate(BaseModel):
    """
    Données pour ajouter un fantôme à une expérience.
    Peut contenir soit :
    - phantom_id uniquement (si le fantôme existe)
    - name/phantom_type/dimensions/material (pour créer ou récupérer)
    """
    # Identifiant du fantôme (optionnel si on fournit les détails)
    phantom_id: Optional[int] = None
    
    # Détails du fantôme (optionnel si on fournit l'ID)
    name: Optional[str] = None
    phantom_type: Optional[str] = None
    dimensions: Optional[str] = None
    material: Optional[str] = None

class ExperiencePhantomOut(ExperiencePhantomCreate):
    experience_id: int

    class Config:
        orm_mode = True
