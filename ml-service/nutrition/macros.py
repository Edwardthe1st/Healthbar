"""
Macro-nutrient distribution and per-meal calculation utilities.

Macro splits are goal-specific and aligned with standard sports nutrition
guidelines. All caloric densities follow Atwater factors.
"""

from dataclasses import dataclass

from .formulas import Goal


# ─── Constants ────────────────────────────────────────────────────────────────

# Atwater caloric density (kcal per gram)
KCAL_PER_G_PROTEIN = 4.0
KCAL_PER_G_CARBS = 4.0
KCAL_PER_G_FAT = 9.0

# Target macro ratios (% of total calories) per body-composition goal
# Protein and carbs = 4 kcal/g, fat = 9 kcal/g
MACRO_RATIOS: dict[Goal, dict[str, float]] = {
    Goal.LOSE_WEIGHT: {"protein": 0.35, "carbs": 0.35, "fat": 0.30},
    Goal.MAINTAIN:    {"protein": 0.30, "carbs": 0.40, "fat": 0.30},
    Goal.GAIN_MUSCLE: {"protein": 0.35, "carbs": 0.45, "fat": 0.20},
}


# ─── Data classes ─────────────────────────────────────────────────────────────

@dataclass
class MacroTargets:
    calories: float
    proteins_g: float
    carbs_g: float
    fats_g: float


@dataclass
class FoodMacros:
    calories: float
    proteins_g: float
    carbs_g: float
    fats_g: float
    fiber_g: float


@dataclass
class MealMacros:
    calories: float
    proteins_g: float
    carbs_g: float
    fats_g: float
    fiber_g: float


@dataclass
class RemainingMacros:
    calories: float
    proteins_g: float
    carbs_g: float
    fats_g: float


# ─── Functions ────────────────────────────────────────────────────────────────

def calc_macro_targets(target_calories: float, goal: Goal) -> MacroTargets:
    """
    Convert a calorie target into gram targets for each macro based on goal.

    Args:
        target_calories: Daily calorie target in kcal (after safety floor applied).
        goal:            Body-composition goal — determines the macro split ratio.

    Returns:
        MacroTargets with gram quantities rounded to 1 decimal.
    """
    ratios = MACRO_RATIOS[goal]

    proteins_g = (target_calories * ratios["protein"]) / KCAL_PER_G_PROTEIN
    carbs_g = (target_calories * ratios["carbs"]) / KCAL_PER_G_CARBS
    fats_g = (target_calories * ratios["fat"]) / KCAL_PER_G_FAT

    return MacroTargets(
        calories=round(target_calories, 1),
        proteins_g=round(proteins_g, 1),
        carbs_g=round(carbs_g, 1),
        fats_g=round(fats_g, 1),
    )


def calc_food_macros(
    calories_per_100g: float,
    proteins_per_100g: float,
    carbs_per_100g: float,
    fats_per_100g: float,
    fiber_per_100g: float,
    quantity_g: float,
) -> FoodMacros:
    """
    Scale per-100g nutritional values to the actual consumed quantity.

    Formula: value = (value_per_100g × quantity_g) / 100

    Args:
        *_per_100g: Nutritional value per 100 grams of food.
        quantity_g: Actual portion size in grams.

    Returns:
        FoodMacros with absolute values for the given portion.
    """
    factor = quantity_g / 100.0
    return FoodMacros(
        calories=round(calories_per_100g * factor, 1),
        proteins_g=round(proteins_per_100g * factor, 1),
        carbs_g=round(carbs_per_100g * factor, 1),
        fats_g=round(fats_per_100g * factor, 1),
        fiber_g=round(fiber_per_100g * factor, 1),
    )


def calc_meal_macros(foods: list[dict]) -> MealMacros:
    """
    Sum macro-nutrients across all foods in a meal.

    Args:
        foods: List of dicts, each containing:
               calories_per_100g, proteins_per_100g, carbs_per_100g,
               fats_per_100g, fiber_per_100g, quantity_g.

    Returns:
        MealMacros with aggregated totals rounded to 1 decimal.
    """
    total_calories = 0.0
    total_proteins = 0.0
    total_carbs = 0.0
    total_fats = 0.0
    total_fiber = 0.0

    for food in foods:
        item = calc_food_macros(
            calories_per_100g=food["calories_per_100g"],
            proteins_per_100g=food["proteins_per_100g"],
            carbs_per_100g=food["carbs_per_100g"],
            fats_per_100g=food["fats_per_100g"],
            fiber_per_100g=food["fiber_per_100g"],
            quantity_g=food["quantity_g"],
        )
        total_calories += item.calories
        total_proteins += item.proteins_g
        total_carbs += item.carbs_g
        total_fats += item.fats_g
        total_fiber += item.fiber_g

    return MealMacros(
        calories=round(total_calories, 1),
        proteins_g=round(total_proteins, 1),
        carbs_g=round(total_carbs, 1),
        fats_g=round(total_fats, 1),
        fiber_g=round(total_fiber, 1),
    )


def calc_remaining_macros(targets: dict, consumed: dict) -> RemainingMacros:
    """
    Compute how much macro budget remains for the day.

    Args:
        targets:  Dict with keys: calories, proteins_g, carbs_g, fats_g.
        consumed: Dict with the same keys — total consumed so far today.

    Returns:
        RemainingMacros. Values can be negative when the user is over budget.
    """
    return RemainingMacros(
        calories=round(targets["calories"] - consumed["calories"], 1),
        proteins_g=round(targets["proteins_g"] - consumed["proteins_g"], 1),
        carbs_g=round(targets["carbs_g"] - consumed["carbs_g"], 1),
        fats_g=round(targets["fats_g"] - consumed["fats_g"], 1),
    )
