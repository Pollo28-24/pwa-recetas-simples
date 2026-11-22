import type { Metadata } from "next";
import { FavoritesGrid } from "@/components/favorites-grid";

export const metadata: Metadata = {
  title: "Favoritos",
  description: "Recetas guardadas.",
};

export default function FavoritesPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Favoritos</h1>
      <FavoritesGrid />
    </>
  );
}
