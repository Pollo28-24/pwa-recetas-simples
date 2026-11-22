"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto max-w-lg rounded-xl border border-line bg-panel p-8 text-center">
      <h1 className="text-2xl font-bold">No pudimos cargar las recetas</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Ocurrió un problema temporal al consultar el catálogo de TheMealDB. Podés volver a
        intentar o abrir tus favoritos guardados.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-night"
        >
          Reintentar
        </button>
        <Link
          href="/favoritos"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line px-5 py-2.5 text-sm font-semibold"
        >
          Ir a favoritos
        </Link>
      </div>
    </section>
  );
}
