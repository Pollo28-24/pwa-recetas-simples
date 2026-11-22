import type { CatalogResult, Ingredient, Meal, MealSummary } from "@/lib/types";

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

export async function getMealById(id: string): Promise<Meal | null> {
  if (!/^\d+$/.test(id)) return null;
  const res = await fetchMealDbJson<{ meals?: Meal[] | null }>(`/lookup.php?i=${id}`);
  if (!res.ok || !Array.isArray(res.data?.meals)) return null;
  return res.data.meals[0] ?? null;
}

export async function getMealsByCategory(
  category: string | null,
  excludeId: string,
  limit = 4,
): Promise<MealSummary[]> {
  if (!category) return [];

  const res = await fetchMealDbJson<{ meals?: Meal[] | null }>(
    `/filter.php?c=${encodeURIComponent(category)}`,
  );
  if (!res.ok || !Array.isArray(res.data?.meals)) return [];

  return res.data.meals
    .filter((meal) => meal.idMeal !== excludeId && meal.strMeal && meal.strMealThumb)
    .slice(0, limit)
    .map((meal) => ({
      idMeal: String(meal.idMeal),
      strMeal: meal.strMeal,
      strMealThumb: meal.strMealThumb,
      strCategory: category,
      strArea: null,
    }));
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
