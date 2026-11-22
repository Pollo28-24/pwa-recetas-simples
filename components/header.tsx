"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFavorites } from "@/components/favorites-provider";
import { InstallButton } from "@/components/install-button";

const links = [
  { href: "/", label: "Recetas" },
  { href: "/favoritos", label: "Favoritos" },
];

export function Header() {
  const pathname = usePathname();
  const { favorites, ready } = useFavorites();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-night">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-lg font-bold" aria-label="Recetario, inicio">
          recetario<span className="text-accent">.</span>
        </Link>

        <div className="flex items-center gap-2">
          <InstallButton />
          <nav aria-label="Navegación principal" className="flex gap-1">
            {links.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm",
                    active
                      ? "bg-accent font-semibold text-night"
                      : "text-muted hover:text-text",
                  ].join(" ")}
                >
                  {link.label}
                  {link.href === "/favoritos" && ready && favorites.length > 0 ? (
                    <span
                      className={[
                        "rounded-full px-1.5 text-[11px] font-bold leading-5",
                        active ? "bg-night/20 text-night" : "bg-accent text-night",
                      ].join(" ")}
                    >
                      {favorites.length}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
