"""
NutriApp ML Microservice — FastAPI

Provides nutrition calculation and meal recommendation endpoints.
The Node.js API orchestrator passes all data as request bodies;
this service NEVER accesses the database directly.

Port: 8001
"""

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from nutrition.formulas import (
    ActivityLevel,
    Gender,
    Goal,
    calc_bmr,
    calc_target_calories,
    calc_tdee,
)
from nutrition.macros import (
    calc_macro_targets,
    calc_meal_macros,
    calc_remaining_macros,
)
from recommender.content_based import find_similar_meals
from recommender.scorer import rank_meals
from assistant.chat import chat as ollama_chat
from assistant.context_builder import build_system_prompt

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="NutriApp ML Service",
    version="1.0.0",
    description=(
        "Nutrition formula calculations (Mifflin-St Jeor 1990) "
        "and content-based meal recommendations."
    ),
)

# Restrict via Docker networking, not CORS headers, in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# ─── Request / Response schemas ───────────────────────────────────────────────


class NutritionProfileRequest(BaseModel):
    weight_kg: float = Field(..., gt=0, description="Body weight in kg")
    height_cm: float = Field(..., gt=0, description="Height in cm")
    age: int = Field(..., gt=0, lt=150, description="Age in years")
    gender: Gender
    activity_level: ActivityLevel
    goal: Goal


class NutritionProfileResponse(BaseModel):
    bmr: float
    tdee: float
    target_calories: float
    target_proteins_g: float
    target_carbs_g: float
    target_fats_g: float


class FoodItem(BaseModel):
    calories_per_100g: float = Field(..., ge=0)
    proteins_per_100g: float = Field(..., ge=0)
    carbs_per_100g: float = Field(..., ge=0)
    fats_per_100g: float = Field(..., ge=0)
    fiber_per_100g: float = Field(..., ge=0)
    quantity_g: float = Field(..., gt=0)


class MealMacrosRequest(BaseModel):
    foods: list[FoodItem] = Field(..., min_length=1)


class MealMacrosResponse(BaseModel):
    calories: float
    proteins_g: float
    carbs_g: float
    fats_g: float
    fiber_g: float


class RemainingMacrosRequest(BaseModel):
    targets: dict   # calories, proteins_g, carbs_g, fats_g
    consumed: dict  # same keys


class RemainingMacrosResponse(BaseModel):
    calories: float
    proteins_g: float
    carbs_g: float
    fats_g: float


class MealForRanking(BaseModel):
    id: str
    calories: float = Field(..., ge=0)
    proteins_g: float = Field(..., ge=0)
    carbs_g: float = Field(..., ge=0)
    fats_g: float = Field(..., ge=0)


class RankMealsRequest(BaseModel):
    meals: list[MealForRanking]
    remaining_macros: dict  # calories, proteins_g, carbs_g, fats_g


class RankedMealItem(BaseModel):
    meal_id: str
    score: float
    exceeds_budget: bool


class RankMealsResponse(BaseModel):
    ranked: list[RankedMealItem]


class MealForRecommend(BaseModel):
    id: str
    calories: float = Field(..., ge=0)
    proteins_g: float = Field(..., ge=0)
    carbs_g: float = Field(..., ge=0)
    fats_g: float = Field(..., ge=0)


class SimilarMealsRequest(BaseModel):
    liked_meals: list[MealForRecommend]
    candidate_meals: list[MealForRecommend]
    top_n: int = Field(default=5, ge=1, le=20)


class SimilarMealItem(BaseModel):
    meal_id: str
    similarity: float


class SimilarMealsResponse(BaseModel):
    recommendations: list[SimilarMealItem]


# ─── Endpoints ────────────────────────────────────────────────────────────────


@app.get("/health", tags=["meta"])
def health_check():
    """Liveness probe — returns 200 when the service is ready."""
    return {"status": "ok", "service": "ml-service", "version": "1.0.0"}


