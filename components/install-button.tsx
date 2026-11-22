"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function subscribeDisplayMode(callback: () => void) {
  const mq = window.matchMedia("(display-mode: standalone)");
  mq.addEventListener("change", callback);
  window.addEventListener("appinstalled", callback);
  return () => {
    mq.removeEventListener("change", callback);
    window.removeEventListener("appinstalled", callback);
  };
}

function getStandaloneSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function subscribeClientMount() {
  return () => {};
}

export function InstallButton() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissedHint, setDismissedHint] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  const isClient = useSyncExternalStore(
    subscribeClientMount,
    () => true,
    () => false,
  );

  const isStandalone = useSyncExternalStore(
    subscribeDisplayMode,
    getStandaloneSnapshot,
    () => false,
  );

  const isIosSafari =
    isClient &&
    /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
    !/crios|fxios|edgios/i.test(window.navigator.userAgent);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setPromptEvent(null);
      setShowIosGuide(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!isClient || isStandalone) return null;

  const canPrompt = Boolean(promptEvent);
  if (!canPrompt && (!isIosSafari || dismissedHint)) return null;

  const handleInstall = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        setPromptEvent(null);
      }
      return;
    }

    if (isIosSafari) {
      setShowIosGuide((prev) => !prev);
    }
  };

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={handleInstall}
        aria-label="Instalar aplicación"
        aria-expanded={isIosSafari ? showIosGuide : undefined}
        className="inline-flex size-10 items-center justify-center gap-1.5 rounded-xl border border-line-strong bg-panel text-[13px] font-semibold text-text transition-colors duration-150 hover:bg-sun active:scale-[0.985] sm:min-h-11 sm:w-auto sm:px-3.5 sm:py-2"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 shrink-0"
        >
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 20h14" />
        </svg>
        <span className="hidden sm:inline">Instalar app</span>
      </button>

      {isIosSafari && showIosGuide ? (
        <div
          role="dialog"
          aria-label="Cómo instalar en iOS"
          className="fixed right-4 top-20 z-50 w-72 rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed text-text shadow-lg"
        >
          <p className="font-display font-bold">Instalar en iPhone o iPad</p>
          <p className="mt-1.5 text-[13px] text-muted">
            Tocá el botón <strong>Compartir</strong> de Safari y elegí{" "}
            <strong>«Añadir a pantalla de inicio»</strong>.
          </p>
          <button
            type="button"
            onClick={() => {
              setShowIosGuide(false);
              setDismissedHint(true);
            }}
            className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-sun px-3 py-1.5 text-[13px] font-semibold text-text"
          >
            Entendido
          </button>
        </div>
      ) : null}
    </div>
  );
}
