"""
Fonctions utilitaires pour gérer l'obtention ou création des entités génériques
(Machines, Détecteurs, Phantômes) avec vérification d'existence.
"""
from sqlalchemy.orm import Session
from app.models.machine import Machine
from app.models.detector import Detector
from app.models.phantom import Phantom


def get_or_create_machine(
    db: Session,
    constructeur: str,
    modele: str,
    type_machine: str,
) -> Machine:
    """
    Récupère une machine existante ou la crée si elle n'existe pas.
    
    Recherche basée sur : constructeur + modele + type_machine
    
    Args:
        db: Session de base de données
        constructeur: Constructeur/fabricant de la machine
        modele: Modèle de la machine
        type_machine: Type de la machine
        
    Returns:
        Machine: L'objet Machine (existant ou nouvellement créé)
    """
    # Chercher si la machine existe déjà
    existing_machine = db.query(Machine).filter(
        Machine.constructeur == constructeur,
        Machine.modele == modele,
        Machine.type_machine == type_machine,
    ).first()
    
    if existing_machine:
        return existing_machine
    
    # Créer une nouvelle machine si elle n'existe pas
    new_machine = Machine(
        constructeur=constructeur,
        modele=modele,
        type_machine=type_machine,
    )
    db.add(new_machine)
    db.flush()  # Obtenir l'ID sans committer
    return new_machine


def get_or_create_detector(
    db: Session,
    type_detecteur: str,
    modele: str,
    constructeur: str,
) -> Detector:
    """
    Récupère un détecteur existant ou le crée si il n'existe pas.
    
    Recherche basée sur : type_detecteur + modele + constructeur
    
    Args:
        db: Session de base de données
        type_detecteur: Type du détecteur
        modele: Modèle du détecteur
        constructeur: Constructeur/fabricant du détecteur
        
    Returns:
        Detector: L'objet Detector (existant ou nouvellement créé)
    """
    # Chercher si le détecteur existe déjà
    existing_detector = db.query(Detector).filter(
        Detector.type_detecteur == type_detecteur,
        Detector.modele == modele,
        Detector.constructeur == constructeur,
    ).first()
    
    if existing_detector:
        return existing_detector
    
    # Créer un nouveau détecteur si il n'existe pas
    new_detector = Detector(
        type_detecteur=type_detecteur,
        modele=modele,
        constructeur=constructeur,
    )
    db.add(new_detector)
    db.flush()  # Obtenir l'ID sans committer
    return new_detector


def get_or_create_phantom(
    db: Session,
    name: str,
    phantom_type: str,
    dimensions: str = None,
    material: str = None,
) -> Phantom:
    """
    Récupère un fantôme existant ou le crée si il n'existe pas.
    
    Recherche basée sur : name + phantom_type
    (dimensions et material peuvent varier pour le même fantôme)
    
    Args:
        db: Session de base de données
        name: Nom du fantôme
        phantom_type: Type du fantôme
        dimensions: Dimensions du fantôme (optionnel)
        material: Matériau du fantôme (optionnel)
        
    Returns:
        Phantom: L'objet Phantom (existant ou nouvellement créé)
    """
    # Chercher si le fantôme existe déjà
    existing_phantom = db.query(Phantom).filter(
        Phantom.name == name,
        Phantom.phantom_type == phantom_type,
    ).first()
    
    if existing_phantom:
        return existing_phantom
    
    # Créer un nouveau fantôme si il n'existe pas
    new_phantom = Phantom(
        name=name,
        phantom_type=phantom_type,
        dimensions=dimensions,
        material=material,
    )
    db.add(new_phantom)
    db.flush()  # Obtenir l'ID sans committer
    return new_phantom
