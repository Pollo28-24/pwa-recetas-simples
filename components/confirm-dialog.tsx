"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ConfirmOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type ConfirmRequest = ConfirmOptions & {
  resolve: (accepted: boolean) => void;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmDialogContext = createContext<ConfirmFn | null>(null);

/**
 * Provides a reusable Promise-based confirmation dialog (alertdialog) with
 * keyboard focus management, Escape/backdrop dismissal, and palette alignment.
 */
export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const requestRef = useRef<ConfirmRequest | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const settle = useCallback((accepted: boolean) => {
    const active = requestRef.current;
    if (!active) return;
    const targetFocus = previousFocusRef.current;
    requestRef.current = null;
    previousFocusRef.current = null;
    setRequest(null);
    active.resolve(accepted);
    if (typeof window !== "undefined" && targetFocus) {
      window.requestAnimationFrame(() => {
        if (targetFocus.isConnected) targetFocus.focus();
      });
    }
  }, []);

  const confirm = useCallback<ConfirmFn>((options) => {
    if (requestRef.current) {
      requestRef.current.resolve(false);
    }

    if (typeof document !== "undefined") {
      const activeEl = document.activeElement;
      previousFocusRef.current = activeEl instanceof HTMLElement ? activeEl : null;
    }

    return new Promise<boolean>((resolve) => {
      const nextRequest: ConfirmRequest = { ...options, resolve };
      requestRef.current = nextRequest;
      setRequest(nextRequest);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (requestRef.current) {
        requestRef.current.resolve(false);
        requestRef.current = null;
      }
    };
  }, []);

  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      {request ? (
        <ConfirmDialog
          open
          title={request.title}
          description={request.description}
          confirmLabel={request.confirmLabel}
          cancelLabel={request.cancelLabel}
          onConfirm={() => settle(true)}
          onCancel={() => settle(false)}
        />
      ) : null}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirm debe usarse dentro de <ConfirmDialogProvider>");
  }
  return context;
}

type ConfirmDialogProps = ConfirmOptions & {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key === "Tab") {
        const cancelEl = cancelButtonRef.current;
        const confirmEl = confirmButtonRef.current;
        if (!cancelEl || !confirmEl) return;

        if (event.shiftKey && document.activeElement === cancelEl) {
          event.preventDefault();
          confirmEl.focus();
        } else if (!event.shiftKey && document.activeElement === confirmEl) {
          event.preventDefault();
          cancelEl.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="motion-dialog-backdrop fixed inset-0 z-50 flex items-center justify-center bg-text/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="motion-dialog-panel w-full max-w-md rounded-3xl border border-line-strong bg-surface p-6 text-text shadow-[0_24px_48px_-16px_rgba(43,0,0,0.28)] sm:p-7"
      >
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink"
          >
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
          </span>

          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="font-display text-xl font-bold leading-snug text-text"
            >
              {title}
            </h2>
            <p
              id={descriptionId}
              className="mt-2 text-sm leading-relaxed text-muted"
            >
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end sm:gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-text transition-colors duration-150 hover:bg-panel active:scale-[0.98]"
          >
            {cancelLabel}
          </button>

          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors duration-150 hover:bg-accent-hover active:scale-[0.98]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
