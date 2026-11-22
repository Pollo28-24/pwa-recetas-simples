import { Suspense } from "react";
import { RecipeExplorer } from "@/components/recipe-explorer";
import {
  getAreas,
  getCatalog,
  getCategories,
  getIngredientNames,
} from "@/lib/mealdb";

export const revalidate = 86400;

export default async function HomePage() {
  const [catalog, categories, ingredientNames] = await Promise.all([
    getCatalog(),
    getCategories(),
    getIngredientNames(),
  ]);

  const areas = await getAreas(catalog.meals);

  return (
    <>
      <h1 className="mb-3 text-2xl font-bold">Recetas</h1>
      <Suspense fallback={<p className="text-sm text-muted">Cargando explorador…</p>}>
        <RecipeExplorer
          meals={catalog.meals}
          categories={categories}
          areas={areas}
          ingredientNames={ingredientNames}
          partialCatalog={catalog.partial}
        />
      </Suspense>
    </>
  );
}
