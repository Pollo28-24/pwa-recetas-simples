"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_PREFIX = "recetario:steps:v1:";
const EMPTY_STEPS: number[] = [];

const stepCache = new Map<string, { raw: string | null; list: number[] }>();
const stepListeners = new Map<string, Set<() => void>>();

function getStorageKey(mealId: string): string {
  return `${STORAGE_PREFIX}${mealId}`;
}

function parseSteps(raw: string | null): number[] {
  if (!raw) return EMPTY_STEPS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_STEPS;
    return parsed.filter((value): value is number => Number.isInteger(value) && value >= 0);
  } catch {
    return EMPTY_STEPS;
  }
}

function getStepSnapshot(mealId: string): number[] {
  if (typeof window === "undefined") return EMPTY_STEPS;
  const key = getStorageKey(mealId);
  const raw = window.localStorage.getItem(key);
  const existing = stepCache.get(key);
  if (existing && existing.raw === raw) return existing.list;

  const list = parseSteps(raw);
  stepCache.set(key, { raw, list });
  return list;
}

function writeSteps(mealId: string, next: number[]): void {
  const key = getStorageKey(mealId);
  const serialized = JSON.stringify(next);
  stepCache.set(key, { raw: serialized, list: next });
  if (typeof window !== "undefined") {
    try {
      if (next.length === 0) {
        window.localStorage.removeItem(key);
        stepCache.set(key, { raw: null, list: EMPTY_STEPS });
      } else {
        window.localStorage.setItem(key, serialized);
      }
    } catch {
      // Storage blocked: keep in-memory state.
    }
  }
  const listeners = stepListeners.get(key);
  if (listeners) {
    for (const listener of listeners) listener();
  }
}

export function RecipeSteps({
  mealId,
  steps,
}: {
  mealId: string;
  steps: string[];
}) {
  const subscribe = useCallback(
    (listener: () => void) => {
      const key = getStorageKey(mealId);
      let set = stepListeners.get(key);
      if (!set) {
        set = new Set();
        stepListeners.set(key, set);
      }
      set.add(listener);

      const onStorage = (event: StorageEvent) => {
        if (event.key !== key) return;
        stepCache.delete(key);
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

  const completedList = useSyncExternalStore(
    subscribe,
    () => getStepSnapshot(mealId),
    () => EMPTY_STEPS,
  );

  const completedSet = new Set(completedList);

  const toggleStep = (index: number) => {
    const next = new Set(completedList);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    writeSteps(mealId, [...next].sort((a, b) => a - b));
  };

  const resetSteps = () => {
    writeSteps(mealId, EMPTY_STEPS);
  };

  if (steps.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted">
        Esta receta no incluye pasos escritos en TheMealDB. Podés consultar el vídeo o la
        fuente original.
      </p>
    );
  }

  return (
    <div>
      {completedList.length > 0 ? (
        <div className="mb-3 flex items-center justify-between text-[13px] text-muted">
          <span className="font-medium tabular-nums">
            {completedList.length} de {steps.length} pasos hechos
          </span>
          <button
            type="button"
            onClick={resetSteps}
            className="font-semibold text-accent underline hover:text-accent-hover"
          >
            Reiniciar pasos
          </button>
        </div>
      ) : null}

      <ol className="space-y-3">
        {steps.map((step, index) => {
          const done = completedSet.has(index);

          return (
            <li key={index}>
              <button
                type="button"
                onClick={() => toggleStep(index)}
                aria-pressed={done}
                className={[
                  "flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-colors duration-150",
                  done
                    ? "border-line bg-panel text-muted"
                    : "border-line bg-surface text-text hover:border-line-strong",
                ].join(" ")}
              >
                <span
                  className={[
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold tabular-nums",
                    done ? "bg-success text-white" : "bg-sun text-text",
                  ].join(" ")}
                >
                  {done ? (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={[
                    "max-w-[65ch] text-base leading-relaxed",
                    done ? "line-through" : "",
                  ].join(" ")}
                >
                  {step}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