@app.post(
    "/nutrition/profile",
    response_model=NutritionProfileResponse,
    tags=["nutrition"],
)
def nutrition_profile(req: NutritionProfileRequest):
    """
    Calculate a full nutrition profile using Mifflin-St Jeor (1990).

    Returns BMR, TDEE, calorie target (with safety floor), and macro targets.
    """
    try:
        bmr = calc_bmr(req.weight_kg, req.height_cm, req.age, req.gender)
        tdee = calc_tdee(bmr, req.activity_level)
        target_cals = calc_target_calories(tdee, req.goal, req.gender)
        macros = calc_macro_targets(target_cals, req.goal)

        return NutritionProfileResponse(
            bmr=round(bmr, 1),
            tdee=round(tdee, 1),
            target_calories=macros.calories,
            target_proteins_g=macros.proteins_g,
            target_carbs_g=macros.carbs_g,
            target_fats_g=macros.fats_g,
        )
    except Exception as exc:
        logger.exception("Error in /nutrition/profile")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post(
    "/nutrition/meal-macros",
    response_model=MealMacrosResponse,
    tags=["nutrition"],
)
def meal_macros(req: MealMacrosRequest):
    """Aggregate macro-nutrients for a list of foods (one meal)."""
    try:
        foods_dicts = [f.model_dump() for f in req.foods]
        result = calc_meal_macros(foods_dicts)
        return MealMacrosResponse(
            calories=result.calories,
            proteins_g=result.proteins_g,
            carbs_g=result.carbs_g,
            fats_g=result.fats_g,
            fiber_g=result.fiber_g,
        )
    except Exception as exc:
        logger.exception("Error in /nutrition/meal-macros")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post(
    "/nutrition/remaining",
    response_model=RemainingMacrosResponse,
    tags=["nutrition"],
)
def remaining_macros(req: RemainingMacrosRequest):
    """Compute the remaining macro budget for the day (targets − consumed)."""
    try:
        result = calc_remaining_macros(req.targets, req.consumed)
        return RemainingMacrosResponse(
            calories=result.calories,
            proteins_g=result.proteins_g,
            carbs_g=result.carbs_g,
            fats_g=result.fats_g,
        )
    except Exception as exc:
        logger.exception("Error in /nutrition/remaining")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post(
    "/recommend/rank",
    response_model=RankMealsResponse,
    tags=["recommend"],
)
def recommend_rank(req: RankMealsRequest):
    """Rank meals by cosine similarity with the remaining macro budget."""
    try:
        meals_dicts = [m.model_dump() for m in req.meals]
        ranked = rank_meals(meals_dicts, req.remaining_macros)
        return RankMealsResponse(
            ranked=[
                RankedMealItem(
                    meal_id=r.meal_id,
                    score=r.score,
                    exceeds_budget=r.exceeds_budget,
                )
                for r in ranked
            ]
        )
    except Exception as exc:
        logger.exception("Error in /recommend/rank")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post(
    "/recommend/similar",
    response_model=SimilarMealsResponse,
    tags=["recommend"],
)
def recommend_similar(req: SimilarMealsRequest):
    """Find meals similar to the user's nutritional preference profile."""
    try:
        liked_dicts = [m.model_dump() for m in req.liked_meals]
        candidate_dicts = [m.model_dump() for m in req.candidate_meals]
        results = find_similar_meals(liked_dicts, candidate_dicts, req.top_n)
        return SimilarMealsResponse(
            recommendations=[
                SimilarMealItem(meal_id=r.meal_id, similarity=r.similarity)
                for r in results
            ]
        )
    except Exception as exc:
        logger.exception("Error in /recommend/similar")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ─── Assistant ────────────────────────────────────────────────────────────────


class ChatInput(BaseModel):
    messages:     list[dict]  # [{role: str, content: str}]
    user_context: dict


@app.post("/assistant/chat", tags=["assistant"])
async def assistant_chat(data: ChatInput):
    """
    Forward a conversation to the local Ollama model (phi3:mini) with a
    contextualised system prompt built from the user's nutrition data.
    """
    try:
        system_prompt = build_system_prompt(data.user_context)
        response = await ollama_chat(data.messages, system_prompt)
        return {"response": response}
    except Exception as exc:
        logger.exception("Error in /assistant/chat")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
