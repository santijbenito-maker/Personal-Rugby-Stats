type Slider10Props = {
  label: string;
  /** Valor entero 1-10. */
  valor: number;
  onChange: (v: number) => void;
  /** Ícono/emoji a la izquierda del label. */
  hint?: string;
  /** Texto descriptivo debajo del label. */
  descripcion?: string;
  /** Etiqueta a la izquierda (valor bajo). */
  etiquetaMin?: string;
  /** Etiqueta a la derecha (valor alto). */
  etiquetaMax?: string;
  /** Si está seteado, calcula una etiqueta dinámica según el valor. */
  etiquetaDinamica?: (v: number) => string;
  /** Color del track lleno. Por default azul-principal. */
  colorBarra?: string;
};

/**
 * Slider 1-10 con etiqueta dinámica según el valor.
 * Usado para RPE, sensaciones, rol 9/10, rating general, etc.
 */
export function Slider10({
  label,
  valor,
  onChange,
  hint,
  descripcion,
  etiquetaMin,
  etiquetaMax,
  etiquetaDinamica,
  colorBarra = '#1B3A6B',
}: Slider10Props) {
  const pct = ((valor - 1) / 9) * 100;
  const dinamica = etiquetaDinamica ? etiquetaDinamica(valor) : undefined;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
      {/* Header: label + valor */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {hint && <span className="mr-1">{hint}</span>}
          {label}
        </p>
        <span className="text-lg font-bold text-azul-principal dark:text-amarillo-acento tabular-nums">
          {valor}
          <span className="text-sm font-medium text-slate-400">/10</span>
        </span>
      </div>

      {descripcion && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{descripcion}</p>
      )}

      {/* Slider con track coloreado hasta el valor */}
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 appearance-none rounded-full cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${colorBarra} 0%, ${colorBarra} ${pct}%, rgb(226,232,240) ${pct}%, rgb(226,232,240) 100%)`,
        }}
      />

      {/* Etiquetas extremas */}
      {(etiquetaMin || etiquetaMax) && (
        <div className="mt-1 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{etiquetaMin}</span>
          <span>{etiquetaMax}</span>
        </div>
      )}

      {/* Etiqueta dinámica opcional */}
      {dinamica && (
        <p className="mt-2 text-xs font-medium text-center text-azul-principal dark:text-amarillo-acento">
          {dinamica}
        </p>
      )}
    </div>
  );
}
