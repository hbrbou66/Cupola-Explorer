const shownKeys = new Set<string>();

export type ToastOptions = {
  type?: 'info' | 'warning' | 'error';
  timeoutMs?: number;
};

export function toastOnce(key: string, message: string, options: ToastOptions = {}) {
  if (shownKeys.has(key)) return;
  shownKeys.add(key);
  window.dispatchEvent(
    new CustomEvent('app:toast', {
      detail: {
        key,
        message,
        ...options,
      },
    })
  );
}

export function resetToastKey(key: string) {
  shownKeys.delete(key);
}

export function clearToastKeys() {
  shownKeys.clear();
}
