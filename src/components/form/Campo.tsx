import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

// ───────────────────────────────────────────────────────────────
// Campo = label + input/select/textarea estilizado.
// ───────────────────────────────────────────────────────────────

type CampoBaseProps = {
  label: string;
  hint?: string;
  /** Texto de ayuda debajo del campo. */
  ayuda?: string;
  /** Texto de error (rojo) debajo del campo. */
  error?: string;
  children: ReactNode;
};

function Campo({ label, hint, ayuda, error, children }: CampoBaseProps) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200 block mb-1.5">
        {hint && <span className="mr-1">{hint}</span>}
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-rojo">{error}</p>
      ) : ayuda ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{ayuda}</p>
      ) : null}
    </div>
  );
}

const claseInput =
  'w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-azul-principal focus:outline-none focus:ring-2 focus:ring-azul-principal/20';

// ───────────────────────────────────────────────────────────────
// CampoTexto
// ───────────────────────────────────────────────────────────────

type CampoTextoProps = Omit<CampoBaseProps, 'children'> &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>;

export function CampoTexto({ label, hint, ayuda, error, ...rest }: CampoTextoProps) {
  return (
    <Campo label={label} hint={hint} ayuda={ayuda} error={error}>
      <input {...rest} className={claseInput} />
    </Campo>
  );
}

// ───────────────────────────────────────────────────────────────
// CampoTextarea
// ───────────────────────────────────────────────────────────────

type CampoTextareaProps = Omit<CampoBaseProps, 'children'> &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>;

export function CampoTextarea({
  label,
  hint,
  ayuda,
  error,
  rows = 3,
  ...rest
}: CampoTextareaProps) {
  return (
    <Campo label={label} hint={hint} ayuda={ayuda} error={error}>
      <textarea {...rest} rows={rows} className={claseInput} />
    </Campo>
  );
}

// ───────────────────────────────────────────────────────────────
// CampoSelect
// ───────────────────────────────────────────────────────────────

type CampoSelectProps = Omit<CampoBaseProps, 'children'> &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> & {
    opciones: readonly { valor: string; label: string }[];
  };

export function CampoSelect({
  label,
  hint,
  ayuda,
  error,
  opciones,
  ...rest
}: CampoSelectProps) {
  return (
    <Campo label={label} hint={hint} ayuda={ayuda} error={error}>
      <select {...rest} className={claseInput}>
        {opciones.map((op) => (
          <option key={op.valor} value={op.valor}>
            {op.label}
          </option>
        ))}
      </select>
    </Campo>
  );
}

// ───────────────────────────────────────────────────────────────
// CampoPersonalizado — label + children (para segmented, sliders, etc.)
// ───────────────────────────────────────────────────────────────

export function CampoPersonalizado(props: CampoBaseProps) {
  return <Campo {...props} />;
}
