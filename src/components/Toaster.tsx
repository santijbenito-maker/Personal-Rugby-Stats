import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';

type TipoToast = 'pr' | 'exito' | 'error' | 'info';

type Toast = {
  id: string;
  tipo: TipoToast;
  mensaje: string;
  /** Duración en ms; 0 = manual. Default 4500ms. */
  duracion?: number;
};

type ToastContextValue = {
  mostrar: (t: Omit<Toast, 'id'>) => string;
  cerrar: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** Provider global de toasts. Va envolviendo a <App /> en main.tsx. */
export function ToasterProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const cerrar = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = crypto.randomUUID();
      const duracion = t.duracion ?? 4500;
      setToasts((prev) => [...prev, { ...t, id }]);
      if (duracion > 0) {
        setTimeout(() => cerrar(id), duracion);
      }
      return id;
    },
    [cerrar],
  );

  return (
    <ToastContext.Provider value={{ mostrar, cerrar }}>
      {children}
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none w-[90%] max-w-md"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastVisual key={t.id} toast={t} onCerrar={() => cerrar(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Hook que devuelve `{ mostrar, cerrar }`. Tira error si no está dentro del Provider. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToasterProvider />');
  return ctx;
}

// ───────────────────────────────────────────────────────────────
// UI del toast
// ───────────────────────────────────────────────────────────────

const estilosTipo: Record<TipoToast, { fondo: string; borde: string; icono: string }> = {
  pr: { fondo: 'bg-verde-record', borde: 'border-verde-record', icono: '🏆' },
  exito: { fondo: 'bg-verde-record', borde: 'border-verde-record', icono: '✓' },
  error: { fondo: 'bg-rojo', borde: 'border-rojo', icono: '⚠️' },
  info: { fondo: 'bg-azul-principal', borde: 'border-azul-principal', icono: 'ℹ️' },
};

function ToastVisual({ toast, onCerrar }: { toast: Toast; onCerrar: () => void }) {
  const { fondo, icono } = estilosTipo[toast.tipo];
  const [animando, setAnimando] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setAnimando(true));
  }, []);

  return (
    <div
      role="status"
      className={[
        'pointer-events-auto rounded-lg shadow-lg text-white px-4 py-3 flex items-start gap-3',
        fondo,
        'transition-all duration-200',
        animando ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
      ].join(' ')}
    >
      <span className="text-xl shrink-0" aria-hidden>
        {icono}
      </span>
      <p className="flex-1 text-sm font-medium">{toast.mensaje}</p>
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar"
        className="text-white/80 hover:text-white transition shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
