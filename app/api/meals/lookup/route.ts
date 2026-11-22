import { NextRequest, NextResponse } from "next/server";
import { getMealById } from "@/lib/mealdb";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("i")?.trim() ?? "";
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Identificador de receta inválido." }, { status: 400 });
  }

  try {
    const meal = await getMealById(id);
    if (!meal) {
      return NextResponse.json({ error: "Receta no encontrada." }, { status: 404 });
    }

    return NextResponse.json(
      { meal },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("Error consultando /api/meals/lookup:", error);
    return NextResponse.json(
      { error: "No pudimos consultar la receta ahora." },
      { status: 502 },
    );
  }
}
