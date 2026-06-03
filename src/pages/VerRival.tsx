import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { partidosContraRival, statsContraRival } from '../lib/scouting';
import { MatchCard } from '../components/MatchCard';
import { IconoFlechaIzq } from '../components/icons';

export function VerRival() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const rival = useLiveQuery(() => (id ? db.rivales.get(id) : undefined), [id]);
  const partidos = useLiveQuery(() => db.partidos.toArray(), [], []);

  if (rival === undefined) {
    return (
      <div className="max-w-md mx-auto text-center py-12 text-slate-500 dark:text-slate-400">
        Cargando…
      </div>
    );
  }
  if (!rival) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-xl font-bold">Rival no encontrado</p>
        <Link
          to="/rivales"
          className="mt-6 inline-flex bg-azul-principal hover:bg-azul-oscuro text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Volver
        </Link>
      </div>
    );
  }

  const handleBorrar = async () => {
    if (!confirm(`¿Borrar la ficha de ${rival.nombre}? Los partidos contra ellos NO se borran.`)) return;
    await db.rivales.delete(rival.id);
    navigate('/rivales');
  };

  const stats = statsContraRival(partidos, rival);
  const vsList = partidosContraRival(partidos, rival).sort((a, b) =>
    b.fecha.localeCompare(a.fecha),
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">
      <div className="flex items-center gap-3">
        <Link
          to="/rivales"
          aria-label="Volver"
          className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
        >
          <IconoFlechaIzq size={22} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
            {rival.nombre}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {rival.categoria ?? 'Sin categoría'}
          </p>
        </div>
      </div>

      {/* Notas próximo partido — banner prominente */}
      {rival.notasProximoPartido && (
        <div className="bg-amarillo-claro dark:bg-amarillo-acento/10 border border-amarillo-acento/40 rounded-xl p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-azul-principal dark:text-amarillo-acento">
            📌 Para el próximo partido
          </p>
          <p className="mt-1 text-sm text-slate-800 dark:text-slate-100 whitespace-pre-line">
            {rival.notasProximoPartido}
          </p>
        </div>
      )}

      {/* Récord */}
      {stats.total > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Historial vs {rival.nombre}
          </p>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <Stat label="Ganados" valor={stats.ganados} color="text-verde-record" />
            <Stat label="Perdidos" valor={stats.perdidos} color="text-rojo" />
            <Stat label="Empates" valor={stats.empates} color="text-slate-500" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Stat label="Puntos prom." valor={stats.promedioPropios} sufijo=" prop" color="text-azul-principal dark:text-amarillo-acento" />
            <Stat label="Puntos prom." valor={stats.promedioRival} sufijo=" rival" color="text-slate-700 dark:text-slate-200" />
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Todavía no cargaste ningún partido contra <strong>{rival.nombre}</strong>. Cuando lo
            hagas, el récord va a aparecer acá automáticamente.
          </p>
        </div>
      )}

      {/* Tags */}
      {rival.tags.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Estilo de juego
          </p>
          <div className="flex flex-wrap gap-1.5">
            {rival.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notas generales */}
      {rival.notasGenerales && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            📝 Cómo juegan
          </p>
          <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line">
            {rival.notasGenerales}
          </p>
        </div>
      )}

      {/* Jugadores a marcar */}
      {rival.jugadores.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            🎯 Jugadores a marcar
          </p>
          <ul className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
            {rival.jugadores.map((j, i) => (
              <li key={j.id} className={i > 0 ? 'pt-3' : ''}>
                <div className="flex items-center gap-2">
                  {j.numero !== undefined && (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-azul-principal text-white text-xs font-bold tabular-nums">
                      {j.numero}
                    </span>
                  )}
                  <p className="font-semibold text-sm">
                    {j.nombre || <em className="text-slate-400">(sin nombre)</em>}
                  </p>
                  {j.posicion && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      · {j.posicion}
                    </span>
                  )}
                </div>
                {j.notas && (
                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line">
                    {j.notas}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lista de partidos vs */}
      {vsList.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 mt-2">
            Partidos contra ellos
          </p>
          <div className="space-y-3">
            {vsList.map((p) => (
              <MatchCard key={p.id} partido={p} />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          to={`/rivales/${rival.id}/editar`}
          className="flex-1 text-center px-4 py-2.5 rounded-lg bg-azul-principal hover:bg-azul-oscuro text-white font-semibold transition"
        >
          Editar
        </Link>
        <button
          type="button"
          onClick={handleBorrar}
          className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-rojo/5 border border-rojo text-rojo font-semibold transition"
        >
          Borrar
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  valor,
  sufijo,
  color,
}: {
  label: string;
  valor: number | string;
  sufijo?: string;
  color?: string;
}) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className={['text-2xl font-bold tabular-nums', color].filter(Boolean).join(' ')}>
        {valor}
        {sufijo && <span className="text-xs font-medium opacity-70">{sufijo}</span>}
      </p>
    </div>
  );
}
