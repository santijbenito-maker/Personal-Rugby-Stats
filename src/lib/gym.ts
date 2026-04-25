import type { GymSesion, GymEjercicio, EjercicioDeSesion, Serie } from '../types';
import { mejorPesoHistorico } from './calculos';
import { hace } from './fechas';

// ───────────────────────────────────────────────────────────────
// Volumen y series
// ───────────────────────────────────────────────────────────────

/**
 * Volumen de una sesión: suma de peso × reps por cada serie de cada ejercicio.
 * Si la serie tiene peso 0 (ej: dominadas, plancha) cuenta peso=0.
 */
export function volumenSesion(sesion: GymSesion): number {
  return sesion.ejercicios.reduce(
    (s, ej) => s + ej.series.reduce((ss, serie) => ss + serie.peso * serie.reps, 0),
    0,
  );
}

/** Volumen total acumulado de una lista de sesiones. */
export function volumenTotal(sesiones: GymSesion[]): number {
  return sesiones.reduce((s, ses) => s + volumenSesion(ses), 0);
}

/** Cantidad total de series cargadas en una sesión. */
export function totalSeries(sesion: GymSesion): number {
  return sesion.ejercicios.reduce((s, ej) => s + ej.series.length, 0);
}

/** Mejor set (mayor peso) de un ejercicio dentro de una sesión, ignora reps=0. */
export function mejorSetDeEjercicio(ej: EjercicioDeSesion): Serie | null {
  const validas = ej.series.filter((s) => s.reps > 0);
  if (validas.length === 0) return null;
  return validas.reduce((mejor, s) => (s.peso > mejor.peso ? s : mejor));
}

// ───────────────────────────────────────────────────────────────
// Detección de PRs
// ───────────────────────────────────────────────────────────────

export type PRDetectado = {
  ejercicioId: string;
  nombre: string;
  pesoNuevo: number;
  repsNuevo: number;
  pesoAnterior: number;
};

/**
 * Detecta PRs comparando los ejercicios de una sesión nueva con el histórico.
 * Devuelve la lista de PRs y muta `sesion.ejercicios[i].fueRecord` para los
 * que correspondan. La sesión se filtra del histórico (por id) por si se está
 * editando.
 */
export function detectarPRs(
  sesion: GymSesion,
  historico: GymSesion[],
  ejercicios: GymEjercicio[],
): PRDetectado[] {
  const otras = historico.filter((s) => s.id !== sesion.id);
  const detectados: PRDetectado[] = [];
  const mapaNombres = new Map(ejercicios.map((e) => [e.id, e.nombre]));

  for (const ej of sesion.ejercicios) {
    const top = mejorSetDeEjercicio(ej);
    if (!top || top.peso === 0) continue;

    const previo = mejorPesoHistorico(otras, ej.ejercicioId, sesion.fecha);
    if (top.peso > previo) {
      ej.fueRecord = true;
      detectados.push({
        ejercicioId: ej.ejercicioId,
        nombre: mapaNombres.get(ej.ejercicioId) ?? 'Ejercicio',
        pesoNuevo: top.peso,
        repsNuevo: top.reps,
        pesoAnterior: previo,
      });
    } else {
      ej.fueRecord = false;
    }
  }
  return detectados;
}

// ───────────────────────────────────────────────────────────────
// Última vez de un ejercicio
// ───────────────────────────────────────────────────────────────

export type UltimaVez = {
  fecha: string;
  series: Serie[];
  textoBreve: string; // "50 kg × 5"
  hace: string; // "hace 3 días"
};

/**
 * Devuelve la última sesión donde aparece un ejercicio (con sus series),
 * o null si nunca se hizo.
 */
export function ultimaVezEjercicio(
  sesiones: GymSesion[],
  ejercicioId: string,
): UltimaVez | null {
  const ordenadas = [...sesiones].sort((a, b) => b.fecha.localeCompare(a.fecha));
  for (const s of ordenadas) {
    const e = s.ejercicios.find((x) => x.ejercicioId === ejercicioId);
    if (!e) continue;
    const top = mejorSetDeEjercicio(e);
    if (!top) continue;
    return {
      fecha: s.fecha,
      series: e.series,
      textoBreve: `${top.peso} kg × ${top.reps}`,
      hace: hace(s.fecha),
    };
  }
  return null;
}

// ───────────────────────────────────────────────────────────────
// Ejercicios "frecuentes"
// ───────────────────────────────────────────────────────────────

/**
 * Los N ejercicios más usados, según frecuenciaDeUso (incrementada al guardar
 * cada sesión).
 */
export function ejerciciosFrecuentes(
  ejercicios: GymEjercicio[],
  n: number = 6,
): GymEjercicio[] {
  return [...ejercicios]
    .filter((e) => e.frecuenciaDeUso > 0)
    .sort((a, b) => b.frecuenciaDeUso - a.frecuenciaDeUso)
    .slice(0, n);
}
