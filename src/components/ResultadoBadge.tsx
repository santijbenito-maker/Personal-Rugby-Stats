import type { Partido, ResultadoTipo } from '../types';

export function tipoResultado(p: { puntosPropios: number; puntosRival: number }): ResultadoTipo {
  if (p.puntosPropios > p.puntosRival) return 'ganamos';
  if (p.puntosPropios < p.puntosRival) return 'perdimos';
  return 'empate';
}

const mapa: Record<ResultadoTipo, { label: string; clase: string }> = {
  ganamos: { label: 'Ganamos', clase: 'bg-azul-principal text-white' },
  perdimos: { label: 'Perdimos', clase: 'bg-rojo text-white' },
  empate: { label: 'Empate', clase: 'bg-slate-400 text-white' },
};

type ResultadoBadgeProps = {
  partido: Pick<Partido, 'puntosPropios' | 'puntosRival'>;
  tamaño?: 'chico' | 'normal';
};

/** Badge de color según el resultado del partido. */
export function ResultadoBadge({ partido, tamaño = 'normal' }: ResultadoBadgeProps) {
  const { label, clase } = mapa[tipoResultado(partido)];
  const tam =
    tamaño === 'chico'
      ? 'text-[10px] px-2 py-0.5'
      : 'text-xs px-2.5 py-1';
  return (
    <span className={[tam, 'font-bold rounded-full uppercase tracking-wide', clase].join(' ')}>
      {label}
    </span>
  );
}
