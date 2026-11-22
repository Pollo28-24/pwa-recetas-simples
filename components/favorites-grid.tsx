"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useFavorites } from "@/components/favorites-provider";
import { MealCard } from "@/components/meal-card";

export function FavoritesGrid() {
  const { favorites, ready, clearFavorites } = useFavorites();
  const [confirmClear, setConfirmClear] = useState(false);

  if (!ready) {
    return (
      <div aria-busy="true" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-2xl border border-line bg-panel"
          />
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-line bg-panel p-8 text-center sm:p-10">
        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full border border-line bg-surface">
          <Image
            src="/icons/icon-128x128.png"
            alt=""
            width={64}
            height={64}
            className="size-16 object-contain"
          />
        </div>
        <h2 className="font-display text-xl font-bold text-text">
          Todavía no guardaste recetas
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Tocá el corazón en cualquier plato para tenerlo a mano en la cocina, incluso sin
          conexión a internet.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-hover active:scale-[0.985]"
        >
          Explorar recetas
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <p className="text-sm font-medium text-muted">
          <span className="font-bold text-text tabular-nums">{favorites.length}</span>{" "}
          {favorites.length === 1 ? "receta guardada" : "recetas guardadas"} · disponibles sin
          conexión si ya las abriste o guardaste con red.
        </p>

        {!confirmClear ? (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="inline-flex min-h-11 items-center rounded-xl border border-line-strong bg-surface px-3.5 py-2 text-[13px] font-semibold text-text transition-colors duration-150 hover:bg-panel"
          >
            Vaciar favoritos
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                clearFavorites();
                setConfirmClear(false);
              }}
              className="inline-flex min-h-11 items-center rounded-xl bg-accent px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-accent-hover"
            >
              Confirmar borrado
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="inline-flex min-h-11 items-center rounded-xl border border-line bg-surface px-3.5 py-2 text-[13px] font-semibold text-muted hover:text-text"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {favorites.map((meal) => (
          <MealCard key={meal.idMeal} meal={meal} />
        ))}
      </div>
    </>
  );
}
