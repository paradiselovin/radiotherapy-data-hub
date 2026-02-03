# Guide de Déploiement - Radiotherapy Data Hub

## Étape 1 : Déploiement sur docker-heb02

### 1.1 Connexion SSH au serveur

```bash
ssh ton-login@docker-heb02.centralesupelec.fr
```

### 1.2 Cloner le repository

```bash
git clone https://github.com/paradiselovin/radiotherapy-data-hub.git
cd radiotherapy-data-hub
```

### 1.3 Configuration du fichier .env

**Créer le fichier .env :**
```bash
cp .env.example .env
nano .env
```

**Modifier ces lignes dans .env :**

**IMPORTANT : Change le mot de passe à DEUX endroits !**

```env
# 1. Définition du mot de passe
POSTGRES_PASSWORD=TonMotDePasseSecurise2026!

# 2. Dans l'URL de connexion (utilise le MÊME mot de passe)
DATABASE_URL=postgresql://radiotherapy:TonMotDePasseSecurise2026!@db:5432/radiotherapy_db

# 3. Le domaine est déjà bon (ne pas modifier)
CORS_ORIGINS=http://localhost:3000,https://dosimetrie.centralesupelec.fr
```

**Conseil pour le mot de passe :**
- Au moins 12 caractères
- Mélange de majuscules, minuscules, chiffres et symboles
- Exemple : `Dosimetrie2026!MonAppli#`

**Sauvegarder et quitter nano :**
- `Ctrl + O` (sauvegarder)
- `Entrée` (confirmer)
- `Ctrl + X` (quitter)

### 1.4 Lancer l'application

```bash
# Rendre le script exécutable
chmod +x start.sh

# Lancer l'application (tout est automatique !)
./start.sh
```

**Ce qui se passe automatiquement :**
1. PostgreSQL démarre et crée la base de données
2. Backend démarre et crée toutes les tables automatiquement
3. Frontend build et démarre avec Nginx
4. Tous les services se connectent entre eux

**Temps estimé :** 2-3 minutes

---

## Étape 2 : Vérifier que tout fonctionne

### 2.1 Vérifier le statut des conteneurs

```bash
docker-compose ps
```

**Résultat attendu :**
```
NAME                      STATUS
radiotherapy-backend      Up (healthy)
radiotherapy-db          Up (healthy)
radiotherapy-frontend    Up (healthy)
```

### 2.2 Vérifier les logs

```bash
# Logs de tous les services
docker-compose logs -f

# Ou logs d'un service spécifique
docker-compose logs backend
```

**Logs attendus du backend :**
```
🔗 Connecting to database...
✅ Database connection established!
🔧 Creating database tables...
✅ Database tables created successfully!
```

### 2.3 Tester l'API

```bash
# Test du health check
curl http://localhost:80/api/health

# Résultat attendu :
# {"status":"healthy","service":"radiotherapy-api"}
```

### 2.4 Accéder à l'application

**En local (sur le serveur) :**
- Frontend : http://localhost:80
- API : http://localhost:80/api
- API Docs : http://localhost:80/api/docs

**En production (depuis Internet) :**
- Frontend : https://dosimetrie.centralesupelec.fr
- API : https://dosimetrie.centralesupelec.fr/api
- API Docs : https://dosimetrie.centralesupelec.fr/api/docs

---

## Commandes utiles

### Arrêter l'application
```bash
docker-compose down
```

### Redémarrer l'application
```bash
docker-compose restart
```

### Voir les logs en temps réel
```bash
docker-compose logs -f
```

### Mettre à jour l'application
```bash
# 1. Récupérer les dernières modifications
git pull

# 2. Rebuild et redémarrer
docker-compose build
docker-compose up -d

# 3. Vérifier
docker-compose ps
```

### Accéder au shell d'un conteneur
```bash
# Backend
docker-compose exec backend bash

# Base de données
docker-compose exec db psql -U radiotherapy -d radiotherapy_db
```

### Backup de la base de données
```bash
# Créer un backup
docker-compose exec db pg_dump -U radiotherapy radiotherapy_db > backup_$(date +%Y%m%d).sql

# Restaurer un backup
docker-compose exec -T db psql -U radiotherapy radiotherapy_db < backup_20260203.sql
```

