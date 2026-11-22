import type { CSSProperties } from "react";

export function RecipeSteps({ steps }: { steps: string[] }) {
  if (steps.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-muted">
        Esta receta no incluye pasos escritos en TheMealDB. Podés consultar el vídeo o la
        fuente original arriba.
      </p>
    );
  }

  return (
    <ol className="divide-y divide-line">
      {steps.map((step, index) => {
        const style = { "--stagger": index } as CSSProperties;

        return (
          <li
            key={index}
            style={style}
            className="motion-card flex items-start gap-4 py-5 first:pt-1 last:pb-1"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-text/15 bg-sun text-[13px] font-bold text-text tabular-nums"
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[13px] font-semibold text-muted">
                Paso {index + 1}
              </p>
              <p className="max-w-[62ch] text-base leading-[1.7] text-text">
                {step}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
