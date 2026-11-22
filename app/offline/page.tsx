import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sin conexión",
  description: "Consulta tus recetas favoritas guardadas mientras recuperas conexión.",
};

export default function OfflinePage() {
  return (
    <section className="mx-auto max-w-xl rounded-xl border border-line bg-panel p-8 text-center">
      <h1 className="text-2xl font-bold">Estás sin conexión a internet</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        No pudimos cargar esta receta porque todavía no estaba guardada en la caché de tu
        dispositivo. Podés abrir tus recetas favoritas guardadas o reintentar al volver a
        conectarte.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/favoritos"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-night"
        >
          Ver mis favoritos
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line px-5 py-2.5 text-sm font-semibold"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
