# NutriApp — SKILL.md

## Contexte du projet

Application mobile de suivi nutritionnel avec recommandations alimentaires
personnalisées. Mobile-first (React Native + Expo Router).

Pas d'API IA externe : toute la logique intelligente est dans
`ml-service/` (Python + scikit-learn). L'API Node.js est un
orchestrateur — elle collecte les données, appelle le ml-service,
et renvoie les résultats. Elle ne fait aucun calcul nutritionnel.

---

## Règles absolues

| Règle | Détail |
|-------|--------|
| **100g** | Toutes les valeurs nutritionnelles sont **toujours** stockées pour 100g. La formule de scaling est `valeur = (valeur_per_100g × quantity_g) / 100`. |
| **Minimums caloriques** | Ne jamais recommander < 1200 kcal/j (femme) ou < 1500 kcal/j (homme), quelles que soient les entrées. |
| **Snapshot DailyLog** | `DailyLog.target_*` est fixé au moment de la création du log. Ne **jamais** le recalculer depuis les données `User` a posteriori. |
| **Templates** | Les repas avec `is_template=true` et `user_id=null` sont globaux et en **lecture seule** pour les utilisateurs. |
| **ML isolé** | Le ml-service ne lit **jamais** la DB directement. C'est toujours l'API Node qui lui passe les données via le corps de requête HTTP. |
| **Mifflin-St Jeor** | Utiliser **uniquement** Mifflin-St Jeor (1990). Jamais Harris-Benedict. Voir `ml-service/nutrition/formulas.py`. |

---

## Architecture des services

```
Mobile (Expo)
    │  HTTP / REST
    ▼
API Node.js (port 3000)
    │  HTTP (interne Docker)
    ▼
ML Service Python (port 8001)   ← jamais accès direct à la DB

PostgreSQL (port interne uniquement)
    ▲
    └── API Node.js (via Prisma)
```

---

## Conventions de code

### TypeScript (api/ + mobile/)
- `strict: true` activé dans tous les `tsconfig.json`
- Nommage **camelCase** pour les variables et fonctions
- Nommage **snake_case** pour les champs DB (Prisma)
- Chaque controller : valide l'input (Zod) → appelle le service → retourne la réponse
- Toute logique métier dans `services/`, jamais dans `routes/` ni `controllers/`

### Python (ml-service/)
- Nommage **snake_case** partout
- Typage via Pydantic pour toutes les I/O FastAPI
- Fonctions pures sans effet de bord dans `nutrition/` et `recommender/`

---

## Structure d'une réponse API

```json
// Succès
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2024-01-15T10:30:00.000Z", "version": "1.0" }
}

// Erreur
{
  "success": false,
  "error": { "code": "MEAL_NOT_FOUND", "message": "Meal not found" }
}
```

---

## Variables d'environnement requises

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret pour les access tokens (15 min) |
| `JWT_REFRESH_SECRET` | Secret pour les refresh tokens (7 j) |
| `ML_SERVICE_URL` | URL du ml-service (ex: `http://localhost:8001`) |
| `PORT` | Port de l'API Node (défaut: 3000) |

---

## Enums synchronisés

Les enums suivants doivent rester identiques dans Prisma, TypeScript et Python :

- `Gender` : MALE / FEMALE / OTHER
- `ActivityLevel` : SEDENTARY / LIGHT / MODERATE / ACTIVE / VERY_ACTIVE
- `Goal` : LOSE_WEIGHT / MAINTAIN / GAIN_MUSCLE
- `FoodSource` : USDA / OPEN_FOOD_FACTS / CUSTOM
- `MealTime` : BREAKFAST / LUNCH / DINNER / SNACK

---

## Tests

```bash
cd api && npm test          # Jest — tests services et controllers
cd ml-service && pytest    # tests formules (formulas.py) et scorer (scorer.py)
```
