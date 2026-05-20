import { FoodSource } from '@prisma/client';
import prisma from '../lib/prisma';

export async function searchFoods(query: string, limit: number) {
  return prisma.food.findMany({
    where: query
      ? { name: { contains: query, mode: 'insensitive' } }
      : undefined,
    take: limit,
    orderBy: { name: 'asc' },
  });
}

export async function findById(id: string) {
  return prisma.food.findUnique({ where: { id } });
}

export interface CreateFoodInput {
  name: string;
  brand?: string | null;
  calories_per_100g: number;
  proteins_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number;
  sugar_per_100g?: number | null;
  saturated_fats_per_100g?: number | null;
  salt_per_100g?: number | null;
  source: FoodSource;
  external_id?: string | null;
}

export async function createFood(data: CreateFoodInput) {
  return prisma.food.create({ data });
}

/**
 * Returns an existing food if `external_id` is already in DB, otherwise creates it.
 * Used when importing from Open Food Facts or CIQUAL to avoid duplicates.
 */
export async function upsertByExternalId(data: CreateFoodInput & { external_id: string }) {
  const existing = await prisma.food.findFirst({
    where: { external_id: data.external_id },
  });
  if (existing) return existing;
  return prisma.food.create({ data });
}
