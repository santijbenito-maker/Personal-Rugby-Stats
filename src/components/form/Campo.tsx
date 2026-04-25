import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

// ───────────────────────────────────────────────────────────────
// Internos: helpers comunes
// ───────────────────────────────────────────────────────────────

const claseInput =
  'w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-azul-principal focus:outline-none focus:ring-2 focus:ring-azul-principal/20';

type EncabezadoProps = {
  label: string;
  hint?: string;
};

/** Cabecera reutilizable: hint opcional + label, con la tipografía estándar. */
function Etiqueta({ label, hint }: EncabezadoProps) {
  return (
    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 block mb-1.5">
      {hint && <span className="mr-1">{hint}</span>}
      {label}
    </span>
  );
}

function Pie({ ayuda, error }: { ayuda?: string; error?: string }) {
  if (error) return <p className="mt-1 text-xs text-rojo">{error}</p>;
  if (ayuda) return <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{ayuda}</p>;
  return null;
}

// ───────────────────────────────────────────────────────────────
// CampoTexto / CampoTextarea / CampoSelect
// Wrappean el input dentro del <label> para que Playwright y los lectores
// de pantalla los asocien automáticamente sin necesidad de id/htmlFor.
// ───────────────────────────────────────────────────────────────

type CampoTextoProps = EncabezadoProps & {
  ayuda?: string;
  error?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>;

export function CampoTexto({ label, hint, ayuda, error, ...rest }: CampoTextoProps) {
  return (
    <label className="block">
      <Etiqueta label={label} hint={hint} />
      <input {...rest} className={claseInput} />
      <Pie ayuda={ayuda} error={error} />
    </label>
  );
}

type CampoTextareaProps = EncabezadoProps & {
  ayuda?: string;
  error?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>;

export function CampoTextarea({
  label,
  hint,
  ayuda,
  error,
  rows = 3,
  ...rest
}: CampoTextareaProps) {
  return (
    <label className="block">
      <Etiqueta label={label} hint={hint} />
      <textarea {...rest} rows={rows} className={claseInput} />
      <Pie ayuda={ayuda} error={error} />
    </label>
  );
}

type CampoSelectProps = EncabezadoProps & {
  ayuda?: string;
  error?: string;
  opciones: readonly { valor: string; label: string }[];
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'>;

export function CampoSelect({
  label,
  hint,
  ayuda,
  error,
  opciones,
  ...rest
}: CampoSelectProps) {
  return (
    <label className="block">
      <Etiqueta label={label} hint={hint} />
      <select {...rest} className={claseInput}>
        {opciones.map((op) => (
          <option key={op.valor} value={op.valor}>
            {op.label}
          </option>
        ))}
      </select>
      <Pie ayuda={ayuda} error={error} />
    </label>
  );
}

// ───────────────────────────────────────────────────────────────
// CampoPersonalizado: para Segmented, Slider, WeatherPicker, etc.
// Usa <fieldset>/<legend> que es el patrón correcto para grupos de
// controles personalizados (no un input único).
// ───────────────────────────────────────────────────────────────

type CampoPersonalizadoProps = EncabezadoProps & {
  ayuda?: string;
  error?: string;
  children: ReactNode;
};

export function CampoPersonalizado({
  label,
  hint,
  ayuda,
  error,
  children,
}: CampoPersonalizadoProps) {
  return (
    <fieldset className="block border-0 p-0 m-0">
      <legend className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
        {hint && <span className="mr-1">{hint}</span>}
        {label}
      </legend>
      {children}
      <Pie ayuda={ayuda} error={error} />
    </fieldset>
  );
}
