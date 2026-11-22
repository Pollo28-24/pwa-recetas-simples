import { RecipeExplorer } from "@/components/recipe-explorer";
import { getAllMeals } from "@/lib/mealdb";

export const revalidate = 86400;

export default async function HomePage() {
  const meals = await getAllMeals();

  return (
    <>
      <h1 className="mb-3 text-2xl font-bold">Recetas</h1>
      <RecipeExplorer meals={meals} />
    </>
  );
}
