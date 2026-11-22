import Link from "next/link";

export default function NotFound() {
  return (
    <section className="motion-hero mx-auto max-w-lg rounded-3xl border border-line bg-panel p-8 text-center sm:p-10">
      <h1 className="font-display text-2xl font-bold text-text">Receta no encontrada</h1>
      <p className="mt-2.5 text-sm leading-relaxed text-muted">
        El plato que buscás no existe o cambió su identificador en TheMealDB.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-hover active:scale-[0.985]"
        >
          Explorar recetas
        </Link>
        <Link
          href="/favoritos"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line-strong bg-surface px-5 py-2.5 text-sm font-semibold text-text transition-colors duration-150 hover:bg-panel active:scale-[0.985]"
        >
          Ver favoritos
        </Link>
      </div>
    </section>
  );
}
