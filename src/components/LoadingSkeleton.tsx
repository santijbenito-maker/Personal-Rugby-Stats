/**
 * Fallback genérico mientras se descarga el chunk de una página.
 * Muestra un esqueleto neutro con barras pulsantes (no bloquea visualmente
 * la transición). En la práctica, las páginas siguientes están en cache
 * después del primer load, así que esto sólo se ve la primera vez de cada
 * sección.
 */
export function LoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <span className="inline-block w-1 h-7 bg-amarillo-acento/40 rounded-full" />
        <div className="h-7 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4"
          >
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
            <div className="h-7 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
        <div className="h-5 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
}
