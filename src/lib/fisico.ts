import type { TestFisico, Lesion } from '../types';
import { restarDias, hoyISO, diferenciaDias } from './fechas';

// ───────────────────────────────────────────────────────────────
// Tests físicos
// ───────────────────────────────────────────────────────────────

/** El último test registrado (por fecha), o undefined si no hay. */
export function ultimoTest(tests: TestFisico[]): TestFisico | undefined {
  return [...tests].sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
}

/**
 * Delta de una métrica entre el último test y el test más cercano
 * anterior a "díasAtras" días. Devuelve null si no se puede calcular.
 */
export function deltaMetrica(
  tests: TestFisico[],
  getter: (t: TestFisico) => number | undefined,
  diasAtras = 30,
): number | null {
  const ult = ultimoTest(tests);
  if (!ult) return null;
  const vActual = getter(ult);
  if (vActual === undefined) return null;

  const umbral = restarDias(ult.fecha, diasAtras);
  const previos = tests
    .filter((t) => t.fecha < ult.fecha && t.fecha <= umbral)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  // Si no hay ninguno anterior al umbral, usá el más viejo disponible
  const base = previos[0] ?? tests
    .filter((t) => t.fecha < ult.fecha)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  if (!base) return null;
  const vPrev = getter(base);
  if (vPrev === undefined) return null;

  return Number((vActual - vPrev).toFixed(2));
}

/** Datos para el gráfico de evolución del peso corporal (orden cronológico). */
export type PuntoPesoCorporal = { fecha: string; peso: number };

export function seriePeso(tests: TestFisico[]): PuntoPesoCorporal[] {
  return [...tests]
    .filter((t) => t.pesoCorporal !== undefined)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((t) => ({ fecha: t.fecha, peso: t.pesoCorporal! }));
}

// ───────────────────────────────────────────────────────────────
// Lesiones
// ───────────────────────────────────────────────────────────────

/**
 * Está activa si no tiene fecha de alta, o si la fecha de alta está en el
 * futuro (la lesión todavía está en curso, recién está estimada).
 * Si la fecha de alta es hoy o pasada, la lesión ya está cerrada.
 */
export function esActiva(lesion: Lesion): boolean {
  if (!lesion.fechaAlta) return true;
  return lesion.fechaAlta > hoyISO();
}

/**
 * Cuántos días perdidos efectivos ha tenido la lesión.
 * Si está activa: desde la fecha hasta hoy (no proyectamos al futuro).
 * Si está recuperada: fecha → alta (alta real, ya pasada).
 */
export function diasPerdidos(lesion: Lesion): number {
  const hoy = hoyISO();
  const activa = esActiva(lesion);
  const fin = activa ? hoy : (lesion.fechaAlta ?? hoy);
  return Math.max(0, diferenciaDias(lesion.fecha, fin));
}

/** Lesiones activas (sin fecha de alta). */
export function lesionesActivas(lesiones: Lesion[]): Lesion[] {
  return lesiones.filter(esActiva);
}

/** Lesiones del año calendario actual. */
export function lesionesDelAño(lesiones: Lesion[]): Lesion[] {
  const añoActual = new Date().getFullYear();
  return lesiones.filter((l) => Number(l.fecha.slice(0, 4)) === añoActual);
}
