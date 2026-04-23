import { Link } from 'react-router-dom';

/** Página 404 — se muestra cuando la ruta no coincide con ninguna. */
export function NoEncontrado() {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <p className="text-6xl font-serif font-bold text-amarillo-acento">404</p>
      <h1 className="mt-4 text-xl font-bold">Página no encontrada</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        La dirección que pusiste no existe en la app.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 bg-azul-principal hover:bg-azul-oscuro text-white font-semibold px-4 py-2 rounded-lg transition"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
