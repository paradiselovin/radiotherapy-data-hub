from pydantic import BaseModel
from typing import Optional

class ExperienceMachineCreate(BaseModel):
    """
    Données pour ajouter une machine à une expérience.
    Peut contenir soit :
    - machine_id uniquement (si la machine existe)
    - constructeur/modele/type_machine (pour créer ou récupérer)
    """
    # Identifiant de la machine (optionnel si on fournit les détails)
    machine_id: Optional[int] = None
    
    # Détails de la machine (optionnel si on fournit l'ID)
    constructeur: Optional[str] = None
    modele: Optional[str] = None
    type_machine: Optional[str] = None
    
    # Paramètres spécifiques à l'expérience
    energy: Optional[str] = None
    collimation: Optional[str] = None
    settings: Optional[str] = None

class ExperienceMachineOut(ExperienceMachineCreate):
    experience_id: int

    class Config:
        orm_mode = True
