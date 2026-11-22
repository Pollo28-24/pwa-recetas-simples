"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function OfflineBanner() {
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    () => (typeof navigator !== "undefined" ? navigator.onLine : true),
    () => true,
  );

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-line bg-sun px-4 py-2.5 text-center text-[13px] font-semibold text-text"
    >
      Sin conexión a internet. Podés abrir tus{" "}
      <Link href="/favoritos" className="underline">
        favoritos guardados
      </Link>{" "}
      y las recetas ya consultadas.
    </div>
  );
}