---

## Sécurité - Checklist

- [ ] Mot de passe PostgreSQL changé dans `.env` (pas le mot de passe par défaut)
- [ ] Les deux occurrences du mot de passe correspondent (POSTGRES_PASSWORD et DATABASE_URL)
- [ ] Domaine `dosimetrie.centralesupelec.fr` présent dans CORS_ORIGINS
- [ ] Fichier `.env` **NON** commité sur Git (déjà protégé par .gitignore)
- [ ] Permissions correctes sur les dossiers de données

---

## Dépannage

### Problème : "Connection refused" vers la base de données

**Causes possibles :**
1. Le mot de passe dans `.env` ne correspond pas entre `POSTGRES_PASSWORD` et `DATABASE_URL`
2. PostgreSQL n'est pas encore démarré

**Solution :**
```bash
# Vérifier les logs de la base de données
docker-compose logs db

# Redémarrer si nécessaire
docker-compose restart db backend
```

### Problème : "CORS error" dans le navigateur

**Cause :** Le domaine n'est pas autorisé dans CORS_ORIGINS

**Solution :**
```bash
# Éditer .env
nano .env

# Vérifier que cette ligne contient ton domaine
CORS_ORIGINS=http://localhost:3000,https://dosimetrie.centralesupelec.fr

# Redémarrer le backend
docker-compose restart backend
```

### Problème : Tables non créées dans la base de données

**Solution :**
```bash
# Vérifier les logs du backend
docker-compose logs backend | grep "Creating database tables"

# Si absent, redémarrer le backend
docker-compose restart backend
```

### Problème : Frontend ne se charge pas

**Solution :**
```bash
# Vérifier les logs nginx
docker-compose logs frontend

# Reconstruire le frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Problème : "Cannot connect to Docker daemon"

**Cause :** Docker n'est pas démarré ou tu n'as pas les permissions

**Solution :**
```bash
# Démarrer Docker (si installé)
sudo systemctl start docker

# Vérifier ton groupe d'utilisateur
groups
# Tu dois être dans le groupe "docker"

# Sinon, contacter l'IT pour ajouter ton user au groupe docker
```

---

## Architecture de l'application déployée

```
Internet (https://dosimetrie.centralesupelec.fr)
    │
    ↓ Port 80/443
┌─────────────────────────────────┐
│  Nginx - Frontend Container     │
│  (React + Tailwind)             │
│  Port : 80                      │
└─────────────────────────────────┘
    │
    ↓ Reverse Proxy : /api/*
┌─────────────────────────────────┐
│  FastAPI - Backend Container    │
│  (Python 3.11)                  │
│  Port : 8000 (interne)          │
└─────────────────────────────────┘
    │
    ↓ DATABASE_URL
┌─────────────────────────────────┐
│  PostgreSQL - Database          │
│  (PostgreSQL 15)                │
│  Port : 5432 (interne)          │
│  Volume : postgres_data         │
└─────────────────────────────────┘
```

---

## Données persistantes

Les données sont sauvegardées dans des volumes Docker :

- **Base de données** : Volume Docker `postgres_data` (survit aux redémarrages)
- **Fichiers uploadés** : `./backend/data/uploads/`
- **Logs** : `./backend/logs/`

**Important :** Fais des backups réguliers de la base de données !

---

## Résumé en 5 commandes

```bash
# 1. Connexion
ssh ton-login@docker-heb02.centralesupelec.fr

# 2. Clonage
git clone https://github.com/paradiselovin/radiotherapy-data-hub.git && cd radiotherapy-data-hub

# 3. Configuration
cp .env.example .env && nano .env  # Change le mot de passe !

# 4. Déploiement
./start.sh

# 5. Vérification
docker-compose ps && curl http://localhost:80/api/health
```

**C'est tout ! L'application est en ligne sur https://dosimetrie.centralesupelec.fr**

---

## Support

- **Repository GitHub** : https://github.com/paradiselovin/radiotherapy-data-hub
- **Issues** : https://github.com/paradiselovin/radiotherapy-data-hub/issues
- **IT CentraleSupélec** : Pour les problèmes serveur/réseau

---

**Développé avec ❤️ pour la communauté de radiothérapie**
