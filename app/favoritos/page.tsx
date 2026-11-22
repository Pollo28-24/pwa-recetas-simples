import type { Metadata } from "next";
import { FavoritesGrid } from "@/components/favorites-grid";

export const metadata: Metadata = {
  title: "Favoritos",
  description: "Tus recetas guardadas para consultar en la cocina, incluso sin conexión.",
};

export default function FavoritesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">
          Tus recetas favoritas
        </h1>
        <p className="mt-1 text-sm text-muted">
          Se guardan en tu dispositivo y se pre-cachean para que puedas cocinarlas sin red.
        </p>
      </div>
      <FavoritesGrid />
    </div>
  );
}
