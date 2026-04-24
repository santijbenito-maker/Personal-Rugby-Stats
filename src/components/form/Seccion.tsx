import type { ReactNode } from 'react';

type SeccionProps = {
  titulo: string;
  /** Descripción opcional bajo el título. */
  descripcion?: string;
  children: ReactNode;
};

/**
 * Bloque de sección de un formulario largo: título + contenido.
 * Tarjeta blanca con margen generoso y el título resaltado.
 */
export function Seccion({ titulo, descripcion, children }: SeccionProps) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800 p-4 md:p-5">
      <header className="mb-4 flex items-start gap-3">
        <span className="mt-1 inline-block w-1 h-5 bg-amarillo-acento rounded-full shrink-0" />
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">{titulo}</h2>
          {descripcion && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{descripcion}</p>
          )}
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
