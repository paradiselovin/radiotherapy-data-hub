# 🔧 Configuration Rapide pour le Déploiement

## Étape 1 : Créer ton fichier .env

Avant de déployer, tu dois créer un fichier `.env` à partir du template :

```bash
cd /chemin/vers/radiotherapy-data-hub
cp .env.example .env
```

## Étape 2 : Modifier le mot de passe

Ouvre le fichier `.env` et change le mot de passe :

```bash
nano .env
```

Tu verras ça :
```env
POSTGRES_PASSWORD=VotreMotDePasseSecurise123!
```

**Remplace par ton propre mot de passe sécurisé**, par exemple :
```env
POSTGRES_PASSWORD=Dosimetrie2026!MonMotDePasse
```

⚠️ **Important** : Change le mot de passe à **DEUX** endroits dans le fichier :
1. Ligne `POSTGRES_PASSWORD=...`
2. Dans `DATABASE_URL=postgresql://radiotherapy:TON_MOT_DE_PASSE@db:5432/radiotherapy_db`

Exemple complet :
```env
POSTGRES_USER=radiotherapy
POSTGRES_PASSWORD=Dosimetrie2026!MonMotDePasse
POSTGRES_DB=radiotherapy_db

DATABASE_URL=postgresql://radiotherapy:Dosimetrie2026!MonMotDePasse@db:5432/radiotherapy_db

CORS_ORIGINS=http://localhost:3000,https://dosimetrie.centralesupelec.fr
PORT=80
```

## Étape 3 : Vérifier le domaine

Le domaine est déjà configuré dans `.env` :
```env
CORS_ORIGINS=http://localhost:3000,https://dosimetrie.centralesupelec.fr
```

✅ C'est bon ! Ton domaine `dosimetrie.centralesupelec.fr` est déjà là.

## Étape 4 : Pourquoi NE PAS committer .env ?

### ❌ Le problème

Le fichier `.env` contient ton **mot de passe** de base de données. Si tu fais :
```bash
git add .env
git commit -m "ajout config"
git push
```

→ Ton mot de passe sera visible sur GitHub par **tout le monde** ! 🚨

### ✅ La solution

1. **`.env.example`** → Template SANS mot de passe réel (déjà dans Git)
2. **`.env`** → Fichier avec TON vrai mot de passe (ne JAMAIS le commit)

Le fichier `.gitignore` que j'ai créé empêche déjà `.env` d'être commité :
```gitignore
# Environment variables
.env
.env.local
```

### Vérifier que .env n'est PAS tracké

```bash
git status
```

Tu ne dois **PAS** voir `.env` dans la liste. Si tu le vois :
```bash
git rm --cached .env  # Retire .env du tracking Git
```

## 📋 Checklist avant le déploiement

- [ ] ✅ Fichier `.env` créé (copie de `.env.example`)
- [ ] ✅ Mot de passe changé dans `.env` (2 endroits)
- [ ] ✅ Domaine configuré : `dosimetrie.centralesupelec.fr`
- [ ] ✅ Vérifié que `.env` n'est PAS dans `git status`
- [ ] ✅ Clé SSH générée et envoyée à l'IT
- [ ] ✅ Informations envoyées : ports 80/443 + sous-domaine

## 🚀 Commandes de déploiement

Une fois sur le serveur `docker-heb02` :

```bash
# 1. Cloner le repo
git clone https://github.com/paradiselovin/radiotherapy-data-hub.git
cd radiotherapy-data-hub

# 2. Créer .env et le configurer
cp .env.example .env
nano .env  # Modifier le mot de passe

# 3. Lancer l'application
./start.sh

# 4. Vérifier que ça marche
docker-compose ps
docker-compose logs -f
```

## 🔍 Comment vérifier que tout fonctionne ?

Une fois déployé, teste ces URLs :

1. **Frontend** : https://dosimetrie.centralesupelec.fr
2. **API Health** : https://dosimetrie.centralesupelec.fr/api/health
3. **API Docs** : https://dosimetrie.centralesupelec.fr/api/docs

## 🆘 Problèmes courants

### "Connection refused" vers la base de données
→ Le mot de passe dans `.env` ne correspond pas entre les deux lignes

### "CORS error" dans le navigateur
→ Vérifie que `dosimetrie.centralesupelec.fr` est bien dans `CORS_ORIGINS`

### ".env file not found"
→ Tu as oublié de faire `cp .env.example .env`

## 📞 Résumé pour l'IT de CentraleSupélec

**Voici ce qu'il faut leur envoyer :**

```
Bonjour,

Je souhaite déployer une application sur docker-heb02.

Informations requises :
- Ports : 80 (HTTP) et 443 (HTTPS)
- Sous-domaine : dosimetrie.centralesupelec.fr
- Clé SSH publique : [coller le contenu de cat ~/.ssh/id_ed25519.pub]
- Repository : https://github.com/paradiselovin/radiotherapy-data-hub

L'application utilise Docker Compose avec 3 services :
- Frontend (React + Nginx)
- Backend (FastAPI)
- Base de données (PostgreSQL)

Merci,
[Ton nom]
```
