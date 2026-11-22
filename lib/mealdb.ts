import type {
  CatalogResult,
  CategoryInfo,
  Ingredient,
  IngredientInfo,
  Meal,
  MealSummary,
} from "@/lib/types";

export const MEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
const BATCH_SIZE = 6;
/** The free API is static data, so a day of caching is plenty. */
export const REVALIDATE_SECONDS = 60 * 60 * 24;

let lastCompleteCatalog: MealSummary[] | null = null;

type FetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number | null };

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchMealDbJson<T>(
  path: string,
  options: { revalidate?: number | false; retries?: number } = {},
): Promise<FetchResult<T>> {
  const { revalidate = REVALIDATE_SECONDS, retries = 1 } = options;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const init: RequestInit & { next?: { revalidate?: number } } =
        revalidate === false
          ? { cache: "no-store", signal: AbortSignal.timeout(8000) }
          : { next: { revalidate }, signal: AbortSignal.timeout(8000) };

      const response = await fetch(`${MEALDB_BASE_URL}${path}`, init);

      if (!response.ok) {
        if (attempt < retries && (response.status === 429 || response.status >= 500)) {
          await sleep(180 * (attempt + 1));
          continue;
        }
        return { ok: false, status: response.status };
      }

      const data = (await response.json()) as T;
      return { ok: true, data };
    } catch {
      if (attempt < retries) {
        await sleep(180 * (attempt + 1));
        continue;
      }
      return { ok: false, status: null };
    }
  }

  return { ok: false, status: null };
}

export function toSummary(meal: Meal | MealSummary): MealSummary {
  return {
    idMeal: String(meal.idMeal),
    strMeal: meal.strMeal,
    strMealThumb: meal.strMealThumb,
    strCategory: meal.strCategory ?? null,
    strArea: meal.strArea ?? null,
  };
}

export function getMealImageUrl(
  thumb: string,
  size: "small" | "medium" | "large" | "full" = "medium",
): string {
  if (!thumb) return "";
  if (size === "full") return thumb;
  if (/\/(small|medium|large|preview)$/i.test(thumb)) return thumb;
  return `${thumb}/${size}`;
}

