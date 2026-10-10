import { createContext, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Optional inline action, rendered as a link. */
  action?: { label: string; to: string };
  durationMs?: number;
}

interface Toast extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  dismiss: (id: number) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  error: <XCircle className="h-5 w-5 text-rose-500" />,
  info: <Info className="h-5 w-5 text-gold" />,
};

const MAX_VISIBLE = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ durationMs = 3500, ...options }: ToastOptions) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { ...options, id }].slice(-MAX_VISIBLE));
      window.setTimeout(() => dismiss(id), durationMs);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Bottom on phones (never over the header/cart button), top-right on desktop.
          Sits below drawers & dialogs (z-90+) so an open drawer always covers it. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[85] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm animate-scale-in items-start gap-3 rounded-2xl border border-navy/10 bg-white p-4 shadow-lift"
          >
            <span className="mt-0.5 shrink-0">{ICONS[t.variant ?? 'success']}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-navy">{t.title}</p>
              {t.description && <p className="mt-0.5 line-clamp-2 text-xs text-navy-soft">{t.description}</p>}
              {t.action && (
                <Link
                  to={t.action.to}
                  onClick={() => dismiss(t.id)}
                  className="mt-2 inline-block text-xs font-bold uppercase tracking-wider text-gold-dark underline-offset-4 hover:underline"
                >
                  {t.action.label}
                </Link>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="-m-1 rounded-full p-1 text-navy-soft/60 transition-colors hover:bg-cream-2 hover:text-navy"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
