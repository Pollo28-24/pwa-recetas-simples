import { IngredientThumb } from "@/components/ingredient-thumb";
import type { Ingredient } from "@/lib/types";

export function IngredientsList({ ingredients }: { ingredients: Ingredient[] }) {
  if (ingredients.length === 0) {
    return (
      <p className="text-sm text-muted">
        Esta receta no detalla ingredientes individuales en TheMealDB.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {ingredients.map((ingredient, index) => (
        <li
          key={`${ingredient.name}-${index}`}
          className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1"
        >
          <div className="flex min-w-0 items-center gap-3">
            <IngredientThumb name={ingredient.name} />
            <span className="text-base font-semibold leading-snug text-text">
              {ingredient.name}
            </span>
          </div>

          {ingredient.measure ? (
            <span className="shrink-0 rounded-full border border-line bg-surface px-3 py-1 text-[13px] font-semibold text-muted tabular-nums">
              {ingredient.measure}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