export function getIngredientImageUrl(
  ingredientName: string,
  size: "small" | "medium" | "large" = "small",
): string {
  const normalized = ingredientName.trim().toLowerCase().replace(/\s+/g, "_");
  return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(normalized)}-${size}.png`;
}

export function getSafeHttpUrl(rawUrl: string | null | undefined): string | null {
  const trimmed = (rawUrl ?? "").trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * TheMealDB has no "list every meal" endpoint, so we query by first letter
 * (a-z) in controlled batches and merge results without caching partial failures
 * over a previously healthy catalog.
 */
export async function getCatalog(): Promise<CatalogResult> {
  const pages: Array<{ letter: string; ok: boolean; meals: Meal[] }> = [];

  for (let i = 0; i < ALPHABET.length; i += BATCH_SIZE) {
    const slice = ALPHABET.slice(i, i + BATCH_SIZE);
    const batch = await Promise.all(
      slice.map(async (letter) => {
        const res = await fetchMealDbJson<{ meals?: Meal[] | string | null }>(
          `/search.php?f=${letter}`,
        );
        if (!res.ok) {
          return { letter, ok: false, meals: [] as Meal[] };
        }
        const rawMeals = Array.isArray(res.data?.meals) ? res.data.meals : [];
        return { letter, ok: true, meals: rawMeals };
      }),
    );
    pages.push(...batch);
  }

  const failedLetters = pages.filter((p) => !p.ok).map((p) => p.letter);
  const byId = new Map<string, MealSummary>();

  for (const page of pages) {
    for (const meal of page.meals) {
      if (!meal?.idMeal || !meal.strMeal || !meal.strMealThumb) continue;
      byId.set(String(meal.idMeal), toSummary(meal));
    }
  }

  const meals = [...byId.values()].sort((a, b) =>
    a.strMeal.localeCompare(b.strMeal, "es"),
  );

  if (failedLetters.length === 0 && meals.length > 0) {
    lastCompleteCatalog = meals;
    return { meals, partial: false, failedLetters: [] };
  }

  if (lastCompleteCatalog && lastCompleteCatalog.length > meals.length) {
    return {
      meals: lastCompleteCatalog,
      partial: false,
      failedLetters: [],
    };
  }

  return {
    meals,
    partial: failedLetters.length > 0,
    failedLetters,
  };
}

export async function getAllMeals(): Promise<MealSummary[]> {
  const { meals } = await getCatalog();
  return meals;
}

export async function getCategories(): Promise<CategoryInfo[]> {
  const res = await fetchMealDbJson<{ categories?: CategoryInfo[] | null }>("/categories.php");
  if (!res.ok || !Array.isArray(res.data?.categories)) return [];

  return res.data.categories
    .filter((cat) => Boolean(cat.strCategory && cat.strCategoryThumb))
    .map((cat) => ({
      idCategory: String(cat.idCategory),
      strCategory: cat.strCategory.trim(),
      strCategoryThumb: cat.strCategoryThumb,
      strCategoryDescription: (cat.strCategoryDescription ?? "").trim(),
    }))
    .sort((a, b) => a.strCategory.localeCompare(b.strCategory, "es"));
}

/**
 * Queries list.php?a=list and intersects against the populated catalog areas
 * so empty country entries are not presented as broken filter options.
 */
export async function getAreas(activeCatalog?: MealSummary[]): Promise<string[]> {
  const res = await fetchMealDbJson<{ meals?: Array<{ strArea?: string | null }> | null }>(
    "/list.php?a=list",
  );

  const apiAreas =
    res.ok && Array.isArray(res.data?.meals)
      ? res.data.meals
          .map((item) => (item.strArea ?? "").trim())
          .filter(Boolean)
      : [];

  if (!activeCatalog || activeCatalog.length === 0) {
    return [...new Set(apiAreas)].sort((a, b) => a.localeCompare(b, "es"));
  }

  const populated = new Set(
    activeCatalog
      .map((meal) => (meal.strArea ?? "").trim())
      .filter(Boolean),
  );

  const valid = apiAreas.filter((area) => populated.has(area));
  const merged = valid.length > 0 ? valid : [...populated];
  return [...new Set(merged)].sort((a, b) => a.localeCompare(b, "es"));
}

export async function getIngredientNames(): Promise<string[]> {
  const res = await fetchMealDbJson<{ meals?: IngredientInfo[] | null }>("/list.php?i=list");
  if (!res.ok || !Array.isArray(res.data?.meals)) return [];

  const names = new Set<string>();
  for (const item of res.data.meals) {
    const name = (item.strIngredient ?? "").trim();
    if (name) names.add(name);
  }

  return [...names].sort((a, b) => a.localeCompare(b, "es"));
}

export async function getMealById(id: string): Promise<Meal | null> {
  if (!/^\d+$/.test(id)) return null;
  const res = await fetchMealDbJson<{ meals?: Meal[] | null }>(`/lookup.php?i=${id}`);
  if (!res.ok || !Array.isArray(res.data?.meals)) return null;
  return res.data.meals[0] ?? null;
}

export async function getRandomMeal(): Promise<Meal | null> {
  const res = await fetchMealDbJson<{ meals?: Meal[] | null }>("/random.php", {
    revalidate: false,
  });
  if (!res.ok || !Array.isArray(res.data?.meals)) return null;
  return res.data.meals[0] ?? null;
}

export async function searchMealsByName(query: string): Promise<MealSummary[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const res = await fetchMealDbJson<{ meals?: Meal[] | string | null }>(
    `/search.php?s=${encodeURIComponent(trimmed)}`,
  );
  if (!res.ok || !Array.isArray(res.data?.meals)) return [];

  return res.data.meals
    .filter((meal) => meal.idMeal && meal.strMeal && meal.strMealThumb)
    .map(toSummary);
}

export async function getMealsByCategory(
  category: string | null,
  excludeId = "",
  limit = 4,
): Promise<MealSummary[]> {
  if (!category) return [];

  const res = await fetchMealDbJson<{ meals?: Meal[] | null }>(
    `/filter.php?c=${encodeURIComponent(category)}`,
  );
  if (!res.ok || !Array.isArray(res.data?.meals)) return [];

  return res.data.meals
    .filter((meal) => String(meal.idMeal) !== excludeId && meal.strMeal && meal.strMealThumb)
    .slice(0, limit)
    .map((meal) => ({
      idMeal: String(meal.idMeal),
      strMeal: meal.strMeal,
      strMealThumb: meal.strMealThumb,
      strCategory: category,
      strArea: null,
    }));
}

export async function getMealsByArea(
  area: string | null,
  excludeId = "",
  limit = 4,
): Promise<MealSummary[]> {
  if (!area) return [];

  const res = await fetchMealDbJson<{ meals?: Meal[] | null }>(
    `/filter.php?a=${encodeURIComponent(area)}`,
  );
  if (!res.ok || !Array.isArray(res.data?.meals)) return [];

  return res.data.meals
    .filter((meal) => String(meal.idMeal) !== excludeId && meal.strMeal && meal.strMealThumb)
    .slice(0, limit)
    .map((meal) => ({
      idMeal: String(meal.idMeal),
      strMeal: meal.strMeal,
      strMealThumb: meal.strMealThumb,
      strCategory: null,
      strArea: area,
    }));
}

export async function getMealsByIngredient(
  ingredient: string,
  catalogById?: Map<string, MealSummary>,
): Promise<MealSummary[]> {
  const normalized = ingredient.trim().replace(/\s+/g, "_");
  if (!normalized) return [];

  const res = await fetchMealDbJson<{ meals?: Meal[] | null }>(
    `/filter.php?i=${encodeURIComponent(normalized)}`,
  );
  if (!res.ok || !Array.isArray(res.data?.meals)) return [];

  return res.data.meals
    .filter((meal) => meal.idMeal && meal.strMeal && meal.strMealThumb)
    .map((meal) => {
      const id = String(meal.idMeal);
      const cached = catalogById?.get(id);
      return {
        idMeal: id,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
        strCategory: cached?.strCategory ?? null,
        strArea: cached?.strArea ?? null,
      };
    });
}

export function getIngredients(meal: Meal): Ingredient[] {
  const ingredients: Ingredient[] = [];

  for (let index = 1; index <= 20; index += 1) {
    const name = meal[`strIngredient${index}`];
    const measure = meal[`strMeasure${index}`];

    if (typeof name !== "string" || !name.trim()) continue;

    ingredients.push({
      name: name.trim(),
      measure: typeof measure === "string" ? measure.trim() : "",
    });
  }

  return ingredients;
}

/** Splits the instruction blob into readable, numbered steps. */
export function getSteps(instructions: string | null | undefined): string[] {
  const clean = (instructions ?? "").replace(/\r\n/g, "\n").trim();
  if (!clean) return [];

  const byLine = clean
    .split(/\n+/)
    .map((line) => line.replace(/^(step\s*\d+[:.)-]?\s*|\d+[.)]\s+)/i, "").trim())
    .filter((line) => line.length > 0 && !/^(step\s*)?\d+\.?$/i.test(line));

  if (byLine.length > 1) return byLine;

  const bySentence = clean
    .split(/(?<=[.!?])\s+(?=[¿¡"A-ZÁÉÍÓÚÑ])/)
    .map((step) => step.trim())
    .filter(Boolean);

  return bySentence.length > 1 ? bySentence : [clean];
}

export function getTags(tags: string | null | undefined): string[] {
  return (tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}
