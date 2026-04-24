import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { MatchCard } from '../components/MatchCard';
import { IconoMas, IconoPartidos } from '../components/icons';

export function Partidos() {
  const partidos = useLiveQuery(
    () => db.partidos.orderBy('fecha').reverse().toArray(),
    [],
    [],
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Título + acción */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-block w-1 h-7 bg-amarillo-acento rounded-full" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Partidos</h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 ml-4">
            {partidos.length > 0
              ? `${partidos.length} partido${partidos.length === 1 ? '' : 's'} cargado${partidos.length === 1 ? '' : 's'}`
              : 'Cargá cada partido jugado'}
          </p>
        </div>
      </div>

      {/* Botón grande amarillo */}
      <Link
        to="/partidos/nuevo"
        className="flex items-center justify-center gap-2 w-full bg-amarillo-acento hover:brightness-95 text-azul-oscuro font-bold rounded-xl px-4 py-3.5 shadow-tarjeta transition"
      >
        <IconoMas size={22} strokeWidth={2.5} />
        Cargar nuevo partido
      </Link>

      {/* Lista o empty state */}
      {partidos.length === 0 ? (
        <EmptyStatePartidos />
      ) : (
        <div className="space-y-3">
          {partidos.map((p) => (
            <MatchCard key={p.id} partido={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyStatePartidos() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amarillo-claro dark:bg-amarillo-acento/10 text-azul-principal dark:text-amarillo-acento">
        <IconoPartidos size={28} />
      </div>
      <h2 className="mt-3 font-semibold">Todavía no cargaste partidos</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
        Empezá registrando tu primer partido. Vas a poder cargar el resultado, tus stats,
        cómo te sentiste y notas del entrenador.
      </p>
    </div>
  );
}
