"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MealCard } from "@/components/meal-card";
import { getMealImageUrl } from "@/lib/mealdb";
import type { CategoryInfo, MealSummary } from "@/lib/types";

const PAGE_SIZE = 47;
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
  const [spotlightMeal, setSpotlightMeal] = useState<MealSummary | null>(() => {
    if (meals.length === 0) return null;
    return (
      meals.find(
        (meal) =>
          Boolean(meal.strCategory) &&
          Boolean(meal.strArea) &&
          !/^[AB]/i.test(meal.strMeal),
      ) ?? meals[0]
    );
  });
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

  const useAsymmetricLead = !hasActiveFilters && shown.length >= 3;

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
      setSpotlightMeal(data.meal);
    } catch {
      setRandomError("No pudimos traer una receta aleatoria. Intentá de nuevo.");
    } finally {
      setRandomLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      <section className="grid gap-5 lg:grid-cols-12">
        <div className="motion-hero flex flex-col justify-between rounded-3xl border border-line bg-panel p-5 sm:p-7 lg:col-span-8">
          <div>
            <div className="flex items-center gap-4">
              <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line-strong bg-sun p-1 shadow-xs transition-transform duration-200 hover:-rotate-3 sm:size-20">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="Ilustración del chef de Recetario"
                  width={80}
                  height={80}
                  priority
                  className="size-full rounded-full bg-surface object-contain"
                />
              </div>

              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">
                  Recetario para cocinar sin vueltas
                </h1>
                <p className="mt-1 text-sm text-muted">
                  <span className="font-semibold text-text tabular-nums">{meals.length}</span>{" "}
                  recetas en{" "}
                  <span className="font-semibold text-text tabular-nums">{categories.length}</span>{" "}
                  categorías y{" "}
                  <span className="font-semibold text-text tabular-nums">{areas.length}</span>{" "}
                  cocinas del mundo.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-12">
              <div className="relative sm:col-span-12">
                <label htmlFor="recipe-search" className="sr-only">
                  Buscar receta, categoría o cocina
                </label>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.9}
                  className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  id="recipe-search"
                  type="text"
                  inputMode="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setVisible(PAGE_SIZE);
                  }}
                  placeholder="Buscar por plato, categoría o cocina…"
                  autoComplete="off"
                  className="min-h-12 w-full rounded-2xl border border-line-strong bg-surface py-2.5 pl-12 pr-10 text-base text-text outline-none transition-colors duration-150 placeholder:text-muted focus:border-accent"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setVisible(PAGE_SIZE);
                    }}
                    aria-label="Borrar búsqueda"
                    className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl text-muted hover:bg-panel hover:text-text"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="size-4"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                ) : null}
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="area-filter" className="sr-only">
                  Filtrar por cocina o país
                </label>
                <select
                  id="area-filter"
                  value={area}
                  onChange={(event) => {
                    setArea(event.target.value);
                    setVisible(PAGE_SIZE);
                  }}
                  className="min-h-12 w-full rounded-2xl border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-text outline-none transition-colors duration-150 focus:border-accent"
                >
                  <option value={ALL_VALUE}>Cocina: Todas ({areas.length})</option>
                  {areas.map((item) => (
                    <option key={item} value={item}>
                      Cocina: {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="ingredient-filter" className="sr-only">
                  Filtrar por ingrediente principal
                </label>
                <select
                  id="ingredient-filter"
                  value={ingredient}
                  onChange={(event) => {
                    setIngredient(event.target.value);
                    setVisible(PAGE_SIZE);
                  }}
                  className="min-h-12 w-full rounded-2xl border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-text outline-none transition-colors duration-150 focus:border-accent"
                >
                  <option value="">Ingrediente: Cualquiera</option>
                  {ingredientNames.map((item) => (
                    <option key={item} value={item}>
                      Con {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {spotlightMeal ? (
          <aside
            aria-label="Sugerencia del chef"
            className="motion-panel flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface p-4 lg:col-span-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center rounded-full bg-sun px-3 py-1 text-[13px] font-bold text-text">
                Sugerencia del chef
              </span>
              <button
                type="button"
                onClick={handleRandomMeal}
                disabled={randomLoading}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line-strong bg-panel px-3 py-1.5 text-[13px] font-semibold text-text transition-all duration-150 hover:bg-sun active:scale-[0.97] disabled:opacity-60"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={[
                    "size-4 transition-transform duration-300",
                    randomLoading ? "rotate-180" : "",
                  ].join(" ")}
                >
                  <path d="M16 3h5v5" />
                  <path d="M4 20 21 3" />
                  <path d="M21 16v5h-5" />
                  <path d="m15 15 6 6" />
                  <path d="m4 4 5 5" />
                </svg>
                <span>{randomLoading ? "Eligiendo…" : "Otra idea"}</span>
              </button>
            </div>

            <Link
              href={`/receta/${spotlightMeal.idMeal}`}
              className="group mt-3 flex flex-1 flex-col justify-between gap-3"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-panel">
                <Image
                  src={getMealImageUrl(spotlightMeal.strMealThumb, "medium")}
                  alt={spotlightMeal.strMeal}
                  fill
                  sizes="(max-width: 1024px) 100vw, 360px"
                  priority
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                />
              </div>

              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-muted">
                    {[spotlightMeal.strCategory, spotlightMeal.strArea]
                      .filter(Boolean)
                      .join(" · ") || "Plato recomendado"}
                  </p>
                  <h2 className="mt-0.5 line-clamp-1 font-display text-lg font-bold text-text transition-colors duration-150 group-hover:text-accent">
                    {spotlightMeal.strMeal}
                  </h2>
                </div>

                <span className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-xl bg-accent px-3.5 py-2 text-[13px] font-semibold text-white transition-colors duration-150 group-hover:bg-accent-hover">
                  <span>Cocinar</span>
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </span>
              </div>
            </Link>
          </aside>
        ) : null}
      </section>

      {partialCatalog ? (
        <p
          role="status"
          className="rounded-2xl border border-line bg-panel px-4 py-3 text-[13px] font-medium text-text"
        >
          Algunas letras del catálogo externo respondieron lento; mostramos las recetas
          disponibles hasta la próxima actualización automática.
        </p>
      ) : null}

      {randomError ? (
        <p
          role="alert"
          className="rounded-2xl border border-accent bg-accent-soft px-4 py-3 text-sm font-medium text-accent-ink"
        >
          {randomError}
        </p>
      ) : null}

      <section aria-label="Categorías culinarias">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0">
          <button
            type="button"
            onClick={() => {
              setCategory(ALL_VALUE);
              setVisible(PAGE_SIZE);
            }}
            aria-pressed={category === ALL_VALUE}
            className={[
              "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-150 active:scale-[0.97]",
              category === ALL_VALUE
                ? "border-text bg-sun text-text shadow-xs"
                : "border-line bg-surface text-muted hover:border-line-strong hover:text-text",
            ].join(" ")}
          >
            <span>Todas</span>
          </button>

          {categories.map((item) => {
            const active = item.strCategory === category;

            return (
              <button
                key={item.idCategory}
                type="button"
                onClick={() => {
                  setCategory(item.strCategory);
                  setVisible(PAGE_SIZE);
                }}
                aria-pressed={active}
                className={[
                  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-150 active:scale-[0.97]",
                  active
                    ? "border-text bg-sun text-text shadow-xs"
                    : "border-line bg-surface text-muted hover:border-line-strong hover:text-text",
                ].join(" ")}
              >
                <Image
                  src={item.strCategoryThumb}
                  alt=""
                  width={26}
                  height={26}
                  className="size-6 rounded-full object-contain"
                />
                <span>{item.strCategory}</span>
              </button>
            );
          })}
        </div>

        {activeCategoryInfo?.strCategoryDescription ? (
          <div className="motion-panel mt-3 flex items-start gap-3.5 rounded-2xl border border-line bg-surface p-4 text-[13px] leading-relaxed text-muted">
            <Image
              src={activeCategoryInfo.strCategoryThumb}
              alt=""
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-xl bg-panel object-contain p-1"
            />
            <p className="max-w-[75ch]">
              <strong className="text-text">{activeCategoryInfo.strCategory}:</strong>{" "}
              {activeCategoryInfo.strCategoryDescription}
            </p>
          </div>
        ) : null}
      </section>

      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-2.5">
        <p className="text-sm text-muted" aria-live="polite">
          {ingredientLoading ? (
            "Consultando recetas con ese ingrediente…"
          ) : hasActiveFilters ? (
            <>
              <span className="font-bold text-text tabular-nums">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "receta encontrada" : "recetas encontradas"}
              {query ? ` para “${query}”` : ""}
              {ingredient ? ` con ${ingredient}` : ""}
            </>
          ) : (
            <>
              <span className="font-bold text-text tabular-nums">{meals.length}</span>{" "}
              recetas disponibles
            </>
          )}
        </p>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-[13px] font-semibold text-accent underline hover:text-accent-hover"
          >
            Limpiar filtros
          </button>
        ) : null}
      </div>

      {ingredientError ? (
        <p
          role="alert"
          className="rounded-2xl border border-accent bg-accent-soft px-4 py-3 text-sm font-medium text-accent-ink"
        >
          {ingredientError}
        </p>
      ) : null}

      {shown.length > 0 ? (
        <div
          key={`${category}-${area}-${ingredient}-${query}`}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {shown.map((meal, index) => (
            <MealCard
              key={meal.idMeal}
              meal={meal}
              index={index}
              priority={index < 4}
              featured={useAsymmetricLead && index === 0}
            />
          ))}
        </div>
      ) : !ingredientLoading ? (
        <div className="motion-panel rounded-3xl border border-dashed border-line-strong bg-panel p-10 text-center">
          <h2 className="font-display text-lg font-bold text-text">
            No encontramos recetas con esa combinación
          </h2>
          <p className="mt-1.5 text-sm text-muted">
            Probá limpiar algún filtro o buscá un término más amplio.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-hover active:scale-[0.985]"
          >
            Ver todas las recetas
          </button>
        </div>
      ) : null}

      {remaining > 0 ? (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setVisible((current) => current + PAGE_SIZE)}
            className="inline-flex min-h-11 items-center rounded-xl border border-line-strong bg-surface px-5 py-2.5 text-sm font-semibold text-text transition-colors duration-150 hover:bg-panel active:scale-[0.985]"
          >
            Ver más recetas
          </button>
          <p className="mt-2 text-[13px] text-muted tabular-nums">
            Mostrando {shown.length} de {filtered.length}
          </p>
        </div>
      ) : null}
    </div>
  );
}
