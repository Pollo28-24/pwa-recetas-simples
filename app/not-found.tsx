import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-lg rounded-xl border border-line bg-panel p-8 text-center">
      <h1 className="text-2xl font-bold">Receta no encontrada</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        El plato que buscás no existe o cambió su identificador en TheMealDB.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-night"
        >
          Explorar recetas
        </Link>
        <Link
          href="/favoritos"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line px-5 py-2.5 text-sm font-semibold"
        >
          Ver favoritos
        </Link>
      </div>
    </section>
  );
}
