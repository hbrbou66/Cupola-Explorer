import { useEffect, useState } from 'react';

export type ToastPayload = {
  key: string;
  message: string;
  type?: 'info' | 'warning' | 'error';
  timeoutMs?: number;
};

type ActiveToast = ToastPayload & { createdAt: number };

export default function ToastHost() {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const detail = (event as CustomEvent<ToastPayload>).detail;
      if (!detail) return;
      const timeoutMs = detail.timeoutMs ?? 5000;
      const toast: ActiveToast = { ...detail, timeoutMs, createdAt: Date.now() };
      setToasts((current) => {
        const existing = current.find((item) => item.key === toast.key);
        if (existing) {
          return current.map((item) => (item.key === toast.key ? toast : item));
        }
        return [...current, toast];
      });
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.key !== toast.key));
      }, timeoutMs);
    };

    window.addEventListener('app:toast', handleToast);
    return () => {
      window.removeEventListener('app:toast', handleToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed left-4 bottom-4 z-[60] flex w-full max-w-sm flex-col gap-3 sm:max-w-md">
      {toasts.map((toast) => {
        const tone =
          toast.type === 'warning'
            ? 'border-amber-400/80 bg-amber-900/80 text-amber-100'
            : toast.type === 'error'
              ? 'border-rose-400/80 bg-rose-900/80 text-rose-100'
              : 'border-sky-400/80 bg-sky-900/80 text-sky-100';
        return (
          <div
            key={toast.key}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-xl backdrop-blur-md transition ${tone}`}
            role="status"
            aria-live="assertive"
          >
            <p className="flex-1 leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToasts((current) => current.filter((item) => item.key !== toast.key))}
              className="mt-0.5 rounded-full border border-transparent p-1 text-xs text-slate-200 transition hover:border-slate-200/60 hover:bg-slate-900/50 hover:text-white"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
