"use client";

import Image from "next/image";
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
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group inline-flex shrink-0 items-center gap-2 rounded-xl py-1 pr-1 sm:gap-2.5 sm:pr-2"
          aria-label="Recetario, inicio"
        >
          <span className="relative block size-9 shrink-0 overflow-hidden rounded-full border border-line bg-surface shadow-xs transition-transform duration-150 group-hover:scale-105 sm:size-10">
            <Image
              src="/icons/icon-96x96.png"
              alt=""
              fill
              sizes="40px"
              priority
              className="object-contain p-0.5"
            />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-text sm:text-xl">
            Recetario<span className="text-accent">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <InstallButton />
          <nav aria-label="Navegación principal" className="flex items-center gap-1 sm:gap-1.5">
            {links.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "inline-flex min-h-10 items-center gap-1.5 rounded-xl px-2.5 py-2 text-[13px] font-semibold transition-colors duration-150 active:scale-[0.985] sm:min-h-11 sm:gap-2 sm:px-3.5 sm:text-sm",
                    active
                      ? "bg-accent text-white shadow-xs hover:bg-accent-hover"
                      : "text-muted hover:bg-panel hover:text-text",
                  ].join(" ")}
                >
                  <span>{link.label}</span>
                  {link.href === "/favoritos" && ready && favorites.length > 0 ? (
                    <span
                      className="inline-flex min-w-5 items-center justify-center rounded-full bg-sun px-1.5 py-0.5 text-[13px] font-bold leading-none text-text tabular-nums sm:min-w-6"
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
