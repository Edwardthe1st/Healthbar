/**
 * Open Food Facts integration — free, open food product database.
 * https://world.openfoodfacts.org — ODbL license.
 *
 * Used for real-time search of packaged products not in the local DB.
 * Results are returned as-is; they get saved to the local DB when the
 * user explicitly adds a product to a meal (via POST /foods with upsert).
 */

const OFF_SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';
const OFF_FIELDS = 'id,product_name,brands,nutriments';
// Identify the app to OFF as recommended by their API guidelines
const USER_AGENT = 'NutriApp/1.0 (https://github.com/nutriapp)';

// ─── OFF API types ─────────────────────────────────────────────────────────────

interface OFFNutriments {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
  sugars_100g?: number;
  'saturated-fat_100g'?: number;
  salt_100g?: number;
}

interface OFFProduct {
  id: string;
  product_name?: string;
  brands?: string;
  nutriments?: OFFNutriments;
}

// ─── Mapped type (matches our Food schema) ────────────────────────────────────

export interface OFFFood {
  external_id: string;
  name: string;
  brand: string | null;
  calories_per_100g: number;
  proteins_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number;
  sugar_per_100g: number | null;
  saturated_fats_per_100g: number | null;
  salt_per_100g: number | null;
  source: 'OPEN_FOOD_FACTS';
}

function safeNum(v: number | undefined): number {
  return v !== undefined && isFinite(v) ? Math.max(0, v) : 0;
}

function safeNumNullable(v: number | undefined): number | null {
  return v !== undefined && isFinite(v) ? Math.max(0, v) : null;
}

function mapProduct(p: OFFProduct): OFFFood | null {
  const n = p.nutriments;
  const name = p.product_name?.trim();

  // Skip products missing essential data
  if (!name || !n || n['energy-kcal_100g'] === undefined) return null;

  return {
    external_id: `off-${p.id}`,
    name,
    brand: p.brands?.split(',')[0]?.trim() || null,
    calories_per_100g: safeNum(n['energy-kcal_100g']),
    proteins_per_100g: safeNum(n.proteins_100g),
    carbs_per_100g: safeNum(n.carbohydrates_100g),
    fats_per_100g: safeNum(n.fat_100g),
    fiber_per_100g: safeNum(n.fiber_100g),
    sugar_per_100g: safeNumNullable(n.sugars_100g),
    saturated_fats_per_100g: safeNumNullable(n['saturated-fat_100g']),
    salt_per_100g: safeNumNullable(n.salt_100g),
    source: 'OPEN_FOOD_FACTS',
  };
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function searchOpenFoodFacts(query: string, limit = 20): Promise<OFFFood[]> {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: String(Math.min(limit, 50)),
    lc: 'fr',
    cc: 'fr',
    fields: OFF_FIELDS,
  });

  try {
    const res = await fetch(`${OFF_SEARCH_URL}?${params}`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) return [];

    const data = await res.json() as { products?: OFFProduct[] };

    return (data.products ?? [])
      .map(mapProduct)
      .filter((f): f is OFFFood => f !== null)
      .slice(0, limit);
  } catch {
    // Network error / timeout — fail silently, don't break the request
    return [];
  }
}
