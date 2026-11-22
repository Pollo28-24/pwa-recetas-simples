"use client";

import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import type { MealSummary } from "@/lib/types";

type MealCardProps = {
  meal: MealSummary;
  priority?: boolean;
};

export function MealCard({ meal, priority = false }: MealCardProps) {
  const meta = [meal.strCategory, meal.strArea].filter(Boolean).join(" · ");

  return (
    <article className="group relative">
      <Link href={`/receta/${meal.idMeal}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-panel">
          <Image
            src={meal.strMealThumb}
            alt={meal.strMeal}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            priority={priority}
            className="object-cover"
          />
        </div>
        <p className="mt-2 truncate text-[10px] font-semibold uppercase tracking-wider text-muted">
          {meta || "Receta"}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold group-hover:underline">
          {meal.strMeal}
        </h3>
      </Link>

      <FavoriteButton meal={meal} className="absolute right-2 top-2" />
    </article>
  );
}
