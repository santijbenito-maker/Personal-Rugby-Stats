import { Link } from 'react-router-dom';
import type { Lesion, Gravedad } from '../types';
import { formatoCorto, hace } from '../lib/fechas';
import { diasPerdidos, esActiva } from '../lib/fisico';

type Props = {
  lesion: Lesion;
};

const colorGravedad: Record<Gravedad, string> = {
  Leve: 'bg-amarillo-claro text-amarillo-acento dark:bg-amarillo-acento/10 border border-amarillo-acento/40',
  Moderada: 'bg-amarillo-acento text-azul-oscuro',
  Grave: 'bg-rojo text-white',
};

/** Tarjeta de lesión con zona grande + meta + estado. */
export function LesionCard({ lesion: l }: Props) {
  const activa = esActiva(l);
  const dias = diasPerdidos(l);

  return (
    <Link
      to={`/lesiones/${l.id}`}
      className="block bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800 p-4 hover:border-azul-principal/30 active:scale-[0.99] transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-lg leading-tight truncate">
            {l.zona}
            {l.lado !== 'No aplica' && (
              <span className="ml-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                · {l.lado}
              </span>
            )}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {formatoCorto(l.fecha)} · {hace(l.fecha)} ·{' '}
            {l.tipo === 'Otro' && l.tipoOtro ? l.tipoOtro : l.tipo}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={[
              'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide',
              colorGravedad[l.gravedad],
            ].join(' ')}
          >
            {l.gravedad}
          </span>
          {activa ? (
            <span className="text-[10px] font-bold uppercase tracking-wide bg-rojo text-white px-2 py-0.5 rounded-full">
              Activa
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wide bg-verde-record text-white px-2 py-0.5 rounded-full">
              Recuperado
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <Mini label="Días perdidos" valor={`${dias}`} />
        <Mini label="Días estimados" valor={`${l.diasEstimados}`} />
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
