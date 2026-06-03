import { Link } from 'react-router-dom';
import type { Rival, Partido } from '../types';
import { statsContraRival } from '../lib/scouting';

type Props = {
  rival: Rival;
  partidos: Partido[];
};

/**
 * Tarjeta de rival en la lista: nombre + categoría + tags + récord vs
 * (W-L-E) calculado desde los partidos cargados.
 */
export function RivalCard({ rival: r, partidos }: Props) {
  const stats = statsContraRival(partidos, r);
  const tagsVisibles = r.tags.slice(0, 4);
  const tagsExtras = Math.max(0, r.tags.length - 4);

  return (
    <Link
      to={`/rivales/${r.id}`}
      className="block bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800 p-4 hover:border-azul-principal/30 active:scale-[0.99] transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-base leading-tight truncate">{r.nombre}</p>
          {r.categoria && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {r.categoria}
            </p>
          )}
        </div>
        {stats.total > 0 && (
          <div className="text-right shrink-0">
            <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Récord
            </p>
            <p className="text-sm font-bold tabular-nums">
              <span className="text-verde-record">{stats.ganados}</span>
              <span className="text-slate-400 mx-0.5">·</span>
              <span className="text-rojo">{stats.perdidos}</span>
              <span className="text-slate-400 mx-0.5">·</span>
              <span className="text-slate-500">{stats.empates}</span>
            </p>
          </div>
        )}
      </div>

      {tagsVisibles.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tagsVisibles.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full"
            >
              {tag}
            </span>
          ))}
          {tagsExtras > 0 && (
            <span className="text-[10px] px-2 py-0.5 text-slate-500">
              +{tagsExtras} más
            </span>
          )}
        </div>
      )}

      {r.notasProximoPartido && (
        <div className="mt-2 bg-amarillo-claro dark:bg-amarillo-acento/10 border border-amarillo-acento/30 rounded px-2 py-1 text-xs text-slate-700 dark:text-slate-200">
          <strong className="text-azul-principal dark:text-amarillo-acento">📌 Próximo:</strong>{' '}
          <span className="line-clamp-1">{r.notasProximoPartido}</span>
        </div>
      )}
    </Link>
  );
}
