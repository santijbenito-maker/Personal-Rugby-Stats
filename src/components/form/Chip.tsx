type ChipProps = {
  label: string;
  activo: boolean;
  onToggle: () => void;
  /** Ícono/emoji a la izquierda. */
  hint?: string;
};

/**
 * Chip toggleable (se usa para "Ejercicios trabajados" y filtros).
 * Estado visual: claro + borde cuando no está activo, azul lleno cuando sí.
 */
export function Chip({ label, activo, onToggle, hint }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={activo}
      className={[
        'px-3 py-1.5 rounded-full text-sm font-medium border transition',
        'inline-flex items-center gap-1.5',
        activo
          ? 'bg-azul-principal text-white border-azul-principal shadow-sm'
          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-azul-principal/50',
      ].join(' ')}
    >
      {hint && <span>{hint}</span>}
      {label}
    </button>
  );
}
