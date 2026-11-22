import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/favorite-button";
import { IngredientsList } from "@/components/ingredients-list";
import { MealCard } from "@/components/meal-card";
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
    <>
      <Link href="/" className="text-sm font-medium text-muted underline underline-offset-4">
        Volver a las recetas
      </Link>

      <article className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-panel">
            <Image
              src={getMealImageUrl(meal.strMealThumb, "large")}
              alt={meal.strMeal}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 540px"
              className="object-cover"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {meal.strCategory ? (
              <Link
                href={`/?categoria=${encodeURIComponent(meal.strCategory)}`}
                className="rounded-md border border-line px-2.5 py-1 font-medium text-muted hover:text-text"
              >
                {meal.strCategory}
              </Link>
            ) : null}
            {origin ? (
              <Link
                href={`/?cocina=${encodeURIComponent(origin)}`}
                className="rounded-md border border-line px-2.5 py-1 font-medium text-muted hover:text-text"
              >
                Cocina: {origin}
              </Link>
            ) : null}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold">{meal.strMeal}</h1>
          {meal.strMealAlternate ? (
            <p className="mt-1 text-sm text-muted">
              También conocida como: {meal.strMealAlternate}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <FavoriteButton meal={toSummary(meal)} withLabel />
            {youtubeUrl ? (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center rounded-md border border-line px-4 py-2 text-sm font-medium"
              >
                Ver vídeo
              </a>
            ) : null}
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center rounded-md border border-line px-4 py-2 text-sm font-medium"
              >
                Fuente original
              </a>
            ) : null}
            <a
              href={themealdbUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center rounded-md border border-line px-4 py-2 text-sm font-medium"
            >
              Ver en TheMealDB
            </a>
          </div>

          {tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-muted">
              <span>Etiquetas:</span>
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/?q=${encodeURIComponent(tag)}`}
                  className="rounded border border-line px-2 py-0.5 hover:text-text"
                >
                  {tag}
                </Link>
              ))}
            </div>
          ) : null}

          {meal.dateModified ? (
            <p className="mt-2 text-xs text-muted">
              Última actualización: {meal.dateModified}
            </p>
          ) : null}

          <section className="mt-8">
            <h2 className="border-b border-line pb-2 text-xl font-bold">Ingredientes</h2>
            <IngredientsList mealId={meal.idMeal} ingredients={ingredients} />
          </section>

          <section className="mt-8">
            <h2 className="border-b border-line pb-2 text-xl font-bold">Preparación</h2>
            <ol className="mt-4 space-y-3">
              {steps.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm leading-relaxed">
                  <span className="font-bold tabular-nums text-accent">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </article>

      {relatedByCategory.length > 0 ? (
        <section className="mt-12 border-t border-line pt-6">
          <h2 className="mb-4 text-xl font-bold">
            Más recetas de {meal.strCategory}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedByCategory.map((item) => (
              <MealCard key={item.idMeal} meal={item} />
            ))}
          </div>
        </section>
      ) : null}

      {relatedByArea.length > 0 && origin ? (
        <section className="mt-10 border-t border-line pt-6">
          <h2 className="mb-4 text-xl font-bold">Más de la cocina {origin}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedByArea.map((item) => (
              <MealCard key={item.idMeal} meal={item} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
