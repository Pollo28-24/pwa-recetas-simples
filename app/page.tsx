import { Suspense } from "react";
import { RecipeExplorer } from "@/components/recipe-explorer";
import {
  getAreas,
  getCatalog,
  getCategories,
  getIngredientNames,
} from "@/lib/mealdb";

export const revalidate = 86400;

function ExplorerFallback({ count }: { count: number }) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-line bg-panel p-5 sm:p-7">
        <h1 className="font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">
          Recetario para cocinar sin vueltas
        </h1>
        <p className="mt-1 text-sm text-muted">
          Preparando {count} recetas, categorías e ingredientes…
        </p>
      </section>
    </div>
  );
}

export default async function HomePage() {
  const [catalog, categories, ingredientNames] = await Promise.all([
    getCatalog(),
    getCategories(),
    getIngredientNames(),
  ]);

  const areas = await getAreas(catalog.meals);

  return (
    <Suspense fallback={<ExplorerFallback count={catalog.meals.length} />}>
      <RecipeExplorer
        meals={catalog.meals}
        categories={categories}
        areas={areas}
        ingredientNames={ingredientNames}
        partialCatalog={catalog.partial}
      />
    </Suspense>
  );
}
