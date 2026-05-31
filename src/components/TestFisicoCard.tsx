import { Link } from 'react-router-dom';
import type { TestFisico } from '../types';
import { formatoCorto, hace } from '../lib/fechas';
import { etiquetaKind, formatearValor } from '../lib/fisico';

type Props = {
  test: TestFisico;
};

/** Tarjeta de un test físico individual: kind + fecha + valor + badge PR. */
export function TestFisicoCard({ test: t }: Props) {
  return (
    <Link
      to={`/fisico/${t.id}`}
      className="block bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800 p-4 hover:border-azul-principal/30 active:scale-[0.99] transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatoCorto(t.fecha)} · {hace(t.fecha)}
          </p>
          <p className="mt-0.5 font-bold text-base leading-tight truncate">
            {etiquetaKind(t.kind)}
          </p>
          <p className="text-sm tabular-nums text-slate-700 dark:text-slate-300">
            {formatearValor(t)}
          </p>
        </div>
        {t.fueRecord && (
          <span className="text-[10px] font-bold uppercase bg-verde-record text-white px-2 py-0.5 rounded-full shrink-0">
            🏆 PR
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <Mini label="💪 Sensación" valor={`${t.sensacionFisico}/5`} />
        <Mini label="🔥 RPE" valor={`${t.rpe}/5`} />
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
