"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MealCard } from "@/components/meal-card";
import type { CategoryInfo, MealSummary } from "@/lib/types";

const PAGE_SIZE = 48;
const ALL_VALUE = "Todas";

type RecipeExplorerProps = {
  meals: MealSummary[];
  categories: CategoryInfo[];
  areas: string[];
  ingredientNames: string[];
  partialCatalog?: boolean;
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function RecipeExplorer({
  meals,
  categories,
  areas,
  ingredientNames,
  partialCatalog = false,
}: RecipeExplorerProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("categoria") || ALL_VALUE;
  const initialArea = searchParams.get("cocina") || ALL_VALUE;
  const initialIngredient = searchParams.get("ingrediente") || "";
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [area, setArea] = useState(initialArea);
  const [ingredient, setIngredient] = useState(initialIngredient);
  const [ingredientMeals, setIngredientMeals] = useState<MealSummary[] | null>(null);
  const [ingredientLoading, setIngredientLoading] = useState(false);
  const [ingredientError, setIngredientError] = useState<string | null>(null);
  const [randomMeal, setRandomMeal] = useState<MealSummary | null>(null);
  const [randomLoading, setRandomLoading] = useState(false);
  const [randomError, setRandomError] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setCategory(searchParams.get("categoria") || ALL_VALUE);
    setArea(searchParams.get("cocina") || ALL_VALUE);
    setIngredient(searchParams.get("ingrediente") || "");
    setVisible(PAGE_SIZE);
  }, [searchParams]);

  useEffect(() => {
    if (!ingredient) {
      setIngredientMeals(null);
      setIngredientError(null);
      return;
    }

    const controller = new AbortController();
    setIngredientLoading(true);
    setIngredientError(null);

    fetch(`/api/meals/filter?i=${encodeURIComponent(ingredient)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("fetch_failed");
        const data = (await res.json()) as { meals?: MealSummary[] };
        setIngredientMeals(data.meals ?? []);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setIngredientError("No pudimos filtrar por ese ingrediente ahora.");
        setIngredientMeals([]);
      })
      .finally(() => {
        setIngredientLoading(false);
      });

    return () => controller.abort();
  }, [ingredient]);

  const activeCategoryInfo = useMemo(
    () => categories.find((item) => item.strCategory === category) ?? null,
    [categories, category],
  );

  const sourceMeals = ingredient ? (ingredientMeals ?? []) : meals;

  const filtered = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);

    return sourceMeals.filter((meal) => {
      if (category !== ALL_VALUE && meal.strCategory !== category) return false;
      if (area !== ALL_VALUE && meal.strArea !== area) return false;
      if (terms.length === 0) return true;

      const haystack = normalize(
        `${meal.strMeal} ${meal.strCategory ?? ""} ${meal.strArea ?? ""}`,
      );
      return terms.every((term) => haystack.includes(term));
    });
  }, [sourceMeals, query, category, area]);

  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;
  const hasActiveFilters =
    Boolean(query) ||
    category !== ALL_VALUE ||
    area !== ALL_VALUE ||
    Boolean(ingredient);

  const clearFilters = () => {
    setQuery("");
    setCategory(ALL_VALUE);
    setArea(ALL_VALUE);
    setIngredient("");
    setVisible(PAGE_SIZE);
  };

  const handleRandomMeal = async () => {
    setRandomLoading(true);
    setRandomError(null);
    try {
      const res = await fetch("/api/meals/random");
      if (!res.ok) throw new Error("random_failed");
      const data = (await res.json()) as { meal?: MealSummary };
      if (!data.meal) throw new Error("empty_random");
      setRandomMeal(data.meal);
    } catch {
      setRandomError("No pudimos traer una receta aleatoria. Intentá de nuevo.");
    } finally {
      setRandomLoading(false);
    }
  };

  return (
    <div>
      {partialCatalog ? (
        <p
          role="status"
          className="mb-4 rounded-lg border border-line bg-panel px-4 py-3 text-xs text-muted"
        >
          Algunas letras del catálogo externo respondieron lento; mostramos las recetas
          disponibles y reintentaremos automáticamente en la próxima actualización.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <label htmlFor="recipe-search" className="sr-only">
            Buscar recetas
          </label>
          <input
            id="recipe-search"
            type="text"
            inputMode="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder="Buscar receta, categoría o cocina"
            autoComplete="off"
            className="w-full rounded-md border border-line bg-panel px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-accent"
          />
        </div>

        <button
          type="button"
          onClick={handleRandomMeal}
          disabled={randomLoading}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-night disabled:opacity-60"
        >
          {randomLoading ? "Buscando…" : "¿Qué cocino hoy?"}
        </button>
      </div>

      {randomError ? (
        <p role="alert" className="mt-3 text-xs text-accent">
          {randomError}
        </p>
      ) : null}

      {randomMeal ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-panel p-4">
          <div className="flex items-center gap-3">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-line">
              <Image
                src={`${randomMeal.strMealThumb}/small`}
                alt={randomMeal.strMeal}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs text-muted">
                {[randomMeal.strCategory, randomMeal.strArea].filter(Boolean).join(" · ")}
              </p>
              <p className="text-sm font-semibold">{randomMeal.strMeal}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/receta/${randomMeal.idMeal}`}
              className="rounded-md bg-accent px-3 py-2 text-xs font-semibold text-night"
            >
              Ver receta
            </Link>
            <button
              type="button"
              onClick={() => setRandomMeal(null)}
              className="rounded-md border border-line px-3 py-2 text-xs text-muted"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="area-filter" className="mb-1 block text-xs font-medium text-muted">
            Cocina / País ({areas.length})
          </label>
          <select
            id="area-filter"
            value={area}
            onChange={(event) => {
              setArea(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            className="w-full rounded-md border border-line bg-panel px-3 py-2.5 text-sm outline-none focus:border-accent"
          >
            <option value={ALL_VALUE}>Todas las cocinas</option>
            {areas.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ingredient-filter" className="mb-1 block text-xs font-medium text-muted">
            Ingrediente principal ({ingredientNames.length})
          </label>
          <select
            id="ingredient-filter"
            value={ingredient}
            onChange={(event) => {
              setIngredient(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            className="w-full rounded-md border border-line bg-panel px-3 py-2.5 text-sm outline-none focus:border-accent"
          >
            <option value="">Cualquier ingrediente</option>
            {ingredientNames.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setCategory(ALL_VALUE);
            setVisible(PAGE_SIZE);
          }}
          aria-pressed={category === ALL_VALUE}
          className={[
            "rounded-md border px-3 py-1.5 text-xs",
            category === ALL_VALUE
              ? "border-accent bg-accent font-semibold text-night"
              : "border-line text-muted hover:text-text",
          ].join(" ")}
        >
          Todas
        </button>
        {categories.map((item) => (
          <button
            key={item.idCategory}
            type="button"
            onClick={() => {
              setCategory(item.strCategory);
              setVisible(PAGE_SIZE);
            }}
            aria-pressed={item.strCategory === category}
            className={[
              "rounded-md border px-3 py-1.5 text-xs",
              item.strCategory === category
                ? "border-accent bg-accent font-semibold text-night"
                : "border-line text-muted hover:text-text",
            ].join(" ")}
          >
            {item.strCategory}
          </button>
        ))}
      </div>

      {activeCategoryInfo?.strCategoryDescription ? (
        <p className="mt-3 text-xs leading-relaxed text-muted">
          {activeCategoryInfo.strCategoryDescription}
        </p>
      ) : null}

      <div className="mt-6 flex items-baseline justify-between border-b border-line pb-2">
        <p className="text-sm text-muted" aria-live="polite">
          {ingredientLoading ? (
            "Filtrando por ingrediente…"
          ) : hasActiveFilters ? (
            <>
              <span className="font-semibold text-text tabular-nums">{filtered.length}</span>{" "}
              resultados
              {query ? ` para “${query}”` : ""}
              {ingredient ? ` con ${ingredient}` : ""}
            </>
          ) : (
            <>
              <span className="font-semibold text-text tabular-nums">{meals.length}</span>{" "}
              recetas
            </>
          )}
        </p>
        {hasActiveFilters ? (
          <button type="button" onClick={clearFilters} className="text-xs text-accent underline">
            Limpiar filtros
          </button>
        ) : null}
      </div>

      {ingredientError ? (
        <p role="alert" className="mt-4 text-sm text-accent">
          {ingredientError}
        </p>
      ) : null}

      {shown.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((meal) => (
            <MealCard key={meal.idMeal} meal={meal} />
          ))}
        </div>
      ) : !ingredientLoading ? (
        <div className="mt-6 rounded-md border border-dashed border-line p-10 text-center">
          <p className="font-semibold">No hay resultados con esos filtros</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-night"
          >
            Ver todas las recetas
          </button>
        </div>
      ) : null}

      {remaining > 0 ? (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setVisible((current) => current + PAGE_SIZE)}
            className="rounded-md border border-line px-4 py-2 text-sm"
          >
            Ver más recetas
          </button>
          <p className="mt-2 text-xs text-muted tabular-nums">
            Mostrando {shown.length} de {filtered.length}
          </p>
        </div>
      ) : null}
    </div>
  );
}
