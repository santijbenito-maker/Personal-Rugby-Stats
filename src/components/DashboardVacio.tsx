import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Crest } from './Crest';
import { cargarDatosDeEjemplo } from '../db/seed';

/**
 * Empty state del Dashboard: aparece cuando no hay ningún dato cargado.
 * Ofrece dos caminos: empezar a cargar partidos reales, o ver la app con
 * datos de ejemplo (útil para explorar sin comprometer datos reales).
 */
export function DashboardVacio() {
  const [cargando, setCargando] = useState(false);

  const handleCargarEjemplo = async () => {
    setCargando(true);
    try {
      await cargarDatosDeEjemplo();
      // La vista se actualiza sola por useLiveQuery.
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto text-center py-6">
      <div className="inline-flex items-center justify-center">
        <Crest size={96} />
      </div>

      <h1 className="mt-6 text-2xl md:text-3xl font-serif font-bold tracking-tight">
        ¡Bienvenido, Santi!
      </h1>
      <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-400">
        Todavía no cargaste datos. Arrancá registrando un partido o un entrenamiento
        y vas a ver cómo se llena el dashboard.
      </p>

      {/* Accesos rápidos */}
      <div className="mt-6 grid grid-cols-2 gap-3 max-w-md mx-auto">
        <Link
          to="/partidos"
          className="bg-azul-principal hover:bg-azul-oscuro text-white font-semibold rounded-lg px-4 py-3 text-sm transition"
        >
          Cargar partido
        </Link>
        <Link
          to="/entrenos"
          className="bg-amarillo-acento hover:brightness-95 text-azul-oscuro font-semibold rounded-lg px-4 py-3 text-sm transition"
        >
          Cargar entreno
        </Link>
      </div>

      {/* Separador */}
      <div className="my-8 flex items-center gap-3 max-w-sm mx-auto">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        <span className="text-xs text-slate-500">o</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Datos de ejemplo */}
      <div className="bg-amarillo-claro dark:bg-amarillo-acento/10 rounded-xl p-4 max-w-md mx-auto border border-amarillo-acento/30">
        <p className="text-sm text-slate-700 dark:text-slate-200">
          ¿Querés ver la app con datos de ejemplo?
        </p>
        <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">
          Carga 4 partidos, 6 entrenamientos y 9 sesiones de gym de mentira. Después lo podés borrar desde{' '}
          <Link to="/perfil" className="underline font-medium">
            Perfil
          </Link>
          .
        </p>
        <button
          onClick={handleCargarEjemplo}
          disabled={cargando}
          className="mt-3 w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-amarillo-acento text-azul-principal dark:text-amarillo-acento font-semibold rounded-lg px-4 py-2 text-sm transition disabled:opacity-50"
        >
          {cargando ? 'Cargando…' : 'Cargar datos de ejemplo'}
        </button>
      </div>
    </div>
  );
}
