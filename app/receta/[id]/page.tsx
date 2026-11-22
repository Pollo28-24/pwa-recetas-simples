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
  getMealsByCategory,
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
    description: `Receta de ${meal.strMeal}: ingredientes y preparación.`,
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
  const related = await getMealsByCategory(meal.strCategory, meal.idMeal, 4);

  return (
    <>
      <Link href="/" className="text-sm text-muted underline">
        Volver a las recetas
      </Link>

      <article className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-panel">
            <Image
              src={meal.strMealThumb}
              alt={meal.strMeal}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 520px"
              className="object-cover"
            />
          </div>
          <div className="mt-3 flex gap-2 text-xs text-muted">
            {meal.strCategory ? <span className="border border-line px-2 py-1">{meal.strCategory}</span> : null}
            {origin ? <span className="border border-line px-2 py-1">{origin}</span> : null}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold">{meal.strMeal}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <FavoriteButton meal={toSummary(meal)} withLabel />
            {meal.strYoutube ? (
              <a href={meal.strYoutube} target="_blank" rel="noreferrer" className="rounded-md border border-line px-4 py-2 text-sm">
                Ver vídeo
              </a>
            ) : null}
          </div>

          {tags.length > 0 ? (
            <p className="mt-3 text-xs text-muted">Etiquetas: {tags.join(", ")}</p>
          ) : null}

          <section className="mt-8">
            <h2 className="border-b border-line pb-2 text-xl font-bold">Ingredientes</h2>
            <IngredientsList ingredients={ingredients} />
          </section>

          <section className="mt-8">
            <h2 className="border-b border-line pb-2 text-xl font-bold">Preparación</h2>
            <ol className="mt-4 space-y-3">
              {steps.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm leading-relaxed">
                  <span className="font-bold text-accent">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="mt-12 border-t border-line pt-6">
          <h2 className="mb-4 text-xl font-bold">Más recetas de {meal.strCategory?.toLowerCase()}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((item) => (
              <MealCard key={item.idMeal} meal={item} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
