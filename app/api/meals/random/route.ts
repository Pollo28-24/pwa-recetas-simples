import { NextResponse } from "next/server";
import { getRandomMeal, toSummary } from "@/lib/mealdb";

export const dynamic = "force-dynamic";

export async function GET() {
  const meal = await getRandomMeal();
  if (!meal) {
    return NextResponse.json(
      { error: "No pudimos obtener una receta aleatoria ahora." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    meal: toSummary(meal),
  });
}
