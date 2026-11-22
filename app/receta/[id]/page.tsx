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

      <article className="grid items-start gap-8 lg:grid-cols-12">
        <div className="motion-hero space-y-4 lg:sticky lg:top-24 lg:col-span-5">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-panel shadow-sm">
            <Image
              src={getMealImageUrl(meal.strMealThumb, "large")}
              alt={meal.strMeal}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 480px"
              className="object-cover"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-[13px]">
            {meal.strCategory ? (
              <Link
                href={`/?categoria=${encodeURIComponent(meal.strCategory)}`}
                className="inline-flex min-h-9 items-center rounded-xl border border-text/15 bg-sun px-3 py-1 font-semibold text-text transition-colors duration-150 hover:bg-sun-hover"
              >
                {meal.strCategory}
              </Link>
            ) : null}
            {origin ? (
              <Link
                href={`/?cocina=${encodeURIComponent(origin)}`}
                className="inline-flex min-h-9 items-center rounded-xl border border-line-strong bg-surface px-3 py-1 font-semibold text-text transition-colors duration-150 hover:bg-panel"
              >
                Cocina {origin}
              </Link>
            ) : null}
          </div>

          {tags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
              <span>Etiquetas:</span>
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/?q=${encodeURIComponent(tag)}`}
                  className="rounded-lg border border-line bg-surface px-2.5 py-1 font-medium text-text hover:bg-panel"
                >
                  {tag}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className="motion-panel space-y-8 lg:col-span-7">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
              {meal.strMeal}
            </h1>
            {meal.strMealAlternate ? (
              <p className="mt-1.5 text-sm text-muted">
                También conocida como: <strong className="text-text">{meal.strMealAlternate}</strong>
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
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

              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center rounded-xl border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-text transition-colors duration-150 hover:bg-panel"
                >
                  Fuente original
                </a>
              ) : null}

              <a
                href={themealdbUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-xl border border-line bg-panel px-4 py-2.5 text-[13px] font-semibold text-muted transition-colors duration-150 hover:text-text"
              >
                Ficha en TheMealDB
              </a>
            </div>

            {meal.dateModified ? (
              <p className="mt-3 text-[13px] text-muted">
                Actualizada en TheMealDB: {meal.dateModified}
              </p>
            ) : null}
          </div>

          <section aria-labelledby="heading-ingredientes">
            <h2
              id="heading-ingredientes"
              className="mb-3 font-display text-xl font-bold text-text"
            >
              Ingredientes ({ingredients.length})
            </h2>
            <IngredientsList mealId={meal.idMeal} ingredients={ingredients} />
          </section>

          <section aria-labelledby="heading-preparacion">
            <h2
              id="heading-preparacion"
              className="mb-3 font-display text-xl font-bold text-text"
            >
              Preparación paso a paso
            </h2>
            <RecipeSteps mealId={meal.idMeal} steps={steps} />
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
