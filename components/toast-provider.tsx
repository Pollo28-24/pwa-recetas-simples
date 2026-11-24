"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastTone = "added" | "removed" | "info";

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type ShowToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  action?: ToastAction;
  dedupeKey?: string;
  durationMs?: number;
};

type ToastItem = ShowToastInput & {
  id: number;
  tone: ToastTone;
  durationMs: number;
  closing: boolean;
};

type ToastContextValue = {
  showToast: (input: ShowToastInput) => void;
  dismissToast: (id: number) => void;
};

const MAX_TOASTS = 3;
const DEFAULT_DURATION_MS = 3800;
const EXIT_ANIMATION_MS = 180;

const ToastContext = createContext<ToastContextValue | null>(null);

type TimerRecord = {
  dismissTimeout?: ReturnType<typeof setTimeout>;
  removeTimeout?: ReturnType<typeof setTimeout>;
  startedAt: number;
  remainingMs: number;
};

/**
 * Provides an accessible, non-intrusive toast notification queue aligned with
 * the warm daylight palette and respects prefers-reduced-motion.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastsRef = useRef<ToastItem[]>([]);
  const nextIdRef = useRef(1);
  const timersRef = useRef(new Map<number, TimerRecord>());

  const commitToasts = useCallback((nextList: ToastItem[]) => {
    toastsRef.current = nextList;
    setToasts(nextList);
  }, []);

  const clearTimers = useCallback((id: number) => {
    const record = timersRef.current.get(id);
    if (!record) return;
    if (record.dismissTimeout) clearTimeout(record.dismissTimeout);
    if (record.removeTimeout) clearTimeout(record.removeTimeout);
    timersRef.current.delete(id);
  }, []);

  const dismissToast = useCallback(
    (id: number) => {
      const target = toastsRef.current.find((item) => item.id === id);
      if (!target) return;

      const existing = timersRef.current.get(id);
      if (existing?.dismissTimeout) clearTimeout(existing.dismissTimeout);
      if (existing?.removeTimeout) return;

      commitToasts(
        toastsRef.current.map((item) =>
          item.id === id ? { ...item, closing: true } : item,
        ),
      );

      const removeTimeout = setTimeout(() => {
        timersRef.current.delete(id);
        commitToasts(toastsRef.current.filter((item) => item.id !== id));
      }, EXIT_ANIMATION_MS);

      timersRef.current.set(id, {
        startedAt: Date.now(),
        remainingMs: 0,
        removeTimeout,
      });
    },
    [commitToasts],
  );

  const scheduleAutoDismiss = useCallback(
    (id: number, delayMs: number) => {
      clearTimers(id);
      const dismissTimeout = setTimeout(() => {
        dismissToast(id);
      }, delayMs);

      timersRef.current.set(id, {
        dismissTimeout,
        startedAt: Date.now(),
        remainingMs: delayMs,
      });
    },
    [clearTimers, dismissToast],
  );

  const pauseToast = useCallback((id: number) => {
    const record = timersRef.current.get(id);
    if (!record?.dismissTimeout) return;

    clearTimeout(record.dismissTimeout);
    const elapsed = Date.now() - record.startedAt;
    const remainingMs = Math.max(1200, record.remainingMs - elapsed);
    timersRef.current.set(id, {
      startedAt: Date.now(),
      remainingMs,
    });
  }, []);

  const resumeToast = useCallback(
    (id: number) => {
      const record = timersRef.current.get(id);
      if (!record || record.dismissTimeout || record.removeTimeout) return;
      scheduleAutoDismiss(id, record.remainingMs);
    },
    [scheduleAutoDismiss],
  );

  const showToast = useCallback(
    (input: ShowToastInput) => {
      const id = nextIdRef.current++;
      const durationMs = input.durationMs ?? DEFAULT_DURATION_MS;
      const nextToast: ToastItem = {
        ...input,
        id,
        tone: input.tone ?? "info",
        durationMs,
        closing: false,
      };

      const filtered = input.dedupeKey
        ? toastsRef.current.filter((item) => {
            if (item.dedupeKey === input.dedupeKey) {
              clearTimers(item.id);
              return false;
            }
            return true;
          })
        : [...toastsRef.current];

      const nextList = [...filtered, nextToast];
      while (nextList.length > MAX_TOASTS) {
        const evicted = nextList.shift();
        if (evicted) clearTimers(evicted.id);
      }

      commitToasts(nextList);
      scheduleAutoDismiss(id, durationMs);
    },
    [clearTimers, commitToasts, scheduleAutoDismiss],
  );

  useEffect(() => {
    const activeTimers = timersRef.current;
    return () => {
      for (const record of activeTimers.values()) {
        if (record.dismissTimeout) clearTimeout(record.dismissTimeout);
        if (record.removeTimeout) clearTimeout(record.removeTimeout);
      }
      activeTimers.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        aria-relevant="additions text"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-stretch gap-2.5 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-full sm:max-w-[26rem]"
      >
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onDismiss={dismissToast}
            onPause={pauseToast}
            onResume={resumeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>");
  }
  return context;
}

function ToastCard({
  toast,
  onDismiss,
  onPause,
  onResume,
}: {
  toast: ToastItem;
  onDismiss: (id: number) => void;
  onPause: (id: number) => void;
  onResume: (id: number) => void;
}) {
  const badgeClass =
    toast.tone === "added"
      ? "bg-success-soft text-success-ink"
      : toast.tone === "removed"
        ? "bg-accent-soft text-accent-ink"
        : "border border-line bg-panel text-text";

  return (
    <div
      role="status"
      onMouseEnter={() => onPause(toast.id)}
      onMouseLeave={() => onResume(toast.id)}
      onFocusCapture={() => onPause(toast.id)}
      onBlurCapture={() => onResume(toast.id)}
      className={[
        "pointer-events-auto flex items-center gap-3 rounded-2xl border border-line-strong bg-surface p-3.5 text-text shadow-[0_14px_30px_-10px_rgba(43,0,0,0.18)]",
        toast.closing ? "motion-toast-out" : "motion-toast-in",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          badgeClass,
        ].join(" ")}
      >
        <ToneIcon tone={toast.tone} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold leading-snug text-text">{toast.title}</p>
        {toast.description ? (
          <p className="mt-0.5 truncate text-[13px] font-medium text-muted">
            {toast.description}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {toast.action ? (
          <button
            type="button"
            onClick={() => {
              onDismiss(toast.id);
              toast.action?.onClick();
            }}
            className="inline-flex min-h-11 items-center rounded-xl border border-line-strong bg-panel px-3 py-2 text-[13px] font-semibold text-text transition-colors duration-150 hover:bg-sun active:scale-[0.97]"
          >
            {toast.action.label}
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Cerrar notificación"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-muted transition-colors duration-150 hover:bg-panel hover:text-text active:scale-[0.96]"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ToneIcon({ tone }: { tone: ToastTone }) {
  if (tone === "added") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <path d="M20.8 5.6a5.6 5.6 0 0 0-7.9 0L12 6.5l-.9-.9a5.6 5.6 0 0 0-7.9 7.9l.9.9L12 21l7.9-6.6.9-.9a5.6 5.6 0 0 0 0-7.9Z" />
      </svg>
    );
  }

  if (tone === "removed") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <path d="M20.8 5.6a5.6 5.6 0 0 0-7.9 0L12 6.5l-.9-.9a5.6 5.6 0 0 0-7.9 7.9l.9.9L12 21l7.9-6.6.9-.9a5.6 5.6 0 0 0 0-7.9Z" />
        <path d="M4 4l16 16" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
