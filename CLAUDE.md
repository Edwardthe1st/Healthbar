# NutriApp

## Ce que fait ce projet

Application mobile de suivi nutritionnel avec recommandations alimentaires personnalisées.
Pas d'API IA externe : toute la logique intelligente est dans `ml-service/` (Python + scikit-learn).

---

## Commandes utiles

### Développement local (sans Docker)

```bash
# API Node.js (port 3000)
cd api && npm run dev

# ML Service Python (port 8001)
cd ml-service && uvicorn main:app --reload --port 8001

# Application mobile
cd mobile && npx expo start

# Explorer la DB
cd api && npx prisma studio
```

### Migrations et seeds

```bash
cd api && npx prisma migrate dev          # Nouvelle migration
cd api && npx prisma migrate reset        # Reset complet (dev seulement)
cd api && npx prisma db seed              # Seed des aliments (~20 items)
```

### Docker

```bash
# Production
docker compose up -d

# Développement (hot reload)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Avec pgAdmin (accessible sur http://localhost:5050)
docker compose --profile dev up -d

# Migrations et seeds dans Docker
docker compose exec api npx prisma migrate dev
docker compose exec api npx prisma db seed

# Logs
docker compose logs -f api
docker compose logs -f ml-service
```

### Lancer l'app sur simulateur iOS

**Prérequis (une seule fois) :**

```bash
# 1. Installer Xcode depuis le Mac App Store (~12 GB)
#    → Ouvrir Xcode une première fois et attendre l'installation des composants
#    → SEULEMENT APRÈS l'installation complète, exécuter :
sudo xcodebuild -license accept
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer

# 2. Installer les dépendances mobile
cd mobile && npm install

# 3. Créer le fichier d'environnement mobile (si absent)
echo 'EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1' > mobile/.env
```

**Lancement :**

```bash
# S'assurer que les services backend tournent
docker compose up -d

# Lancer sur simulateur iPhone (ouvre le simulateur automatiquement)
cd mobile && npx expo start --ios

# Changer de modèle d'iPhone dans le terminal Expo : touche 's'
# Ouvrir le menu développeur dans le simulateur : Cmd+D
```

### Tests

```bash
cd api && npm test           # Jest (services + controllers)
cd ml-service && pytest      # Formules + scorer
```

---

## Points d'attention

- Lire `docs/SKILL.md` avant de modifier `ml-service/`
- Le ml-service reçoit **toujours** les données via l'API Node, jamais accès direct à la DB
- Les valeurs nutritionnelles sont **toujours** pour 100g — scaling = `quantity_g / 100`
- `DailyLog.target_*` est un snapshot immuable — ne jamais recalculer depuis `User`
- Les enums Prisma, TypeScript (`shared/types/`) et Python (`formulas.py`) doivent rester synchronisés

---

## Structure

```
Healthbar/
├── api/               Node.js + Express + Prisma (port 3000)
├── ml-service/        Python + FastAPI + scikit-learn (port 8001)
├── mobile/            React Native + Expo Router
├── shared/types/      Types TypeScript partagés
├── docs/              SKILL.md, formulas.md
├── docker-compose.yml
└── .env.example
```
