"use client";

import { useFavorites } from "@/components/favorites-provider";
import type { MealSummary } from "@/lib/types";

type FavoriteButtonProps = {
  meal: MealSummary;
  withLabel?: boolean;
  className?: string;
};

export function FavoriteButton({ meal, withLabel = false, className = "" }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(meal.idMeal);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(meal)}
      aria-pressed={active}
      aria-label={
        active
          ? `Quitar ${meal.strMeal} de favoritos`
          : `Guardar ${meal.strMeal} en favoritos`
      }
      className={[
        "inline-flex min-h-11 items-center justify-center gap-2 border font-semibold transition-all duration-150 ease-out active:scale-[0.96]",
        withLabel ? "rounded-xl px-4 py-2.5 text-sm" : "size-11 rounded-full shadow-sm",
        active
          ? "border-accent bg-accent text-white hover:bg-accent-hover"
          : withLabel
            ? "border-line-strong bg-surface text-text hover:bg-panel"
            : "border-line bg-surface/95 text-text hover:scale-105 hover:border-accent hover:text-accent",
        className,
      ].join(" ")}
    >
      <HeartIcon
        filled={active}
        className={[
          "size-5 shrink-0 transition-transform duration-150",
          active ? "motion-heart-active" : "",
        ].join(" ")}
      />
      {withLabel ? (
        <span>{active ? "Guardada en favoritos" : "Guardar en favoritos"}</span>
      ) : null}
    </button>
  );
}

function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 5.6a5.6 5.6 0 0 0-7.9 0L12 6.5l-.9-.9a5.6 5.6 0 0 0-7.9 7.9l.9.9L12 21l7.9-6.6.9-.9a5.6 5.6 0 0 0 0-7.9Z" />
    </svg>
  );
}
