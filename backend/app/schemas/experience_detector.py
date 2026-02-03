from pydantic import BaseModel
from typing import Optional

class ExperienceDetectorCreate(BaseModel):
    """
    Données pour ajouter un détecteur à une expérience.
    Peut contenir soit :
    - detector_id uniquement (si le détecteur existe)
    - type_detecteur/modele/constructeur (pour créer ou récupérer)
    """
    # Identifiant du détecteur (optionnel si on fournit les détails)
    detector_id: Optional[int] = None
    
    # Détails du détecteur (optionnel si on fournit l'ID)
    type_detecteur: Optional[str] = None
    modele: Optional[str] = None
    constructeur: Optional[str] = None
    
    # Paramètres spécifiques à l'expérience
    position: Optional[str] = None
    depth: Optional[str] = None
    orientation: Optional[str] = None

class ExperienceDetectorOut(ExperienceDetectorCreate):
    experience_id: int

    class Config:
        orm_mode = True
