"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useToast } from "@/components/toast-provider";
import { getMealImageUrl } from "@/lib/mealdb";
import type { MealSummary } from "@/lib/types";

const STORAGE_KEY = "recetario:favoritos:v1";
const EMPTY_FAVORITES: MealSummary[] = [];

type FavoritesContextValue = {
  favorites: MealSummary[];
  ready: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (meal: MealSummary) => void;
  clearFavorites: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

let cachedRaw: string | null | undefined;
let cachedList: MealSummary[] = EMPTY_FAVORITES;
const listeners = new Set<() => void>();

function pickSummary(meal: MealSummary): MealSummary {
  return {
    idMeal: meal.idMeal,
    strMeal: meal.strMeal,
    strMealThumb: meal.strMealThumb,
    strCategory: meal.strCategory ?? null,
    strArea: meal.strArea ?? null,
  };
}

function parseFavorites(raw: string | null): MealSummary[] {
  if (!raw) return EMPTY_FAVORITES;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_FAVORITES;

    return parsed
      .filter(
        (item): item is MealSummary =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as MealSummary).idMeal === "string" &&
          typeof (item as MealSummary).strMeal === "string" &&
          typeof (item as MealSummary).strMealThumb === "string",
      )
      .map(pickSummary);
  } catch {
    return EMPTY_FAVORITES;
  }
}

function getFavoritesSnapshot(): MealSummary[] {
  if (typeof window === "undefined") return EMPTY_FAVORITES;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedList = parseFavorites(raw);
  }
  return cachedList;
}

function getServerSnapshot(): MealSummary[] {
  return EMPTY_FAVORITES;
}

function writeFavorites(next: MealSummary[]): void {
  const serialized = JSON.stringify(next);
  cachedRaw = serialized;
  cachedList = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      // Storage full or blocked: keep in-memory snapshot for this tab.
    }
  }
  for (const listener of listeners) {
    listener();
  }
}

function subscribeFavorites(listener: () => void): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cachedRaw = undefined;
    listener();
  };

  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function subscribeClientReady(): () => void {
  return () => {};
}

function precacheMealForOffline(meal: MealSummary): void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const controller = navigator.serviceWorker.controller;
  if (!controller) return;

  const urls = [
    `/receta/${meal.idMeal}`,
    meal.strMealThumb,
    getMealImageUrl(meal.strMealThumb, "medium"),
  ].filter(Boolean);

  controller.postMessage({ type: "CACHE_URLS", urls });
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const favorites = useSyncExternalStore(
    subscribeFavorites,
    getFavoritesSnapshot,
    getServerSnapshot,
  );
  const ready = useSyncExternalStore(
    subscribeClientReady,
    () => true,
    () => false,
  );

  const saveFavorite = useCallback(
    (meal: MealSummary) => {
      const current = getFavoritesSnapshot();
      const summary = pickSummary(meal);
      const next = [summary, ...current.filter((item) => item.idMeal !== summary.idMeal)];
      writeFavorites(next);
      precacheMealForOffline(summary);

      showToast({
        dedupeKey: `favorite:${summary.idMeal}`,
        tone: "added",
        title: "Se ha agregado a favoritos",
        description: summary.strMeal,
      });
    },
    [showToast],
  );

  const toggleFavorite = useCallback(
    (meal: MealSummary) => {
      const current = getFavoritesSnapshot();
      const exists = current.some((item) => item.idMeal === meal.idMeal);
      if (exists) {
        writeFavorites(current.filter((item) => item.idMeal !== meal.idMeal));
        showToast({
          dedupeKey: `favorite:${meal.idMeal}`,
          tone: "removed",
          title: "Se ha eliminado de favoritos",
          description: meal.strMeal,
          action: {
            label: "Deshacer",
            onClick: () => saveFavorite(meal),
          },
        });
        return;
      }

      saveFavorite(meal);
    },
    [saveFavorite, showToast],
  );

  const clearFavorites = useCallback(() => {
    const previous = getFavoritesSnapshot();
    if (previous.length === 0) return;

    writeFavorites(EMPTY_FAVORITES);
    showToast({
      dedupeKey: "favorites:clear",
      tone: "removed",
      title: "Se vaciaron tus favoritos",
      description: `${previous.length} ${previous.length === 1 ? "receta eliminada" : "recetas eliminadas"}`,
      action: {
        label: "Deshacer",
        onClick: () => {
          writeFavorites(previous);
          previous.forEach(precacheMealForOffline);
          showToast({
            dedupeKey: "favorites:clear",
            tone: "added",
            title: "Se restauraron tus favoritos",
            description: `${previous.length} ${previous.length === 1 ? "receta recuperada" : "recetas recuperadas"}`,
          });
        },
      },
    });
  }, [showToast]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      ready,
      isFavorite: (id: string) => favorites.some((item) => item.idMeal === id),
      toggleFavorite,
      clearFavorites,
    }),
    [favorites, ready, toggleFavorite, clearFavorites],
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites debe usarse dentro de <FavoritesProvider>");
  }
  return context;
}
