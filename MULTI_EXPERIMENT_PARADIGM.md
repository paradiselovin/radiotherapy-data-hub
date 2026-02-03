# Architecture Multi-Expériences

## Aperçu du Changement

L'application a été restructurée pour supporter le paradigme **1 Article → N Expériences** au lieu du précédent **1 Article → 1 Expérience**.

### Workflow Avant
1. Créer article + expérience + machines + détecteurs + phantômes + données en une seule soumission atomique
2. Impossibilité d'ajouter des expériences supplémentaires à un article existant

### Workflow Après
1. Créer un article (titre, auteurs, DOI)
2. Sélectionner l'article pour voir/gérer ses expériences
3. Ajouter une ou plusieurs expériences à l'article
4. Pour chaque expérience : machines + détecteurs + phantômes + données

## Architecture Implémentée

### Backend

#### Nouveaux Endpoints

**Articles**
- `POST /articles/` - Créer un article
- `GET /articles/` - Lister tous les articles
- `GET /articles/{article_id}` - Récupérer un article
- `GET /articles/{article_id}/experiences` - Lister les expériences d'un article

**Expériences pour Articles Existants**
- `POST /complete/submit-experience/{article_id}` - Créer une expérience pour un article existant
  - Même logique atomique que `/complete/submit`
  - Valide l'article avant de créer l'expérience
  - Supporte machines, détecteurs, phantômes, données

#### Modifications Existantes

**`app/routes/articles.py`**
- Ajout endpoint `GET /{article_id}/experiences` retournant :
  ```json
  {
    "article_id": int,
    "titre": string,
    "auteurs": string,
    "doi": string,
    "experiences": [
      {
        "experience_id": int,
        "description": string,
        "machine_count": int,
        "detector_count": int,
        "phantom_count": int,
        "data_count": int
      }
    ]
  }
  ```

**`app/routes/complete_submission.py`**
- Ajout endpoint `POST /submit-experience/{article_id}` (200+ lignes)
- Logique identique à `/complete/submit` mais sans création d'article

### Frontend

#### Nouveaux Composants

**`ArticleForm.tsx`**
- Formulaire pour créer des articles
- Champs : Titre*, Auteurs, DOI
- Callback `onSuccess(article)` avec l'article créé

**`ExperiencesManager.tsx`**
- Liste les expériences d'un article
- Affiche compteurs (machines, détecteurs, phantômes, données)
- Bouton "Add Experiment" lance FormWizard
- Sélectionner une expérience pour l'éditer

#### Composants Modifiés

**`FormWizard.tsx`**
- Props additionnelles:
  - `articleId?: number` - ID de l'article si création d'expérience seule
  - `experienceId?: number` - ID de l'expérience à éditer
  - `onSuccess?: (result) => void` - Callback de succès
  - `onCancel?: () => void` - Callback d'annulation

- Comportement adaptatif:
  - Sans `articleId` : 8 steps (Article → ... → Summary)
  - Avec `articleId` : 7 steps (Experience → ... → Summary, article step omis)

- Bouton Cancel pour revenir au manager

**`SummaryStep.tsx`**
- Prop supplémentaire `isForExistingArticle?: boolean`
- Masque section Article si expérience seule

**`api.ts`**
- `getArticles()` - Lister articles
- `getArticle(id)` - Récupérer article
- `getArticleExperiences(id)` - Lister expériences d'un article
- `createArticle(data)` - Créer article
- `submitExperienceToArticle(articleId, data)` - Soumettre expérience

**`useFormSubmit.ts`**
- Fonction `submitExperienceForm(formData, articleId)`
- Appelle `/complete/submit-experience/{articleId}`

#### Pages Modifiées

**`Articles.tsx`** (Nouvelle page)
- Affiche liste articles avec titre, auteurs, DOI
- Formulaire "Créer un nouvel article"
- Vue détails article avec expériences
- Bouton pour ajouter expérience (intègre FormWizard)

**`Index.tsx`**
- Route par défaut affiche `ArticlesPage` au lieu de `FormWizard`

## Modèle de Données

La structure base de données reste **inchangée** et supporte déjà ce paradigme :

```
Articles
├─ article_id (PK)
├─ titre
├─ auteurs
├─ doi
└─ Experiences (article_id FK)
   ├─ experience_id (PK)
   ├─ description
   ├─ ExperienceMachine[]
   ├─ ExperienceDetector[]
   ├─ ExperiencePhantom[]
   └─ Donnees[]
      ├─ donnee_id (PK)
      ├─ experience_id (FK)
      ├─ data_type
      ├─ file_path
      ├─ ColumnMapping[]
```

## Migration

Aucune migration de base de données requise. Les tables existantes supportent déjà ce paradigme.

## Backward Compatibility

- Endpoint `POST /complete/submit` reste disponible pour création atomique article + expérience
- Code existant utilisant ce endpoint continue de fonctionner
- Nouveau paradigme est optionnel

## Tests de Validation

✅ Backend importe sans erreurs
✅ Frontend compile sans erreurs  
✅ Tous les endpoints définis et implémentés
✅ Tous les composants créés et intégrés

## Étapes Suivantes (Optionnel)

1. **Dépréciateur ancien workflow** : Ajouter warning sur `/complete/submit`
2. **Éditer expériences** : Permettre modification d'expériences existantes
3. **Éditer articles** : Permettre modification titre/auteurs/DOI
4. **Supprimer expériences** : Ajouter endpoint de suppression
5. **Migration Pydantic V2** : Changer `orm_mode` → `from_attributes`

## Routes Complètes

### Articles
```
POST   /articles/                          # Créer article
GET    /articles/                          # Lister articles
GET    /articles/{article_id}              # Récupérer article
GET    /articles/{article_id}/experiences # Lister expériences
```

### Données Complètes (Legacy)
```
POST   /complete/submit                   # Créer article + expérience (atomique)
```

### Données pour Expériences
```
POST   /complete/submit-experience/{article_id}  # Créer expérience (atomique)
```

### Autres Routes (Inchangées)
```
GET/POST /machines/...
GET/POST /detectors/...
GET/POST /phantoms/...
GET/POST /donnees/...
...
```
