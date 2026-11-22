"use client";

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
      className="border-b border-line bg-panel px-4 py-2.5 text-center text-xs font-medium"
    >
      Sin conexión a internet. Podés seguir consultando tus{" "}
      <span className="font-semibold text-accent">favoritos guardados</span> y recetas ya
      abiertas.
    </div>
  );
}
