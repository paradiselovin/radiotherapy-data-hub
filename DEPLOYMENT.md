# Guide de Déploiement - CentraleSupélec

## 📋 Informations à fournir

### 1. Ports à exposer
- **Port 80** (HTTP)
- **Port 443** (HTTPS) - optionnel mais recommandé

### 2. Sous-domaine
- **dosimetrie.centralesupelec.fr** (recommandé)

### 3. Clé SSH publique
Générer votre clé SSH :
```bash
ssh-keygen -t ed25519 -C "votre.email@centralesupelec.fr"
cat ~/.ssh/id_ed25519.pub
```

## 🚀 Déploiement sur docker-heb02

### Étape 1 : Connexion SSH
```bash
ssh votre-login@docker-heb02.centralesupelec.fr
```

### Étape 2 : Cloner le repository
```bash
git clone https://github.com/paradiselovin/radiotherapy-data-hub.git
cd radiotherapy-data-hub
```

### Étape 3 : Configuration
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer les variables d'environnement
nano .env
```

**Variables importantes à modifier :**
- `POSTGRES_PASSWORD` : Choisir un mot de passe sécurisé
- `CORS_ORIGINS` : Ajouter `https://dosimetrie.centralesupelec.fr`
- `PORT` : Utiliser le port fourni par l'école (80 par défaut)

### Étape 4 : Build et lancement
```bash
# Build les images
docker-compose build

# Lancer l'application
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

### Étape 5 : Vérifier le déploiement
```bash
# Status des conteneurs
docker-compose ps

# Logs du backend
docker-compose logs backend

# Logs du frontend
docker-compose logs frontend

# Logs de la base de données
docker-compose logs db
```

## 🔧 Commandes utiles

### Arrêter l'application
```bash
docker-compose down
```

### Redémarrer l'application
```bash
docker-compose restart
```

### Mettre à jour l'application
```bash
git pull
docker-compose build
docker-compose up -d
```

### Voir les logs en temps réel
```bash
docker-compose logs -f
```

### Accéder à la base de données
```bash
docker-compose exec db psql -U radiotherapy -d radiotherapy_db
```

### Backup de la base de données
```bash
docker-compose exec db pg_dump -U radiotherapy radiotherapy_db > backup_$(date +%Y%m%d).sql
```

### Restaurer la base de données
```bash
docker-compose exec -T db psql -U radiotherapy radiotherapy_db < backup_20260203.sql
```

## 📁 Structure des volumes

Les données persistantes sont stockées dans :
- **Base de données** : Volume Docker `postgres_data`
- **Fichiers uploadés** : `./backend/data/uploads`
- **Logs** : `./backend/logs`

## 🔒 Sécurité

### Checklist avant déploiement :
- [ ] Mot de passe PostgreSQL changé dans `.env`
- [ ] CORS configuré avec le bon domaine
- [ ] Fichier `.env` **NON** commité dans Git
- [ ] Permissions correctes sur les dossiers de données
- [ ] Backup automatique configuré

### Configuration HTTPS (optionnel)
Si l'école fournit un certificat SSL :
```bash
# Ajouter dans docker-compose.yml pour le frontend
ports:
  - "443:443"
volumes:
  - ./ssl:/etc/nginx/ssl
```

## 🩺 Health Checks

Vérifier la santé de l'application :
```bash
# Backend API
curl http://localhost:8000/health

# Frontend
curl http://localhost:80
```

## 📞 Support

Pour toute question :
- Repository : https://github.com/paradiselovin/radiotherapy-data-hub
- Contact IT CentraleSupélec pour problèmes serveur

## 🔄 Architecture déployée

```
Internet (dosimetrie.centralesupelec.fr)
    ↓
[ Nginx - Frontend Container (port 80) ]
    ↓ /api/*
[ FastAPI - Backend Container (port 8000) ]
    ↓
[ PostgreSQL - Database Container (port 5432) ]
```

## 📊 Monitoring

Surveiller l'utilisation des ressources :
```bash
# CPU et mémoire
docker stats

# Espace disque
docker system df
```
