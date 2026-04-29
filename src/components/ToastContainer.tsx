import { useContext } from 'preact/hooks';
import { ToastContext } from '../context/ToastContext';

export function ToastContainer() {
  const ctx = useContext(ToastContext);
  if (!ctx || ctx.toasts.length === 0) return null;

  const styles: Record<string, string> = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-slate-900 text-white',
  };

  return (
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-[min(420px,calc(100vw-2rem))]">
      {ctx.toasts.map((t) => (
        <div
          key={t.id}
          class={`shadow-lg rounded-lg px-4 py-3 border border-white/10 ${styles[t.type] || styles.info}`}
        >
          <div class="flex items-start justify-between gap-3">
            <div class="text-sm font-bold leading-snug whitespace-pre-wrap">{t.message}</div>
            <button
              class="text-white/80 hover:text-white font-black"
              onClick={() => ctx.remove(t.id)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

