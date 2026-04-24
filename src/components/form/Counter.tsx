type CounterProps = {
  label: string;
  valor: number;
  onChange: (v: number) => void;
  /** Valor mínimo (default 0). */
  min?: number;
  /** Valor máximo (default 99). */
  max?: number;
  /** Paso del +/- (default 1). */
  paso?: number;
  /** Ícono o emoji opcional a la izquierda del label. */
  hint?: string;
};

/**
 * Control +/- con valor central grande.
 * Pensado para stats de partido (tries, tackles, etc.).
 */
export function Counter({ label, valor, onChange, min = 0, max = 99, paso = 1, hint }: CounterProps) {
  const puedeMenos = valor > min;
  const puedeMas = valor < max;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3">
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
        {hint && <span className="mr-1">{hint}</span>}
        {label}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => puedeMenos && onChange(valor - paso)}
          disabled={!puedeMenos}
          className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed font-bold text-lg leading-none"
          aria-label={`Restar ${label}`}
        >
          −
        </button>
        <span className="text-2xl font-bold min-w-[2ch] text-center tabular-nums">{valor}</span>
        <button
          type="button"
          onClick={() => puedeMas && onChange(valor + paso)}
          disabled={!puedeMas}
          className="w-9 h-9 rounded-full bg-azul-principal text-white hover:bg-azul-oscuro active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed font-bold text-lg leading-none"
          aria-label={`Sumar ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
