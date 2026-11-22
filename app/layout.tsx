import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import { FavoritesProvider } from "@/components/favorites-provider";
import { Header } from "@/components/header";
import { OfflineBanner } from "@/components/offline-banner";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Recetario",
    template: "%s · Recetario",
  },
  description: "Recetas de TheMealDB con buscador, filtros y favoritos offline.",
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
    <html lang="es" className={openSans.variable}>
      <body>
        <a
          href="#contenido-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-night"
        >
          Saltar al contenido
        </a>
        <FavoritesProvider>
          <Header />
          <OfflineBanner />
          <main id="contenido-principal" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <PwaRegister />
        </FavoritesProvider>
      </body>
    </html>
  );
}
