"use client";

import Image from "next/image";
import { useCallback, useState, useSyncExternalStore } from "react";
import { getIngredientImageUrl } from "@/lib/mealdb";
import type { Ingredient } from "@/lib/types";

const STORAGE_PREFIX = "recetario:checklist:v1:";
const EMPTY_CHECKED: number[] = [];

const checkedCache = new Map<string, { raw: string | null; list: number[] }>();
const listenersByMeal = new Map<string, Set<() => void>>();

function getStorageKey(mealId: string): string {
  return `${STORAGE_PREFIX}${mealId}`;
}

function parseChecked(raw: string | null): number[] {
  if (!raw) return EMPTY_CHECKED;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_CHECKED;
    return parsed.filter((value): value is number => Number.isInteger(value) && value >= 0);
  } catch {
    return EMPTY_CHECKED;
  }
}

function getCheckedSnapshot(mealId: string): number[] {
  if (typeof window === "undefined") return EMPTY_CHECKED;
  const key = getStorageKey(mealId);
  const raw = window.localStorage.getItem(key);
  const existing = checkedCache.get(key);
  if (existing && existing.raw === raw) return existing.list;

  const list = parseChecked(raw);
  checkedCache.set(key, { raw, list });
  return list;
}

function writeChecked(mealId: string, next: number[]): void {
  const key = getStorageKey(mealId);
  const serialized = JSON.stringify(next);
  checkedCache.set(key, { raw: serialized, list: next });
  if (typeof window !== "undefined") {
    try {
      if (next.length === 0) {
        window.localStorage.removeItem(key);
        checkedCache.set(key, { raw: null, list: EMPTY_CHECKED });
      } else {
        window.localStorage.setItem(key, serialized);
      }
    } catch {
      // Storage blocked: keep in-memory state.
    }
  }
  const listeners = listenersByMeal.get(key);
  if (listeners) {
    for (const listener of listeners) listener();
  }
}

function IngredientThumb({ name }: { name: string }) {
  const [hidden, setHidden] = useState(false);

  if (hidden) {
    return (
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-panel text-[13px] font-bold text-text"
      >
        {name.slice(0, 1).toUpperCase()}
      </span>
    );
  }

  return (
    <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-panel">
      <Image
        src={getIngredientImageUrl(name, "small")}
        alt=""
        width={36}
        height={36}
        className="size-8 object-contain"
        onError={() => setHidden(true)}
      />
    </span>
  );
}

export function IngredientsList({
  mealId,
  ingredients,
}: {
  mealId: string;
  ingredients: Ingredient[];
}) {
  const subscribe = useCallback(
    (listener: () => void) => {
      const key = getStorageKey(mealId);
      let set = listenersByMeal.get(key);
      if (!set) {
        set = new Set();
        listenersByMeal.set(key, set);
      }
      set.add(listener);

      const onStorage = (event: StorageEvent) => {
        if (event.key !== key) return;
        checkedCache.delete(key);
        listener();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        set?.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
    [mealId],
  );

  const checkedList = useSyncExternalStore(
    subscribe,
    () => getCheckedSnapshot(mealId),
    () => EMPTY_CHECKED,
  );

  const checkedSet = new Set(checkedList);

  const toggle = (index: number) => {
    const next = new Set(checkedList);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    writeChecked(mealId, [...next].sort((a, b) => a - b));
  };

  const resetAll = () => {
    writeChecked(mealId, EMPTY_CHECKED);
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-2 sm:p-3">
      {checkedList.length > 0 ? (
        <div className="flex items-center justify-between border-b border-line px-2 pb-2.5 pt-1 text-[13px] text-muted">
          <span className="font-medium tabular-nums">
            {checkedList.length} de {ingredients.length} listos
          </span>
          <button
            type="button"
            onClick={resetAll}
            className="font-semibold text-accent underline hover:text-accent-hover"
          >
            Reiniciar lista
          </button>
        </div>
      ) : null}

      <ul className="divide-y divide-line">
        {ingredients.map((ingredient, index) => {
          const isChecked = checkedSet.has(index);

          return (
            <li key={`${ingredient.name}-${index}`}>
              <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 transition-colors duration-150 hover:bg-panel">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(index)}
                  className="size-5 shrink-0 accent-accent"
                />
                <IngredientThumb name={ingredient.name} />
                <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3 text-base leading-snug">
                  <span className={isChecked ? "text-muted line-through" : "font-semibold text-text"}>
                    {ingredient.name}
                  </span>
                  {ingredient.measure ? (
                    <span className="rounded-md bg-panel px-2 py-0.5 text-[13px] font-medium text-muted">
                      {ingredient.measure}
                    </span>
                  ) : null}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
