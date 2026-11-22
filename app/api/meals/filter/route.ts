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

  const cacheHeaders = {
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  };

  try {
    if (ingredient) {
      const catalog = await getAllMeals();
      const byId = new Map(catalog.map((meal) => [meal.idMeal, meal]));
      const meals = await getMealsByIngredient(ingredient, byId);
      return NextResponse.json({ meals }, { headers: cacheHeaders });
    }

    if (area) {
      const meals = await getMealsByArea(area, "", 100);
      return NextResponse.json({ meals }, { headers: cacheHeaders });
    }

    if (category) {
      const meals = await getMealsByCategory(category, "", 100);
      return NextResponse.json({ meals }, { headers: cacheHeaders });
    }

    if (search) {
      const meals = await searchMealsByName(search);
      return NextResponse.json({ meals }, { headers: cacheHeaders });
    }
  } catch (error) {
    console.error("Error consultando /api/meals/filter:", error);
    return NextResponse.json(
      { error: "No pudimos consultar el catálogo externo ahora." },
      { status: 502 },
    );
  }

  return NextResponse.json(
    { error: "Indicá un parámetro válido: i, a, c o s." },
    { status: 400 },
  );
}
