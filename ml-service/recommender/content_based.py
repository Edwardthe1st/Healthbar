"""
Content-based meal recommender using cosine similarity on nutritional features.

Algorithm:
1. Scale all candidate meal features with StandardScaler (fit on the full candidate pool
   for a stable reference distribution).
2. Build a user profile vector = mean of scaled vectors from liked meals.
3. Compute cosine similarity between the user profile and each unseen candidate.
4. Return the top_n candidates sorted by similarity descending.

Already-liked meals are always excluded from the recommendation output.
"""

from dataclasses import dataclass

import numpy as np
from sklearn.preprocessing import StandardScaler


@dataclass
class RecommendedMeal:
    meal_id: str
    similarity: float  # Clamped to [0.0, 1.0]


# Feature dimensions used for similarity comparison
_FEATURE_KEYS = ("calories", "proteins_g", "carbs_g", "fats_g")


def _extract_features(meals: list[dict]) -> np.ndarray:
    """Stack meal dicts into a 2-D NumPy feature matrix (n_meals × n_features)."""
    return np.array(
        [[meal[k] for k in _FEATURE_KEYS] for meal in meals],
        dtype=float,
    )


def find_similar_meals(
    liked_meals: list[dict],
    candidate_meals: list[dict],
    top_n: int = 5,
) -> list[RecommendedMeal]:
    """
    Find meals similar to the user's nutritional preference profile.

    Args:
        liked_meals:     Meals previously logged/liked by the user.
                         Each dict must contain: id, calories, proteins_g,
                         carbs_g, fats_g.
        candidate_meals: All meals available for recommendation (same schema).
                         The scaler is fit on this full pool.
        top_n:           Maximum number of recommendations to return.

    Returns:
        List of RecommendedMeal sorted by similarity descending.
        Returns an empty list if liked_meals or candidate_meals is empty,
        or if all candidates are already in liked_meals.
    """
    if not liked_meals or not candidate_meals:
        return []

    liked_ids = {meal["id"] for meal in liked_meals}
    unseen = [m for m in candidate_meals if m["id"] not in liked_ids]

    if not unseen:
        return []

    # Fit scaler on the full candidate pool for a stable distribution reference
    all_features = _extract_features(candidate_meals)
    scaler = StandardScaler()
    scaler.fit(all_features)

    # Build user preference profile from scaled liked-meal vectors
    liked_features = _extract_features(liked_meals)
    scaled_liked = scaler.transform(liked_features)
    user_profile: np.ndarray = scaled_liked.mean(axis=0)  # shape (n_features,)

    # Scale unseen candidates
    unseen_features = _extract_features(unseen)
    scaled_unseen = scaler.transform(unseen_features)

    profile_norm = float(np.linalg.norm(user_profile))
    results: list[RecommendedMeal] = []

    for i, meal in enumerate(unseen):
        candidate_vec = scaled_unseen[i]
        candidate_norm = float(np.linalg.norm(candidate_vec))

        if profile_norm == 0.0 or candidate_norm == 0.0:
            similarity = 0.0
        else:
            dot = float(np.dot(user_profile, candidate_vec))
            similarity = dot / (profile_norm * candidate_norm)

        # Negative cosine means the item is dissimilar — clamp to 0 so scores
        # stay interpretable as a "match quality" measure in [0, 1].
        similarity = round(float(np.clip(similarity, 0.0, 1.0)), 4)

        results.append(RecommendedMeal(meal_id=meal["id"], similarity=similarity))

    results.sort(key=lambda x: x.similarity, reverse=True)
    return results[:top_n]
