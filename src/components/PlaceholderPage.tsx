import type { ReactNode } from 'react';

type PlaceholderPageProps = {
  titulo: string;
  subtitulo?: string;
  icono: ReactNode;
  /** Descripción corta de qué va a tener la sección. */
  descripcion: string;
  /** En qué hito se construye la sección. */
  hito: string;
};

/**
 * Página placeholder para secciones que todavía no se construyeron.
 * Muestra ícono + título + descripción + etiqueta "próximo en Hito X".
 * Se reemplaza por la página real en los próximos hitos.
 */
export function PlaceholderPage({ titulo, subtitulo, icono, descripcion, hito }: PlaceholderPageProps) {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Título de la sección con línea amarilla decorativa a la izquierda */}
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-block w-1 h-7 bg-amarillo-acento rounded-full" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{titulo}</h1>
      </div>
      {subtitulo && <p className="text-sm text-slate-600 dark:text-slate-400 ml-4">{subtitulo}</p>}

      {/* Tarjeta central con ícono grande y descripción */}
      <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-tarjeta p-8 md:p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amarillo-claro dark:bg-amarillo-acento/10 text-azul-principal dark:text-amarillo-acento mb-4">
          {icono}
        </div>

        <h2 className="text-lg md:text-xl font-semibold mb-2">Sección en construcción</h2>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          {descripcion}
        </p>

        <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 bg-verde-claro text-verde-record text-xs font-semibold rounded-full border border-verde-record/20">
          <span className="w-1.5 h-1.5 rounded-full bg-verde-record animate-pulse" />
          Próximo en {hito}
        </div>
      </div>
    </div>
  );
}
