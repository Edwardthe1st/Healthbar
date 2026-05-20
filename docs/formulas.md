# NutriApp — Formules nutritionnelles

## Référence

Toutes les formules sont basées sur **Mifflin-St Jeor (1990)** :

> Mifflin MD, St Jeor ST, Hill LA, Scott BJ, Daugherty SA, Koh YO.
> *A new predictive equation for resting energy expenditure in healthy individuals.*
> Am J Clin Nutr. 1990;51(2):241–247.

---

## 1. Métabolisme de base (BMR)

```
Homme  : BMR = (10 × poids_kg) + (6.25 × taille_cm) − (5 × âge) + 5
Femme  : BMR = (10 × poids_kg) + (6.25 × taille_cm) − (5 × âge) − 161
Autre  : BMR = (BMR_homme + BMR_femme) / 2
```

**Unité :** kcal/jour

---

## 2. Dépense énergétique totale (TDEE)

```
TDEE = BMR × multiplicateur_activité
```

| Niveau d'activité | Multiplicateur |
|-------------------|---------------|
| SEDENTARY         | 1.20          |
| LIGHT             | 1.375         |
| MODERATE          | 1.55          |
| ACTIVE            | 1.725         |
| VERY_ACTIVE       | 1.90          |

---

## 3. Objectif calorique

```
Calories_cibles = TDEE + ajustement_objectif
```

| Objectif    | Ajustement |
|-------------|-----------|
| LOSE_WEIGHT | −300 kcal |
| MAINTAIN    |   0 kcal  |
| GAIN_MUSCLE | +300 kcal |

### Planchers de sécurité médicaux

Le résultat est plafonné vers le bas :

- **Femme** : minimum 1200 kcal/j
- **Homme** : minimum 1500 kcal/j
- **Autre** : minimum 1350 kcal/j (moyenne)

---

## 4. Répartition des macros

Calculée depuis les calories cibles :

| Objectif    | Protéines | Glucides | Lipides |
|-------------|-----------|---------|--------|
| LOSE_WEIGHT | 35%       | 35%     | 30%    |
| MAINTAIN    | 30%       | 40%     | 30%    |
| GAIN_MUSCLE | 35%       | 45%     | 20%    |

**Conversion % → grammes** (densité calorique Atwater) :

```
protéines_g = (calories × ratio_P) / 4
glucides_g  = (calories × ratio_G) / 4
lipides_g   = (calories × ratio_L) / 9
```

---

## 5. Macros d'un aliment / repas

Toutes les valeurs nutritionnelles sont stockées **pour 100g**.
La valeur réelle consommée se calcule avec :

```
valeur = (valeur_per_100g × quantity_g) / 100
```

Pour un repas, on somme les valeurs de tous ses aliments.

---

## 6. Score de recommandation de repas

**Algorithme :** Similarité cosinus + pénalité de dépassement

```
score_brut = cosine_similarity(vecteur_repas, vecteur_budget_restant)
pénalité   = 1 / (1 + max_ratio_dépassement)
score_final = score_brut × pénalité   ∈ [0.0, 1.0]
```

Le vecteur = `[calories, protéines_g, glucides_g, lipides_g]`

**Pénalité :** pour chaque macro dépassant le budget restant,
on calcule `ratio = (excès) / budget_restant`. La pénalité est
basée sur le plus grand ratio observé (`max_ratio`).

---

## 7. Recommandation content-based (similar meals)

```
1. StandardScaler fit sur tous les repas candidats
2. Profil utilisateur = mean(scaled_liked_meals)
3. similarity = cosine(profil, scaled_candidate)   [clampé à 0..1]
4. Retourner top_n par similarité décroissante
```

Vecteur de features : `[calories, protéines_g, glucides_g, lipides_g]`
