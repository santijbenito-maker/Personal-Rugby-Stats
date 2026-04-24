import type { ReactNode } from 'react';

type ColorBorde = 'azul' | 'amarillo' | 'verde' | 'rojo';

const colorClases: Record<ColorBorde, { borde: string; valor: string }> = {
  azul: {
    borde: 'border-l-azul-principal',
    valor: 'text-azul-principal dark:text-white',
  },
  amarillo: {
    borde: 'border-l-amarillo-acento',
    valor: 'text-slate-900 dark:text-white',
  },
  verde: {
    borde: 'border-l-verde-record',
    valor: 'text-verde-record',
  },
  rojo: {
    borde: 'border-l-rojo',
    valor: 'text-rojo',
  },
};

type MetricCardProps = {
  label: string;
  valor: ReactNode;
  color: ColorBorde;
  /** Diff positivo/negativo vs mes anterior. Se muestra si !== undefined. */
  delta?: number;
  /** Sufijo del valor (ej: "kg"). */
  sufijo?: string;
};

/**
 * Tarjeta de métrica: borde izquierdo de color + label chico + valor grande + delta.
 * Usada en el grid 2x2 del Dashboard.
 */
export function MetricCard({ label, valor, color, delta, sufijo }: MetricCardProps) {
  const { borde, valor: colorValor } = colorClases[color];

  return (
    <div
      className={[
        'bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800',
        'border-l-[3px]',
        borde,
        'p-4',
      ].join(' ')}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className={['mt-1 text-3xl font-bold leading-tight', colorValor].join(' ')}>
        {valor}
        {sufijo && <span className="text-lg font-semibold ml-1 opacity-80">{sufijo}</span>}
      </p>
      {delta !== undefined && <DeltaBadge delta={delta} />}
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) {
    return <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">igual que el mes anterior</p>;
  }
  const positivo = delta > 0;
  const signo = positivo ? '+' : '';
  const color = positivo ? 'text-verde-record' : 'text-rojo';
  return (
    <p className={['mt-1 text-xs font-medium', color].join(' ')}>
      {signo}
      {delta} vs mes anterior
    </p>
  );
}
