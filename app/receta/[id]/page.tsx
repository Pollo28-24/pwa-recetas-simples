import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/favorite-button";
import { IngredientsList } from "@/components/ingredients-list";
import { MealCard } from "@/components/meal-card";
import { RecipeSteps } from "@/components/recipe-steps";
import {
  getIngredients,
  getMealById,
  getMealImageUrl,
  getMealsByArea,
  getMealsByCategory,
  getSafeHttpUrl,
  getSteps,
  getTags,
  toSummary,
} from "@/lib/mealdb";

type PageProps = { params: Promise<{ id: string }> };

export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const meal = await getMealById(id);

  if (!meal) return { title: "Receta no encontrada" };

  return {
    title: meal.strMeal,
    description: `Receta de ${meal.strMeal}: ingredientes, medidas y preparación paso a paso.`,
  };
}

export default async function RecipePage({ params }: PageProps) {
  const { id } = await params;
  const meal = await getMealById(id);

  if (!meal) notFound();

  const ingredients = getIngredients(meal);
  const steps = getSteps(meal.strInstructions);
  const tags = getTags(meal.strTags);
  const origin = meal.strArea || meal.strCountry;
  const youtubeUrl = getSafeHttpUrl(meal.strYoutube);
  const sourceUrl = getSafeHttpUrl(meal.strSource);
  const themealdbUrl = `https://www.themealdb.com/meal/${meal.idMeal}`;

  const [relatedByCategory, rawByArea] = await Promise.all([
    getMealsByCategory(meal.strCategory, meal.idMeal, 4),
    getMealsByArea(origin, meal.idMeal, 8),
  ]);

  const categoryIds = new Set(relatedByCategory.map((item) => item.idMeal));
  const relatedByArea = rawByArea
    .filter((item) => !categoryIds.has(item.idMeal))
    .slice(0, 4);

  return (
    <div className="space-y-10">
      <Link
        href="/"
        className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-muted underline hover:text-text"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        <span>Volver a las recetas</span>
      </Link>

      <article className="space-y-8">
        <header className="motion-hero overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="grid items-stretch lg:grid-cols-12">
            <div className="relative aspect-[4/3] overflow-hidden bg-panel lg:col-span-6 lg:aspect-auto lg:min-h-80">
              <Image
                src={getMealImageUrl(meal.strMealThumb, "large")}
                alt={meal.strMeal}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
            </div>

            <div className="flex flex-col justify-between gap-6 p-6 sm:p-8 lg:col-span-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-[13px]">
                  {meal.strCategory ? (
                    <Link
                      href={`/?categoria=${encodeURIComponent(meal.strCategory)}`}
                      className="inline-flex min-h-9 items-center rounded-full border border-text/15 bg-sun px-3.5 py-1 font-semibold text-text transition-colors duration-150 hover:bg-sun-hover"
                    >
                      {meal.strCategory}
                    </Link>
                  ) : null}
                  {origin ? (
                    <Link
                      href={`/?cocina=${encodeURIComponent(origin)}`}
                      className="inline-flex min-h-9 items-center rounded-full border border-line-strong bg-panel px-3.5 py-1 font-semibold text-text transition-colors duration-150 hover:bg-sun"
                    >
                      Cocina {origin}
                    </Link>
                  ) : null}
                </div>

                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
                    {meal.strMeal}
                  </h1>
                  {meal.strMealAlternate ? (
                    <p className="mt-1.5 text-sm text-muted">
                      También conocida como:{" "}
                      <strong className="text-text">{meal.strMealAlternate}</strong>
                    </p>
                  ) : null}
                </div>

                <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-panel p-4">
                  <div>
                    <dt className="text-[13px] font-medium text-muted">Ingredientes</dt>
                    <dd className="mt-0.5 font-display text-xl font-bold text-text tabular-nums">
                      {ingredients.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[13px] font-medium text-muted">Pasos</dt>
                    <dd className="mt-0.5 font-display text-xl font-bold text-text tabular-nums">
                      {steps.length}
                    </dd>
                  </div>
                </dl>

                {tags.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
                    <span>Etiquetas:</span>
                    {tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/?q=${encodeURIComponent(tag)}`}
                        className="rounded-lg border border-line bg-panel px-2.5 py-1 font-medium text-text transition-colors duration-150 hover:bg-sun"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="space-y-3 border-t border-line pt-5">
                <div className="flex flex-wrap items-center gap-3">
                  <FavoriteButton meal={toSummary(meal)} withLabel />

                  {youtubeUrl ? (
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-text transition-colors duration-150 hover:bg-panel"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.9}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-4"
                      >
                        <polygon points="6 3 20 12 6 21 6 3" />
                      </svg>
                      <span>Ver vídeo</span>
                    </a>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
                  {sourceUrl ? (
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-text underline hover:text-accent"
                    >
                      Fuente original
                    </a>
                  ) : null}
                  <a
                    href={themealdbUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-text underline hover:text-accent"
                  >
                    Ver ficha en TheMealDB
                  </a>
                  {meal.dateModified ? (
                    <span>Actualizada: {meal.dateModified}</span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-12">
          <section
            aria-labelledby="heading-ingredientes"
            className="motion-panel rounded-3xl border border-line bg-panel p-5 sm:p-6 lg:sticky lg:top-24 lg:col-span-5"
          >
            <div className="mb-4 flex items-baseline justify-between gap-2 border-b border-line pb-3">
              <h2
                id="heading-ingredientes"
                className="font-display text-xl font-bold text-text"
              >
                Ingredientes
              </h2>
              <span className="rounded-full bg-sun px-3 py-0.5 text-[13px] font-bold text-text tabular-nums">
                {ingredients.length}
              </span>
            </div>
            <IngredientsList ingredients={ingredients} />
          </section>

          <section
            aria-labelledby="heading-preparacion"
            className="motion-panel rounded-3xl border border-line bg-surface p-5 sm:p-8 lg:col-span-7"
          >
            <div className="mb-5 flex items-baseline justify-between gap-2 border-b border-line pb-3">
              <h2
                id="heading-preparacion"
                className="font-display text-xl font-bold text-text"
              >
                Preparación
              </h2>
              <span className="text-[13px] font-semibold text-muted tabular-nums">
                {steps.length} {steps.length === 1 ? "paso" : "pasos"}
              </span>
            </div>
            <RecipeSteps steps={steps} />
          </section>
        </div>
      </article>

      {relatedByCategory.length > 0 ? (
        <section className="border-t border-line pt-8">
          <h2 className="mb-4 font-display text-xl font-bold text-text">
            Más recetas de {meal.strCategory}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedByCategory.map((item, index) => (
              <MealCard key={item.idMeal} meal={item} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      {relatedByArea.length > 0 && origin ? (
        <section className="border-t border-line pt-8">
          <h2 className="mb-4 font-display text-xl font-bold text-text">
            Más de la cocina {origin}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedByArea.map((item, index) => (
              <MealCard key={item.idMeal} meal={item} index={index} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
