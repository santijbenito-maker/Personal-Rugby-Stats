import type { GymSesion, GymEjercicio } from '../types';
import { formatoCorto } from '../lib/fechas';
import { mejorSetDeEjercicio, totalSeries, volumenSesion } from '../lib/gym';

type Props = {
  sesion: GymSesion;
  ejercicios: GymEjercicio[];
  /** Mapa ejercicioId -> mejor peso histórico previo (para mostrar PR badge en vivo). */
  mejoresPrevios?: Map<string, number>;
};

/**
 * Preview en vivo de la sesión de gym que se está cargando.
 * Muestra: foco, fecha, duración, sensación, totales (ejercicios, series,
 * volumen) y por cada ejercicio "Nombre: N series · top P × R [🏆 PR]".
 */
export function ResumenSesionGym({ sesion, ejercicios, mejoresPrevios }: Props) {
  const mapa = new Map(ejercicios.map((e) => [e.id, e]));
  const total = totalSeries(sesion);
  const volumen = volumenSesion(sesion);

  return (
    <section className="bg-gradient-to-br from-azul-principal to-azul-oscuro text-white rounded-xl p-5 shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <span className="inline-block w-1 h-5 bg-amarillo-acento rounded-full" />
        <h2 className="font-semibold">Resumen de la sesión</h2>
      </div>

      {/* Header: foco + fecha + sensación */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-amarillo-claro/80">
            {sesion.foco} · {formatoCorto(sesion.fecha)}
          </p>
          <p className="mt-0.5 font-bold text-base leading-tight">
            {sesion.duracion} min
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-amarillo-claro/80">Sensación</p>
          <p className="text-lg font-bold tabular-nums">
            {sesion.sensacion}
            <span className="text-xs font-medium opacity-70">/10</span>
          </p>
        </div>
      </div>

      {/* Totales */}
      <div className="grid grid-cols-3 gap-2 border-y border-white/10 py-3 mb-3">
        <Total label="Ejercicios" valor={sesion.ejercicios.length} />
        <Total label="Series" valor={total} />
        <Total label="Volumen" valor={`${volumen.toFixed(0)} kg`} />
      </div>

      {/* Por cada ejercicio */}
      {sesion.ejercicios.length === 0 ? (
        <p className="text-sm text-amarillo-claro/80 italic">Agregá un ejercicio para ver el resumen.</p>
      ) : (
        <ul className="space-y-1.5">
          {sesion.ejercicios.map((ej, i) => {
            const def = mapa.get(ej.ejercicioId);
            const top = mejorSetDeEjercicio(ej);
            const previo = mejoresPrevios?.get(ej.ejercicioId) ?? 0;
            const esPR = top !== null && top.peso > 0 && top.peso > previo;
            return (
              <li key={i} className="text-xs md:text-sm flex flex-wrap items-baseline gap-1.5">
                <span className="font-semibold text-amarillo-acento">{def?.nombre ?? 'Ejercicio'}:</span>
                <span className="text-white/90">
                  {ej.series.length} serie{ej.series.length === 1 ? '' : 's'}
                  {top && top.peso > 0 && (
                    <>
                      {' '}· top {top.peso} kg × {top.reps}
                    </>
                  )}
                </span>
                {esPR && (
                  <span className="text-[10px] font-bold uppercase bg-verde-record text-white px-1.5 py-0.5 rounded">
                    🏆 PR
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {sesion.notas && (
        <p className="mt-3 pt-3 border-t border-white/10 text-xs md:text-sm text-white/80 italic">
          "{sesion.notas}"
        </p>
      )}
    </section>
  );
}

function Total({ label, valor }: { label: string; valor: string | number }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wide text-amarillo-claro/70">{label}</p>
      <p className="text-base font-bold tabular-nums">{valor}</p>
    </div>
  );
}
