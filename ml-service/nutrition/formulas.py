"""
Mifflin-St Jeor (1990) formulas for BMR and TDEE calculation.

Reference:
    Mifflin MD, St Jeor ST, Hill LA, Scott BJ, Daugherty SA, Koh YO.
    A new predictive equation for resting energy expenditure in healthy individuals.
    Am J Clin Nutr. 1990;51(2):241–247.

IMPORTANT: This module uses ONLY Mifflin-St Jeor, never Harris-Benedict.
"""

from enum import Enum


class Gender(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"


class ActivityLevel(str, Enum):
    SEDENTARY = "SEDENTARY"
    LIGHT = "LIGHT"
    MODERATE = "MODERATE"
    ACTIVE = "ACTIVE"
    VERY_ACTIVE = "VERY_ACTIVE"


class Goal(str, Enum):
    LOSE_WEIGHT = "LOSE_WEIGHT"
    MAINTAIN = "MAINTAIN"
    GAIN_MUSCLE = "GAIN_MUSCLE"


# Physical activity level multipliers (PAL coefficients)
ACTIVITY_MULTIPLIERS: dict[ActivityLevel, float] = {
    ActivityLevel.SEDENTARY: 1.2,    # Little or no exercise, desk job
    ActivityLevel.LIGHT: 1.375,      # Light exercise 1–3 days/week
    ActivityLevel.MODERATE: 1.55,    # Moderate exercise 3–5 days/week
    ActivityLevel.ACTIVE: 1.725,     # Hard exercise 6–7 days/week
    ActivityLevel.VERY_ACTIVE: 1.9,  # Hard daily exercise + physical job or 2× training
}

# Caloric adjustments applied on top of TDEE to meet body composition goals
GOAL_ADJUSTMENTS: dict[Goal, float] = {
    Goal.LOSE_WEIGHT: -300.0,  # Moderate deficit (≈0.3 kg/week loss)
    Goal.MAINTAIN: 0.0,
    Goal.GAIN_MUSCLE: +300.0,  # Lean bulk surplus
}

# Minimum daily caloric intake — medical safety thresholds
MIN_CALORIES_FEMALE = 1200.0
MIN_CALORIES_MALE = 1500.0
MIN_CALORIES_OTHER = (MIN_CALORIES_FEMALE + MIN_CALORIES_MALE) / 2  # 1350.0


def calc_bmr(
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: Gender,
) -> float:
    """
    Calculate Basal Metabolic Rate (kcal/day) using Mifflin-St Jeor (1990).

    Args:
        weight_kg: Body weight in kilograms.
        height_cm: Height in centimetres.
        age:       Age in years.
        gender:    Biological sex — determines formula constant.

    Returns:
        BMR in kcal/day (≥ 0).

    Formula:
        base   = (10 × weight_kg) + (6.25 × height_cm) − (5 × age)
        male   = base + 5
        female = base − 161
        other  = (male + female) / 2
    """
    base = (10.0 * weight_kg) + (6.25 * height_cm) - (5.0 * age)

    if gender == Gender.MALE:
        return base + 5.0
    elif gender == Gender.FEMALE:
        return base - 161.0
    else:
        # OTHER: average of male and female variants (no binary assumption)
        bmr_male = base + 5.0
        bmr_female = base - 161.0
        return (bmr_male + bmr_female) / 2.0


def calc_tdee(bmr: float, activity_level: ActivityLevel) -> float:
    """
    Calculate Total Daily Energy Expenditure (kcal/day).

    Args:
        bmr:            Basal Metabolic Rate from calc_bmr().
        activity_level: Self-reported physical activity level.

    Returns:
        TDEE in kcal/day.
    """
    return bmr * ACTIVITY_MULTIPLIERS[activity_level]


def calc_target_calories(
    tdee: float,
    goal: Goal,
    gender: Gender,
) -> float:
    """
    Apply goal-based adjustment to TDEE and enforce medical minimum thresholds.

    The minimum caloric floors (1200 kcal for women, 1500 kcal for men) are
    non-negotiable safety guardrails — they override any goal adjustment.

    Args:
        tdee:   Total Daily Energy Expenditure from calc_tdee().
        goal:   User's body-composition goal.
        gender: Used to select the appropriate minimum caloric floor.

    Returns:
        Target calories in kcal/day, always ≥ medical minimum.
    """
    target = tdee + GOAL_ADJUSTMENTS[goal]

    minimum = {
        Gender.FEMALE: MIN_CALORIES_FEMALE,
        Gender.MALE: MIN_CALORIES_MALE,
        Gender.OTHER: MIN_CALORIES_OTHER,
    }[gender]

    return max(target, minimum)
