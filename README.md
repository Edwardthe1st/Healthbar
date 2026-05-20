# NutriApp

Application mobile de suivi nutritionnel avec recommandations alimentaires personnalisées basées sur le machine learning.

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Mobile | React Native + Expo Router + Zustand + TypeScript |
| API | Node.js + Express + TypeScript + Prisma ORM |
| Base de données | PostgreSQL 16 |
| ML | Python + FastAPI + scikit-learn + NumPy |
| Auth | JWT (access 15 min + refresh 7 jours) |
| Données aliments | Open Food Facts (seed initial) |

## Démarrage rapide

### Prérequis

- Docker + Docker Compose v2
- Node.js 20+ (développement mobile)
- Expo CLI (`npm install -g expo-cli`)

### 1. Configuration

```bash
cp .env.example .env
# Éditer .env : changer les mots de passe et secrets JWT
```

### 2. Lancement avec Docker

```bash
# Production
docker compose up -d

# Appliquer les migrations et seeder les aliments
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

L'API est accessible sur `http://localhost:3000/api/v1`.
Le ML service est accessible sur `http://localhost:8001`.

### 3. Développement avec hot reload

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### 4. Mobile

```bash
cd mobile
npm install
# Créer mobile/.env avec : EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
npx expo start
```

## Architecture

```
Mobile (Expo Router)
       │
       │ REST API
       ▼
  API Node.js :3000
       │
       │ HTTP interne
       ▼
  ML Service :8001 ←── jamais accès direct DB

  PostgreSQL (réseau interne Docker uniquement)
```

**Règle clé :** le ML service ne lit jamais la base de données.
L'API Node.js est le seul orchestrateur ; elle collecte toutes les données
via Prisma et les transmet au ML service dans le corps des requêtes.

## API — Endpoints

### Auth
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/v1/auth/register` | Inscription |
| POST | `/api/v1/auth/login` | Connexion |
| POST | `/api/v1/auth/refresh` | Renouveler les tokens |

### Utilisateur
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/v1/users/me` | Profil utilisateur |
| PUT | `/api/v1/users/me` | Modifier le profil |
| DELETE | `/api/v1/users/me` | Supprimer le compte |

### Aliments
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/v1/foods?q=&limit=` | Recherche d'aliments |
| GET | `/api/v1/foods/:id` | Détail d'un aliment |
| POST | `/api/v1/foods` | Créer un aliment custom |

### Repas
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/v1/meals` | Liste des repas |
| GET | `/api/v1/meals/:id` | Détail + macros calculées |
| POST | `/api/v1/meals` | Créer un repas |
| PUT | `/api/v1/meals/:id` | Modifier un repas |
| DELETE | `/api/v1/meals/:id` | Supprimer un repas |
| GET | `/api/v1/meals/recommend` | Recommandations ML |

### Journal
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/v1/logs?date=YYYY-MM-DD` | Logs par date |
| GET | `/api/v1/logs/today` | Log du jour (créé si absent) |
| POST | `/api/v1/logs/:id/meals` | Ajouter un repas au log |
| DELETE | `/api/v1/logs/:id/meals/:mealLogId` | Retirer un repas |

### Nutrition
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/v1/nutrition/profile` | BMR, TDEE, objectifs macro |
| GET | `/api/v1/nutrition/today` | Consommé vs objectifs |
| POST | `/api/v1/nutrition/simulate` | Simuler l'ajout d'un repas |

## ML Service — Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/nutrition/profile` | Calcul BMR/TDEE/macros (Mifflin-St Jeor) |
| POST | `/nutrition/meal-macros` | Macros d'un repas |
| POST | `/nutrition/remaining` | Budget restant |
| POST | `/recommend/rank` | Classement par adéquation budget |
| POST | `/recommend/similar` | Similarité content-based |
| GET | `/health` | Liveness probe |

## Formules

Voir `docs/formulas.md` pour le détail des formules Mifflin-St Jeor et des algorithmes ML.

## Développement

### Commandes

```bash
# API — tests
cd api && npm test

# ML service — tests
cd ml-service && pytest

# Prisma — nouvelle migration
cd api && npx prisma migrate dev --name nom_migration

# Prisma — explorer la DB
cd api && npx prisma studio

# pgAdmin (via Docker)
docker compose --profile dev up -d
# Puis ouvrir http://localhost:5050
```

### Structure des dossiers

```
nutrition-app/
├── api/
│   ├── src/
│   │   ├── controllers/    Validation input → appel service → réponse
│   │   ├── services/       Logique métier (DB + ML)
│   │   ├── routes/         Déclaration des routes Express
│   │   ├── middlewares/    Auth JWT, gestion erreurs
│   │   └── lib/            Client Prisma singleton
│   └── prisma/
│       ├── schema.prisma
│       └── seeds/
├── ml-service/
│   ├── nutrition/          Formules Mifflin-St Jeor + calcul macros
│   ├── recommender/        Scorer cosinus + content-based
│   └── main.py             FastAPI app
├── mobile/
│   ├── app/(tabs)/         Écrans principaux (Expo Router)
│   ├── store/              Zustand slices
│   └── services/           Client API + hooks React
├── shared/types/           Types TypeScript partagés
└── docs/
```

## Licence

MIT
