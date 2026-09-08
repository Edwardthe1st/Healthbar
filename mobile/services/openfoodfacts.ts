/** Open Food Facts API service */

const BASE = 'https://world.openfoodfacts.org';
const USER_AGENT = 'Healthbar/1.0 (healthbar.app)';

/* ── Raw API shape ── */

export interface OFFNutriments {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
}

export interface OFFProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  serving_size?: string;
  nutriments?: OFFNutriments;
  image_small_url?: string;
}

/* ── Normalised shape used by the app ── */

export interface SearchFood {
  code: string;
  name: string;
  brand: string;
  serving: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl: string | null;
}

/* ── Mapper ── */

export function mapProduct(p: OFFProduct): SearchFood {
  const n = p.nutriments ?? {};
  return {
    code: p.code ?? '',
    name: p.product_name || 'Unknown product',
    brand: p.brands || '',
    serving: p.serving_size || '100 g',
    kcal: Math.round(n['energy-kcal_100g'] ?? 0),
    protein: Math.round(n.proteins_100g ?? 0),
    carbs: Math.round(n.carbohydrates_100g ?? 0),
    fat: Math.round(n.fat_100g ?? 0),
    imageUrl: p.image_small_url || null,
  };
}

/* ── Search by text ── */

export async function searchFoods(
  query: string,
  page = 1,
  pageSize = 24,
): Promise<SearchFood[]> {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page: String(page),
    page_size: String(pageSize),
    fields: 'code,product_name,brands,serving_size,nutriments,image_small_url',
  });

  const res = await fetch(`${BASE}/cgi/search.pl?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) throw new Error(`OFF search failed (${res.status})`);

  const data = await res.json();
  const products: OFFProduct[] = data.products ?? [];

  return products
    .filter((p) => p.product_name)
    .map(mapProduct);
}

/* ── Lookup by barcode ── */

export async function lookupBarcode(barcode: string): Promise<SearchFood | null> {
  const url = `${BASE}/api/v2/product/${encodeURIComponent(barcode)}.json?fields=code,product_name,brands,serving_size,nutriments,image_small_url`;
  console.log('[OFF] barcode lookup:', barcode, url);

  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) {
    console.log('[OFF] barcode lookup failed:', res.status);
    return null;
  }

  const data = await res.json();
  console.log('[OFF] barcode response:', data.status, data.product?.product_name);
  if (data.status !== 1 || !data.product?.product_name) return null;

  return mapProduct(data.product);
}
