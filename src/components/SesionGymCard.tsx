import { Link } from 'react-router-dom';
import type { GymSesion, GymEjercicio } from '../types';
import { formatoCorto, hace } from '../lib/fechas';
import { mejorSetDeEjercicio, totalSeries } from '../lib/gym';

type Props = {
  sesion: GymSesion;
  ejercicios: GymEjercicio[];
};

const colorPorFoco: Record<string, string> = {
  'Tren inferior': 'bg-azul-principal text-white',
  'Tren superior': 'bg-amarillo-acento text-azul-oscuro',
  'Full body': 'bg-verde-record text-white',
  Core: 'bg-rojo text-white',
};

/**
 * Tarjeta de sesión de gym en la lista del historial.
 * Muestra fecha, foco, duración, sensación y los ejercicios con su mejor set.
 */
export function SesionGymCard({ sesion: s, ejercicios }: Props) {
  const mapa = new Map(ejercicios.map((e) => [e.id, e]));
  const series = totalSeries(s);

  return (
    <Link
      to={`/gym/${s.id}`}
      className="block bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800 p-4 hover:border-azul-principal/30 active:scale-[0.99] transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatoCorto(s.fecha)} · {hace(s.fecha)}
          </p>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <span
              className={[
                'inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide',
                colorPorFoco[s.foco] ?? 'bg-slate-200 text-slate-700',
              ].join(' ')}
            >
              {s.foco}
            </span>
            <span className="text-sm font-bold">{s.duracion} min</span>
            <span className="text-xs text-slate-500">· {series} series</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Sensación</p>
          <p className="text-sm font-bold tabular-nums">
            {s.sensacion}
            <span className="text-[11px] font-medium text-slate-400">/10</span>
          </p>
        </div>
      </div>

      {/* Ejercicios */}
      {s.ejercicios.length > 0 && (
        <ul className="mt-3 space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800">
          {s.ejercicios.map((ej, i) => {
            const def = mapa.get(ej.ejercicioId);
            const top = mejorSetDeEjercicio(ej);
            return (
              <li key={i} className="text-sm flex items-center justify-between gap-2">
                <span className="min-w-0 truncate">
                  {def?.nombre ?? 'Ejercicio'}
                  {ej.fueRecord && (
                    <span className="ml-2 text-[10px] font-bold uppercase bg-verde-record text-white px-1.5 py-0.5 rounded">
                      PR
                    </span>
                  )}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300 tabular-nums shrink-0">
                  {top && top.peso > 0
                    ? `${top.peso} kg × ${top.reps}`
                    : `${ej.series.length}× sin peso`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Link>
  );
}
