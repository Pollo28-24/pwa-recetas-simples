import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sin conexión",
  description: "Consulta tus recetas favoritas guardadas mientras recuperas conexión.",
};

export default function OfflinePage() {
  return (
    <section className="motion-hero mx-auto max-w-lg rounded-3xl border border-line bg-panel p-8 text-center sm:p-10">
      <div className="relative mx-auto mb-5 size-20 overflow-hidden rounded-full border border-line bg-surface">
        <Image
          src="/icons/icon-128x128.png"
          alt=""
          fill
          sizes="80px"
          className="object-contain p-2"
        />
      </div>
      <h1 className="font-display text-2xl font-bold text-text">
        Estás sin conexión a internet
      </h1>
      <p className="mt-2.5 text-sm leading-relaxed text-muted">
        No pudimos cargar esta receta porque todavía no estaba guardada en tu dispositivo. Podés
        abrir tus recetas favoritas o volver cuando recuperes señal.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/favoritos"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-hover active:scale-[0.985]"
        >
          Ver mis favoritos
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line-strong bg-surface px-5 py-2.5 text-sm font-semibold text-text transition-colors duration-150 hover:bg-panel active:scale-[0.985]"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
