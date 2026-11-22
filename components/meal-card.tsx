"use client";

import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { getMealImageUrl } from "@/lib/mealdb";
import type { MealSummary } from "@/lib/types";

type MealCardProps = {
  meal: MealSummary;
  priority?: boolean;
};

export function MealCard({ meal, priority = false }: MealCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[transform,border-color,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_12px_28px_-14px_rgba(43,0,0,0.18)]">
      <Link href={`/receta/${meal.idMeal}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-panel">
          <Image
            src={getMealImageUrl(meal.strMealThumb, "medium")}
            alt={meal.strMeal}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            priority={priority}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>

        <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 text-[13px] font-medium text-muted">
              {meal.strCategory ? (
                <span className="rounded-md bg-panel px-2 py-0.5 text-text">
                  {meal.strCategory}
                </span>
              ) : null}
              {meal.strArea ? <span>{meal.strArea}</span> : null}
              {!meal.strCategory && !meal.strArea ? <span>Receta</span> : null}
            </div>

            <h3 className="mt-2 line-clamp-2 font-display text-base font-semibold leading-snug text-text group-hover:text-accent group-hover:underline">
              {meal.strMeal}
            </h3>
          </div>
        </div>
      </Link>

      <FavoriteButton meal={meal} className="absolute right-2.5 top-2.5" />
    </article>
  );
}
