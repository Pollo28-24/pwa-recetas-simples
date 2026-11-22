"use client";

import Link from "next/link";
import { useFavorites } from "@/components/favorites-provider";
import { MealCard } from "@/components/meal-card";

export function FavoritesGrid() {
  const { favorites, ready } = useFavorites();

  if (!ready) return null;

  if (favorites.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line p-10 text-center">
        <p className="font-semibold">Todavía no hay favoritos</p>
        <Link href="/" className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-night">
          Explorar recetas
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="border-b border-line pb-2 text-sm text-muted">
        {favorites.length} {favorites.length === 1 ? "receta guardada" : "recetas guardadas"}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {favorites.map((meal) => (
          <MealCard key={meal.idMeal} meal={meal} />
        ))}
      </div>
    </>
  );
}
