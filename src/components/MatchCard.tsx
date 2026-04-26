import { Link } from 'react-router-dom';
import type { Partido } from '../types';
import { ResultadoBadge, tipoResultado } from './ResultadoBadge';
import { formatoCorto, hace } from '../lib/fechas';
import { formatearPosiciones } from '../lib/calculos';

type MatchCardProps = {
  partido: Partido;
};

/**
 * Tarjeta de partido en la lista: resultado grande, rival, meta,
 * grid de stats principales (minutos/tries/tackles/kicks/pase/rating) y badge.
 */
export function MatchCard({ partido: p }: MatchCardProps) {
  const tipo = tipoResultado(p);
  const colorScore =
    tipo === 'ganamos'
      ? 'text-azul-principal dark:text-amarillo-acento'
      : tipo === 'perdimos'
        ? 'text-rojo'
        : 'text-slate-500';

  const pctPase = p.pasesIntentados > 0 ? Math.round((p.pasesCompletados / p.pasesIntentados) * 100) : null;

  return (
    <Link
      to={`/partidos/${p.id}`}
      className="block bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800 p-4 hover:border-azul-principal/30 active:scale-[0.99] transition"
    >
      {/* Fila superior: rival + resultado + badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatoCorto(p.fecha)} · {hace(p.fecha)} · {p.torneo}
            {p.condicion === 'Visitante' ? ' · Visitante' : ''}
          </p>
          <p className="mt-1 font-bold text-lg leading-tight">
            vs {p.rival} <span className={['font-bold', colorScore].join(' ')}>· {p.puntosPropios}-{p.puntosRival}</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {formatearPosiciones(p.posiciones)} · {p.minutos} min
            {p.capitan && ' · Capitán'}
          </p>
        </div>
        <ResultadoBadge partido={p} />
      </div>

      {/* Grid de stats */}
      <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <StatMini label="Tries" valor={p.tries} color="amarillo" />
        <StatMini label="Tackles" valor={p.tacklesEfectivos} color="azul" />
        <StatMini label="Rating" valor={`${p.rating}/10`} color="verde" />
        <StatMini
          label="Kicks palo"
          valor={p.kicksPaloIntentados > 0 ? `${p.kicksPaloConvertidos}/${p.kicksPaloIntentados}` : '—'}
          color="azul"
        />
        <StatMini
          label="Pases"
          valor={pctPase !== null ? `${pctPase}%` : '—'}
          color="amarillo"
        />
        <StatMini label="Minutos" valor={p.minutos} color="azul" />
      </div>
    </Link>
  );
}

function StatMini({
  label,
  valor,
  color,
}: {
  label: string;
  valor: string | number;
  color: 'azul' | 'amarillo' | 'verde';
}) {
  const colorClase = {
    azul: 'text-azul-principal dark:text-white',
    amarillo: 'text-slate-900 dark:text-white',
    verde: 'text-verde-record',
  }[color];
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={['text-sm font-bold tabular-nums', colorClase].join(' ')}>{valor}</p>
    </div>
  );
}
