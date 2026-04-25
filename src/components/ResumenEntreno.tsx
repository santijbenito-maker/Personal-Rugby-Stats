import type { Entrenamiento } from '../types';
import { BadgeAsistencia } from './BadgeAsistencia';
import { formatoCorto } from '../lib/fechas';

type ResumenEntrenoProps = {
  entreno: Entrenamiento;
};

/**
 * Preview en vivo del entrenamiento que se está cargando.
 * Aparece al final del formulario y se actualiza con cada cambio.
 */
export function ResumenEntreno({ entreno: e }: ResumenEntrenoProps) {
  const promedioSensacion = ((e.sensacionFisico + e.sensacionTecnico) / 2).toFixed(1);
  const ejercicios = e.ejerciciosTrabajados.length;

  return (
    <section className="bg-gradient-to-br from-azul-principal to-azul-oscuro text-white rounded-xl p-5 shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <span className="inline-block w-1 h-5 bg-amarillo-acento rounded-full" />
        <h2 className="font-semibold">Resumen del entrenamiento</h2>
      </div>

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-amarillo-claro/80">
            {formatoCorto(e.fecha)} · {e.tipo}
          </p>
          <p className="mt-0.5 font-bold text-base leading-tight">
            {e.duracion} min
            {e.tipo === 'Partido práctica' && e.minutosReales !== undefined && (
              <span className="ml-2 text-sm font-medium opacity-80">
                · {e.minutosReales} min jugados
              </span>
            )}
          </p>
        </div>
        <BadgeAsistencia asistencia={e.asistencia} />
      </div>

      <ul className="text-sm space-y-1.5 border-t border-white/10 pt-3">
        {e.clima && (
          <Linea
            titulo="Clima"
            valor={`${e.clima}${e.temperatura !== undefined ? ` · ${e.temperatura}°C` : ''}`}
          />
        )}
        <Linea
          titulo="Ejercicios"
          valor={
            ejercicios > 0
              ? e.ejerciciosTrabajados.join(', ') + (e.otrosEjercicios ? ` · ${e.otrosEjercicios}` : '')
              : e.otrosEjercicios || '—'
          }
        />
        <Linea titulo="RPE" valor={`${e.rpe}/10 · ${etiquetaRPE(e.rpe)}`} />
        <Linea
          titulo="Sensación"
          valor={`💪 ${e.sensacionFisico}/10 · 🎯 ${e.sensacionTecnico}/10 · prom. ${promedioSensacion}/10`}
        />
        {e.notas && <Linea titulo="Notas" valor={e.notas} />}
      </ul>
    </section>
  );
}

export function etiquetaRPE(rpe: number): string {
  if (rpe <= 3) return 'Suave';
  if (rpe <= 6) return 'Moderado';
  if (rpe <= 8) return 'Exigente';
  return 'Al límite / Máximo';
}

function Linea({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <li className="flex gap-2 text-xs md:text-sm">
      <span className="font-semibold text-amarillo-acento min-w-[80px]">{titulo}:</span>
      <span className="text-white/90 flex-1 break-words">{valor}</span>
    </li>
  );
}
