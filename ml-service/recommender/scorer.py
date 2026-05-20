"""
Meal scoring based on alignment with the remaining daily macro budget.

Algorithm:
1. Compute cosine similarity between the meal's macro vector and the
   remaining-budget vector.
2. Apply a proportional penalty for any macro that would exceed the
   remaining budget.
3. Final score ∈ [0.0, 1.0] — higher is better.

The penalty ensures that a meal that fits perfectly within budget ranks
higher than one that only partially matches but causes an overage.
"""

from dataclasses import dataclass

import numpy as np


@dataclass
class ScoredMeal:
    meal_id: str
    score: float          # Fit score ∈ [0.0, 1.0]
    exceeds_budget: bool  # True if any macro would be exceeded


# Macro keys used in feature vectors — order must be consistent
_MACRO_KEYS = ("calories", "proteins_g", "carbs_g", "fats_g")


def _cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """Compute cosine similarity. Returns 0.0 for zero-magnitude vectors."""
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(vec_b)
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return float(np.dot(vec_a, vec_b) / (norm_a * norm_b))


def _calc_penalty(meal_macros: dict, remaining: dict) -> float:
    """
    Calculate a penalty multiplier ∈ (0.0, 1.0] for macro overages.

    No penalty  → 1.0 (meal fits within all remaining budgets).
    Full penalty → approaches 0.0 as the worst overage grows.

    Uses smooth decay: penalty = 1 / (1 + max_overage_ratio)
    where max_overage_ratio is the largest (overage / remaining) ratio.
    """
    max_ratio = 0.0

    for key in _MACRO_KEYS:
        remaining_val = remaining.get(key, 0.0)
        meal_val = meal_macros.get(key, 0.0)

        if remaining_val <= 0.0:
            # Budget already exhausted — any positive meal value is a full overage
            if meal_val > 0.0:
                max_ratio = max(max_ratio, 1.0)
        elif meal_val > remaining_val:
            # Partial overage — ratio of excess relative to remaining budget
            ratio = (meal_val - remaining_val) / remaining_val
            max_ratio = max(max_ratio, ratio)

    return 1.0 / (1.0 + max_ratio)


def score_meal(meal_macros: dict, remaining_macros: dict) -> float:
    """
    Score a single meal against the remaining daily macro budget.

    Args:
        meal_macros:      Dict with keys: calories, proteins_g, carbs_g, fats_g.
                          Values represent the meal's macro contribution.
        remaining_macros: Dict with same keys — remaining budget for the day.

    Returns:
        Score in [0.0, 1.0]. Negative values are clamped to 0.0.
    """
    meal_vec = np.array(
        [max(meal_macros.get(k, 0.0), 0.0) for k in _MACRO_KEYS],
        dtype=float,
    )
    remaining_vec = np.array(
        [max(remaining_macros.get(k, 0.0), 0.0) for k in _MACRO_KEYS],
        dtype=float,
    )

    similarity = _cosine_similarity(meal_vec, remaining_vec)
    penalty = _calc_penalty(meal_macros, remaining_macros)

    raw_score = similarity * penalty
    return round(float(np.clip(raw_score, 0.0, 1.0)), 4)


def rank_meals(
    meals: list[dict],
    remaining_macros: dict,
) -> list[ScoredMeal]:
    """
    Rank a collection of meals by their fit with the remaining macro budget.

    Args:
        meals:            List of meal dicts with keys: id, calories, proteins_g,
                          carbs_g, fats_g.
        remaining_macros: Remaining daily macro budget dict.

    Returns:
        List of ScoredMeal sorted by score descending (best fit first).
    """
    scored: list[ScoredMeal] = []

    for meal in meals:
        meal_macros = {k: meal.get(k, 0.0) for k in _MACRO_KEYS}
        score = score_meal(meal_macros, remaining_macros)

        exceeds = any(
            meal_macros.get(k, 0.0) > remaining_macros.get(k, 0.0)
            for k in _MACRO_KEYS
        )

        scored.append(ScoredMeal(
            meal_id=meal["id"],
            score=score,
            exceeds_budget=exceeds,
        ))

    scored.sort(key=lambda x: x.score, reverse=True)
    return scored
