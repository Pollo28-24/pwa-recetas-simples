"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FavoriteButton } from "@/components/favorite-button";
import { getMealImageUrl } from "@/lib/mealdb";
import type { MealSummary } from "@/lib/types";

type MealCardProps = {
  meal: MealSummary;
  priority?: boolean;
  featured?: boolean;
  index?: number;
};

export function MealCard({
  meal,
  priority = false,
  featured = false,
  index = 0,
}: MealCardProps) {
  const style = { "--stagger": index } as CSSProperties;

  if (featured) {
    return (
      <article
        style={style}
        className="motion-card group relative overflow-hidden rounded-3xl border border-line bg-surface p-3 transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_16px_34px_-16px_rgba(43,0,0,0.2)] sm:col-span-2 sm:p-4"
      >
        <Link href={`/receta/${meal.idMeal}`} className="grid h-full gap-4 sm:grid-cols-12 sm:gap-5">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-panel sm:col-span-7 sm:aspect-auto sm:min-h-68">
            <Image
              src={getMealImageUrl(meal.strMealThumb, "large")}
              alt={meal.strMeal}
              fill
              sizes="(max-width: 640px) 100vw, 560px"
              priority={priority}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            />
            {meal.strCategory ? (
              <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-text/15 bg-sun px-3 py-1 text-[13px] font-semibold text-text shadow-xs">
                {meal.strCategory}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col justify-between gap-4 px-2 pb-2 pt-1 sm:col-span-5 sm:px-1 sm:py-2">
            <div>
              <p className="flex min-h-11 items-center pr-14 text-[13px] font-semibold text-muted">
                {meal.strArea ? `Cocina ${meal.strArea}` : "Receta destacada"}
              </p>
              <h3 className="mt-2 font-display text-xl font-bold leading-snug text-text transition-colors duration-150 group-hover:text-accent">
                {meal.strMeal}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">
                Ingredientes ilustrados con medidas claras y preparación paso a paso lista para cocinar.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-accent">
              <span>Ver receta completa</span>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </div>
          </div>
        </Link>

        <FavoriteButton meal={meal} className="absolute right-6 top-6" />
      </article>
    );
  }

  return (
    <article
      style={style}
      className="motion-card group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_14px_30px_-14px_rgba(43,0,0,0.18)]"
    >
      <Link href={`/receta/${meal.idMeal}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-panel">
          <Image
            src={getMealImageUrl(meal.strMealThumb, "medium")}
            alt={meal.strMeal}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 300px"
            priority={priority}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
          {meal.strCategory ? (
            <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-line bg-surface/95 px-2.5 py-1 text-[13px] font-semibold text-text shadow-xs">
              {meal.strCategory}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col justify-between gap-4 p-5">
          <div>
            <p className="text-[13px] font-medium text-muted">
              {meal.strArea ? `Cocina ${meal.strArea}` : "Receta"}
            </p>

            <h3 className="mt-1.5 line-clamp-2 font-display text-base font-bold leading-snug text-text transition-colors duration-150 group-hover:text-accent">
              {meal.strMeal}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 border-t border-line/70 pt-3 text-[13px] font-semibold text-muted transition-colors duration-150 group-hover:text-accent">
            <span>Abrir paso a paso</span>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </div>
        </div>
      </Link>

      <FavoriteButton meal={meal} className="absolute right-3 top-3" />
    </article>
  );
}
