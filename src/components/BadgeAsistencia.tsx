import type { Asistencia } from '../types';

const mapa: Record<Asistencia, { icono: string; clase: string }> = {
  Presente: { icono: '✓', clase: 'bg-verde-record text-white' },
  'Llegué tarde': { icono: '⏱', clase: 'bg-amarillo-acento text-azul-oscuro' },
  Ausente: { icono: '✗', clase: 'bg-rojo text-white' },
};

type BadgeAsistenciaProps = {
  asistencia: Asistencia;
  tamaño?: 'chico' | 'normal';
};

export function BadgeAsistencia({ asistencia, tamaño = 'normal' }: BadgeAsistenciaProps) {
  const { icono, clase } = mapa[asistencia];
  const tam = tamaño === 'chico' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span
      className={[tam, 'inline-flex items-center gap-1 font-bold rounded-full uppercase tracking-wide', clase].join(
        ' ',
      )}
    >
      <span aria-hidden>{icono}</span>
      {asistencia}
    </span>
  );
}
