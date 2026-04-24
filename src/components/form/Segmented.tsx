import type { ReactNode } from 'react';

export type OpcionSegmented<T extends string | boolean> = {
  valor: T;
  label: string;
  icono?: ReactNode;
};

type SegmentedProps<T extends string | boolean> = {
  opciones: OpcionSegmented<T>[];
  valor: T;
  onChange: (v: T) => void;
  /** Cuántas columnas por fila (por default, mismo número que opciones). */
  columnas?: number;
};

/**
 * Control "segmented" (como un toggle con N opciones).
 * Usado para Local/Visitante, Titular/Suplente, Sí/No, posición, etc.
 */
export function Segmented<T extends string | boolean>({
  opciones,
  valor,
  onChange,
  columnas,
}: SegmentedProps<T>) {
  const cols = columnas ?? opciones.length;
  return (
    <div
      className="grid gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      role="tablist"
    >
      {opciones.map((op) => {
        const activo = op.valor === valor;
        return (
          <button
            key={String(op.valor)}
            type="button"
            role="tab"
            aria-selected={activo}
            onClick={() => onChange(op.valor)}
            className={[
              'px-3 py-2 rounded-md text-sm font-medium transition-colors text-center',
              'flex items-center justify-center gap-1.5',
              activo
                ? 'bg-white dark:bg-slate-950 shadow text-azul-principal dark:text-amarillo-acento'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900',
            ].join(' ')}
          >
            {op.icono}
            <span>{op.label}</span>
          </button>
        );
      })}
    </div>
  );
}
