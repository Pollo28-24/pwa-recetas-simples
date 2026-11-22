import { NextRequest, NextResponse } from "next/server";
import {
  getAllMeals,
  getMealsByArea,
  getMealsByCategory,
  getMealsByIngredient,
  searchMealsByName,
} from "@/lib/mealdb";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const ingredient = searchParams.get("i")?.trim() ?? "";
  const area = searchParams.get("a")?.trim() ?? "";
  const category = searchParams.get("c")?.trim() ?? "";
  const search = searchParams.get("s")?.trim() ?? "";

  if (ingredient) {
    const catalog = await getAllMeals();
    const byId = new Map(catalog.map((meal) => [meal.idMeal, meal]));
    const meals = await getMealsByIngredient(ingredient, byId);
    return NextResponse.json({ meals });
  }

  if (area) {
    const meals = await getMealsByArea(area, "", 100);
    return NextResponse.json({ meals });
  }

  if (category) {
    const meals = await getMealsByCategory(category, "", 100);
    return NextResponse.json({ meals });
  }

  if (search) {
    const meals = await searchMealsByName(search);
    return NextResponse.json({ meals });
  }

  return NextResponse.json(
    { error: "Indicá un parámetro válido: i, a, c o s." },
    { status: 400 },
  );
}
