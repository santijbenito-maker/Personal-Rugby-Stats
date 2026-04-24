import type { ReactNode } from 'react';

type ChartCardProps = {
  titulo: string;
  subtitulo?: string;
  /** Badge opcional a la derecha (ej: "PR: 50 kg"). */
  badge?: ReactNode;
  children: ReactNode;
};

/**
 * Tarjeta blanca con borde sutil y título con línea amarilla a la izquierda.
 * Se usa para los gráficos del dashboard y para tarjetas tipo "Evolución".
 */
export function ChartCard({ titulo, subtitulo, badge, children }: ChartCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-1 inline-block w-1 h-5 bg-amarillo-acento rounded-full shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{titulo}</h3>
            {subtitulo && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitulo}</p>
            )}
          </div>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>
      {children}
    </div>
  );
}
