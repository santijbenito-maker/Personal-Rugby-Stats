import { Link } from 'react-router-dom';
import type { Entrenamiento } from '../types';
import { BadgeAsistencia } from './BadgeAsistencia';
import { formatoCorto, hace } from '../lib/fechas';

type EntrenoCardProps = {
  entreno: Entrenamiento;
};

const colorPorTipo: Record<string, string> = {
  Técnico: 'bg-azul-principal text-white',
  Físico: 'bg-amarillo-acento text-azul-oscuro',
  Táctico: 'bg-verde-record text-white',
  'Partido práctica': 'bg-rojo text-white',
};

/**
 * Tarjeta de entrenamiento en la lista: fecha + tipos + duración + RPE +
 * sensaciones, con badge de asistencia y chips de ejercicios trabajados.
 */
export function EntrenoCard({ entreno: e }: EntrenoCardProps) {
  // Compat con datos viejos que todavía no migraron al array.
  const tipos = e.tipos && e.tipos.length > 0 ? e.tipos : ['Técnico'];
  const incluyePartidoPractica = tipos.includes('Partido práctica');
  return (
    <Link
      to={`/entrenos/${e.id}`}
      className="block bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800 p-4 hover:border-azul-principal/30 active:scale-[0.99] transition"
    >
      {/* Cabecera: fecha + tipos + asistencia */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatoCorto(e.fecha)} · {hace(e.fecha)}
          </p>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            {tipos.map((tipo) => (
              <span
                key={tipo}
                className={[
                  'inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide',
                  colorPorTipo[tipo] ?? 'bg-slate-200 text-slate-700',
                ].join(' ')}
              >
                {tipo}
              </span>
            ))}
            <span className="text-sm font-bold">{e.duracion} min</span>
            {incluyePartidoPractica && e.minutosReales !== undefined && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ({e.minutosReales} min jugados)
              </span>
            )}
          </div>
        </div>
        <BadgeAsistencia asistencia={e.asistencia} tamaño="chico" />
      </div>

      {/* Ejercicios trabajados */}
      {e.ejerciciosTrabajados.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {e.ejerciciosTrabajados.slice(0, 5).map((ex) => (
            <span
              key={ex}
              className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full"
            >
              {ex}
            </span>
          ))}
          {e.ejerciciosTrabajados.length > 5 && (
            <span className="text-[11px] px-2 py-0.5 text-slate-500">
              +{e.ejerciciosTrabajados.length - 5} más
            </span>
          )}
        </div>
      )}

      {/* Stats inferiores */}
      <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <Mini label="RPE" valor={`${e.rpe}/5`} />
        <Mini label="💪 Físico" valor={`${e.sensacionFisico}/5`} />
        <Mini label="🎯 Técnico" valor={`${e.sensacionTecnico}/5`} />
      </div>
    </Link>
  );
}

function Mini({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="text-sm font-bold tabular-nums">{valor}</p>
    </div>
  );
}
