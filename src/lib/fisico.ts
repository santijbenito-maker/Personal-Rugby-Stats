import type { TestFisico, KindTestFisico, Lesion } from '../types';
import { restarDias, hoyISO, diferenciaDias } from './fechas';

// ───────────────────────────────────────────────────────────────
// Tests físicos (per-kind)
// ───────────────────────────────────────────────────────────────

/**
 * Estimador de 1RM (1 Repetition Maximum) usando la fórmula de Epley:
 *     1RM = peso × (1 + reps/30)
 *
 * Es la más usada en strength training. Para 1 rep devuelve el peso tal cual.
 * Útil para comparar levantamientos submáximos entre sí (ej: 80×3 vs 75×5).
 */
export function epley1RM(pesoKg: number, reps: number): number {
  if (reps <= 0 || pesoKg <= 0) return 0;
  if (reps === 1) return pesoKg;
  return pesoKg * (1 + reps / 30);
}

/**
 * Etiqueta legible del tipo de test, ej: "Sentadilla", "Tiempo 40m".
 * Usada en cards, headers y la gráfica.
 */
export function etiquetaKind(kind: KindTestFisico): string {
  switch (kind) {
    case '40m':
      return 'Tiempo 40 m';
    case 'sentadilla':
      return 'Sentadilla';
    case 'press_banca':
      return 'Press de banca';
    case 'bronco':
      return 'Bronco';
  }
}

/**
 * "Lower is better" indica si para este tipo de test un valor menor
 * es mejor (típico de tests de tiempo). Si es false (fuerza), mayor es mejor.
 */
export function menorEsMejor(kind: KindTestFisico): boolean {
  return kind === '40m' || kind === 'bronco';
}

/**
 * Devuelve el "valor" canónico de un test, normalizado para poder rankear:
 *   - Fuerza (sentadilla / press_banca): 1RM estimado (Epley)
 *   - Tiempo (40m / bronco): segundos directos
 *
 * Para comparar y decidir qué es PR, hay que combinar esto con menorEsMejor().
 */
export function valorTest(test: TestFisico): number {
  switch (test.kind) {
    case 'sentadilla':
    case 'press_banca':
      return epley1RM(test.pesoKg ?? 0, test.reps ?? 0);
    case '40m':
    case 'bronco':
      return test.segundos ?? Number.POSITIVE_INFINITY;
  }
}

/** Formatea un test para mostrar el resultado principal con su unidad. */
export function formatearValor(test: TestFisico): string {
  switch (test.kind) {
    case 'sentadilla':
    case 'press_banca': {
      const peso = test.pesoKg ?? 0;
      const reps = test.reps ?? 0;
      return `${peso} kg × ${reps}`;
    }
    case '40m':
      // Tiempos cortos: con 2 decimales
      return `${(test.segundos ?? 0).toFixed(2)} s`;
    case 'bronco':
      // Bronco dura minutos: formato m:ss
      return formatearMmSs(test.segundos ?? 0);
  }
}

/** Convierte 285 (segundos) → "4:45". */
export function formatearMmSs(segundosTotales: number): string {
  const min = Math.floor(segundosTotales / 60);
  const seg = Math.round(segundosTotales % 60);
  return `${min}:${String(seg).padStart(2, '0')}`;
}

/** Mejor test (PR) de un kind dado en una lista. undefined si no hay ninguno. */
export function mejorTest(
  tests: TestFisico[],
  kind: KindTestFisico,
): TestFisico | undefined {
  const propios = tests.filter((t) => t.kind === kind);
  if (propios.length === 0) return undefined;
  const menor = menorEsMejor(kind);
  return propios.reduce((best, t) => {
    const vB = valorTest(best);
    const vT = valorTest(t);
    return menor ? (vT < vB ? t : best) : (vT > vB ? t : best);
  });
}

/**
 * Determina si este test es récord considerando los OTROS tests del mismo
 * kind (no se compara contra sí mismo). Ideal para llamarse al guardar.
 */
export function esRecord(test: TestFisico, todos: TestFisico[]): boolean {
  const previos = todos.filter((t) => t.kind === test.kind && t.id !== test.id);
  if (previos.length === 0) {
    // El primer test del kind cuenta como récord (tu marca inicial).
    return true;
  }
  const mejorPrev = mejorTest(previos, test.kind);
  if (!mejorPrev) return true;
  const v = valorTest(test);
  const vPrev = valorTest(mejorPrev);
  return menorEsMejor(test.kind) ? v < vPrev : v > vPrev;
}

/** Último test cargado de un kind. undefined si no hay. */
export function ultimoTestDeKind(
  tests: TestFisico[],
  kind: KindTestFisico,
): TestFisico | undefined {
  const propios = tests
    .filter((t) => t.kind === kind)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  return propios[0];
}

/**
 * Puntos para gráfico de evolución del kind (orden cronológico).
 * Devuelve {fecha, valor, esRecord, esLowerBetter} para que la chart
 * pueda decorar los récords con un dot especial.
 */
export type PuntoEvolucion = {
  fecha: string;
  valor: number;
  /** Texto formateado del valor para tooltip. */
  etiqueta: string;
  /** True si en este punto se batió el récord (de los puntos hasta acá). */
  esRecord: boolean;
};

export function serieEvolucion(
  tests: TestFisico[],
  kind: KindTestFisico,
): PuntoEvolucion[] {
  const propios = tests
    .filter((t) => t.kind === kind)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  const menor = menorEsMejor(kind);
  let mejor = menor ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  return propios.map((t) => {
    const v = valorTest(t);
    const esPR = menor ? v < mejor : v > mejor;
    if (esPR) mejor = v;
    return {
      fecha: t.fecha,
      valor: v,
      etiqueta: formatearValor(t),
      esRecord: esPR,
    };
  });
}

/**
 * Delta del último test respecto al test anterior del mismo kind.
 * Devuelve la diferencia absoluta (positivo = subió, negativo = bajó) y
 * "esMejora" interpreta el signo según el kind (en tiempo, bajar es mejorar).
 */
export function deltaUltimo(
  tests: TestFisico[],
  kind: KindTestFisico,
): { absoluto: number; esMejora: boolean } | null {
  const propios = tests
    .filter((t) => t.kind === kind)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  if (propios.length < 2) return null;
  const ult = propios[0];
  const prev = propios[1];
  const absoluto = valorTest(ult) - valorTest(prev);
  const esMejora = menorEsMejor(kind) ? absoluto < 0 : absoluto > 0;
  return { absoluto: Number(absoluto.toFixed(2)), esMejora };
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

/** Lesiones activas (sin fecha de alta o con alta futura). */
export function lesionesActivas(lesiones: Lesion[]): Lesion[] {
  return lesiones.filter(esActiva);
}

/** Lesiones del año calendario actual. */
export function lesionesDelAño(lesiones: Lesion[]): Lesion[] {
  const añoActual = new Date().getFullYear();
  return lesiones.filter((l) => Number(l.fecha.slice(0, 4)) === añoActual);
}

// Re-exports usados internamente para que tsc no se queje del import sin uso.
export { restarDias };
