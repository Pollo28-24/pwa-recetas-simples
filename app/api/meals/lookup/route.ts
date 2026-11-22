import { NextRequest, NextResponse } from "next/server";
import { getMealById } from "@/lib/mealdb";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("i")?.trim() ?? "";
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Identificador de receta inválido." }, { status: 400 });
  }

  const meal = await getMealById(id);
  if (!meal) {
    return NextResponse.json({ error: "Receta no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ meal });
}
