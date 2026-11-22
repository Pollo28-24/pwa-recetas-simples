import { NextResponse } from "next/server";
import { getRandomMeal, toSummary } from "@/lib/mealdb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const meal = await getRandomMeal();
    if (!meal) {
      return NextResponse.json(
        { error: "No pudimos obtener una receta aleatoria ahora." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      {
        meal: toSummary(meal),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Error consultando /api/meals/random:", error);
    return NextResponse.json(
      { error: "No pudimos obtener una receta aleatoria ahora." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
