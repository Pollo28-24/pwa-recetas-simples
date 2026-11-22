import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { FavoritesProvider } from "@/components/favorites-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { OfflineBanner } from "@/components/offline-banner";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-bricolage",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: {
    default: "Recetario",
    template: "%s · Recetario",
  },
  description:
    "Explora 790 recetas de TheMealDB por categoría, cocina o ingrediente y guárdalas sin conexión.",
  applicationName: "Recetario",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icons/icon-96x96.png",
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFDF7",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${bricolage.variable} ${figtree.variable}`}>
      <body className="flex min-h-dvh flex-col bg-canvas text-text">
        <a
          href="#contenido-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-sun focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-text focus:shadow-md"
        >
          Saltar al contenido
        </a>
        <FavoritesProvider>
          <Header />
          <OfflineBanner />
          <main
            id="contenido-principal"
            className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
          >
            {children}
          </main>
          <Footer />
          <PwaRegister />
        </FavoritesProvider>
      </body>
    </html>
  );
}
