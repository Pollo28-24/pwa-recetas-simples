import type { MetadataRoute } from "next";

const ICON_SIZES = ["72x72", "96x96", "128x128", "144x144", "152x152", "192x192", "384x384", "512x512"] as const;

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Recetario — Cocina Simple",
    short_name: "Recetario",
    description: "Explora recetas de TheMealDB por categoría, cocina o ingrediente y guárdalas sin conexión.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FFFDF7",
    theme_color: "#FFFDF7",
    lang: "es",
    categories: ["food", "lifestyle"],
    icons: ICON_SIZES.map((size) => ({
      src: `/icons/icon-${size}.png`,
      sizes: size,
      type: "image/png",
      purpose: "any",
    })),
    shortcuts: [
      {
        name: "Explorar recetas",
        short_name: "Recetas",
        description: "Buscar en todo el catálogo culinario",
        url: "/",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" }],
      },
      {
        name: "Mis favoritos",
        short_name: "Favoritos",
        description: "Abrir tus recetas guardadas sin conexión",
        url: "/favoritos",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" }],
      },
    ],
  };
}
