type FraccionProps = {
  label: string;
  /** Ícono/emoji a la izquierda del label. */
  hint?: string;
  /** Etiquetas de cada número (ej: "convertidos" / "intentados"). */
  etiquetaNumerador?: string;
  etiquetaDenominador?: string;
  numerador: number;
  denominador: number;
  onChangeNumerador: (v: number) => void;
  onChangeDenominador: (v: number) => void;
  /** Máximo permitido (default 99). */
  max?: number;
};

/**
 * Par de inputs numéricos separados por "/" (ej: kicks 3/4).
 * Calcula y muestra el porcentaje automáticamente.
 */
export function Fraccion({
  label,
  hint,
  etiquetaNumerador = 'completados',
  etiquetaDenominador = 'intentados',
  numerador,
  denominador,
  onChangeNumerador,
  onChangeDenominador,
  max = 99,
}: FraccionProps) {
  const pct = denominador > 0 ? Math.round((numerador / denominador) * 100) : null;
  const numeradorClampeado = Math.min(numerador, denominador);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3">
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
        {hint && <span className="mr-1">{hint}</span>}
        {label}
      </p>
      <div className="flex items-center gap-2">
        <InputNumero
          value={numeradorClampeado}
          onChange={(v) => onChangeNumerador(Math.min(v, denominador || max))}
          placeholder={etiquetaNumerador}
          max={max}
        />
        <span className="text-xl font-bold text-slate-400">/</span>
        <InputNumero
          value={denominador}
          onChange={(v) => {
            onChangeDenominador(v);
            if (numerador > v) onChangeNumerador(v);
          }}
          placeholder={etiquetaDenominador}
          max={max}
        />
        {pct !== null && (
          <span className="ml-2 text-sm font-bold text-azul-principal dark:text-amarillo-acento tabular-nums">
            {pct}%
          </span>
        )}
      </div>
      <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
        {etiquetaNumerador} / {etiquetaDenominador}
      </p>
    </div>
  );
}

function InputNumero({
  value,
  onChange,
  placeholder,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder: string;
  max: number;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={max}
      value={value}
      onChange={(e) => {
        const n = Math.max(0, Math.min(Number(e.target.value) || 0, max));
        onChange(n);
      }}
      placeholder={placeholder}
      className="flex-1 min-w-0 px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center text-lg font-bold focus:border-azul-principal focus:outline-none focus:ring-2 focus:ring-azul-principal/20"
    />
  );
}
