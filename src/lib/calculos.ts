import type { Partido, Entrenamiento, GymSesion, GymEjercicio } from '../types';
import { diferenciaDias, hoyISO, inicioMes, inicioMesAnterior, finMesAnterior, restarDias } from './fechas';

// ───────────────────────────────────────────────────────────────
// Filtros por mes
// ───────────────────────────────────────────────────────────────

/** ¿La fecha ISO está en el mes actual? */
export function esMesActual(iso: string): boolean {
  const inicio = inicioMes();
  const finProxMes = inicioMes(restarDias(inicio, -32)); // mes siguiente
  return iso >= inicio && iso < finProxMes;
}

/** ¿La fecha ISO está en el mes anterior? */
export function esMesAnterior(iso: string): boolean {
  return iso >= inicioMesAnterior() && iso <= finMesAnterior();
}

// ───────────────────────────────────────────────────────────────
// Métricas del dashboard
// ───────────────────────────────────────────────────────────────

export type MetricaDelta = {
  valor: number;
  delta: number; // actual - anterior
};

/** Partidos del mes actual vs. mes anterior. */
export function metricaPartidos(partidos: Partido[]): MetricaDelta {
  const actual = partidos.filter((p) => esMesActual(p.fecha)).length;
  const anterior = partidos.filter((p) => esMesAnterior(p.fecha)).length;
  return { valor: actual, delta: actual - anterior };
}

/** Tries totales del mes actual vs. mes anterior. */
export function metricaTries(partidos: Partido[]): MetricaDelta {
  const sum = (arr: Partido[]) => arr.reduce((s, p) => s + (p.tries || 0), 0);
  const actual = sum(partidos.filter((p) => esMesActual(p.fecha)));
  const anterior = sum(partidos.filter((p) => esMesAnterior(p.fecha)));
  return { valor: actual, delta: actual - anterior };
}

/** Tackles efectivos del mes actual vs. mes anterior. */
export function metricaTackles(partidos: Partido[]): MetricaDelta {
  const sum = (arr: Partido[]) => arr.reduce((s, p) => s + (p.tacklesEfectivos || 0), 0);
  const actual = sum(partidos.filter((p) => esMesActual(p.fecha)));
  const anterior = sum(partidos.filter((p) => esMesAnterior(p.fecha)));
  return { valor: actual, delta: actual - anterior };
}

/** Cantidad de PRs del mes actual vs. mes anterior. */
export function metricaPRs(sesiones: GymSesion[]): MetricaDelta {
  const contarPRs = (arr: GymSesion[]) =>
    arr.reduce((s, ses) => s + ses.ejercicios.filter((e) => e.fueRecord).length, 0);
  const actual = contarPRs(sesiones.filter((s) => esMesActual(s.fecha)));
  const anterior = contarPRs(sesiones.filter((s) => esMesAnterior(s.fecha)));
  return { valor: actual, delta: actual - anterior };
}

// ───────────────────────────────────────────────────────────────
// Racha de entrenamiento
// ───────────────────────────────────────────────────────────────

/**
 * Días consecutivos (hasta hoy) con al menos un entrenamiento "Presente"
 * o "Llegué tarde" (o una sesión de gym).
 * Si hoy no hay nada pero ayer sí, devuelve 0 (racha rota).
 */
export function calcularRacha(entrenamientos: Entrenamiento[], gym: GymSesion[]): number {
  const dias = new Set<string>();
  for (const e of entrenamientos) {
    if (e.asistencia !== 'Ausente') dias.add(e.fecha);
  }
  for (const g of gym) dias.add(g.fecha);

  let racha = 0;
  let cursor = hoyISO();
  while (dias.has(cursor)) {
    racha++;
    cursor = restarDias(cursor, 1);
  }
  return racha;
}

// ───────────────────────────────────────────────────────────────
// PR reciente (últimos 7 días)
// ───────────────────────────────────────────────────────────────

export type PRReciente = {
  ejercicioNombre: string;
  peso: number;
  reps: number;
  pesoAnterior: number;
  fecha: string;
};

/**
 * Devuelve el PR más reciente de los últimos 7 días, o null si no hay.
 * Se apoya en el flag `fueRecord` ya marcado al guardar la sesión.
 */
export function prReciente(
  sesiones: GymSesion[],
  ejercicios: GymEjercicio[],
): PRReciente | null {
  const hace7 = restarDias(hoyISO(), 7);
  const mapaEjercicios = new Map(ejercicios.map((e) => [e.id, e]));

  // Ordenar sesiones de más nueva a más vieja
  const sesiones7d = sesiones
    .filter((s) => s.fecha >= hace7)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  for (const sesion of sesiones7d) {
    for (const ej of sesion.ejercicios) {
      if (!ej.fueRecord) continue;
      const nombre = mapaEjercicios.get(ej.ejercicioId)?.nombre ?? 'Ejercicio';
      const mejorSerie = mejorSet(ej.series);
      const pesoAnterior = mejorPesoHistorico(sesiones, ej.ejercicioId, sesion.fecha);
      return {
        ejercicioNombre: nombre,
        peso: mejorSerie.peso,
        reps: mejorSerie.reps,
        pesoAnterior,
        fecha: sesion.fecha,
      };
    }
  }
  return null;
}

/** Mejor serie (mayor peso) de un ejercicio de la sesión. */
export function mejorSet(series: { peso: number; reps: number }[]) {
  return series.reduce((mejor, s) => (s.peso > mejor.peso ? s : mejor), { peso: 0, reps: 0 });
}

/**
 * Peso máximo histórico de un ejercicio anterior a una fecha dada (exclusivo).
 * Sirve como "PR anterior" cuando se detecta uno nuevo.
 */
export function mejorPesoHistorico(
  sesiones: GymSesion[],
  ejercicioId: string,
  antesDe: string,
): number {
  let max = 0;
  for (const s of sesiones) {
    if (s.fecha >= antesDe) continue;
    const e = s.ejercicios.find((x) => x.ejercicioId === ejercicioId);
    if (!e) continue;
    for (const serie of e.series) {
      if (serie.reps > 0 && serie.peso > max) max = serie.peso;
    }
  }
  return max;
}

// ───────────────────────────────────────────────────────────────
// Series para gráficos
// ───────────────────────────────────────────────────────────────

export type PuntoRating = { fecha: string; rating: number; rival: string };

/** Últimos N partidos en orden cronológico para el gráfico de rating. */
export function ratingUltimos(partidos: Partido[], n = 8): PuntoRating[] {
  return [...partidos]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(-n)
    .map((p) => ({ fecha: p.fecha, rating: p.rating, rival: p.rival }));
}

export type PuntoPeso = { fecha: string; peso: number };

/**
 * Para un ejercicio dado, devuelve el peso máximo por sesión en orden cronológico.
 * Sirve para el gráfico de progresión (sentadilla, press banca, etc.).
 */
export function progresionEjercicio(
  sesiones: GymSesion[],
  ejercicioId: string,
): PuntoPeso[] {
  const puntos: PuntoPeso[] = [];
  for (const s of [...sesiones].sort((a, b) => a.fecha.localeCompare(b.fecha))) {
    const e = s.ejercicios.find((x) => x.ejercicioId === ejercicioId);
    if (!e) continue;
    const top = mejorSet(e.series);
    if (top.peso > 0) puntos.push({ fecha: s.fecha, peso: top.peso });
  }
  return puntos;
}

/** Busca un ejercicio por nombre (case-insensitive). */
export function buscarEjercicioPorNombre(
  ejercicios: GymEjercicio[],
  nombre: string,
): GymEjercicio | undefined {
  const norm = nombre.toLowerCase();
  return ejercicios.find((e) => e.nombre.toLowerCase() === norm);
}

// ───────────────────────────────────────────────────────────────
// Progreso ejercicio (para tarjetas del dashboard)
// ───────────────────────────────────────────────────────────────

export type ProgresoEjercicio = {
  pesoInicial: number;
  pesoActual: number;
  progresoPct: number;
};

export function progresoDeEjercicio(
  sesiones: GymSesion[],
  ejercicioId: string,
): ProgresoEjercicio | null {
  const puntos = progresionEjercicio(sesiones, ejercicioId);
  if (puntos.length === 0) return null;
  const pesoInicial = puntos[0].peso;
  const pesoActual = puntos[puntos.length - 1].peso;
  const progresoPct = pesoInicial > 0 ? ((pesoActual - pesoInicial) / pesoInicial) * 100 : 0;
  return { pesoInicial, pesoActual, progresoPct };
}

// ───────────────────────────────────────────────────────────────
// Próximas actividades (placeholder)
// ───────────────────────────────────────────────────────────────

/**
 * Hoy no tenemos "calendario", así que por ahora mostramos
 * las próximas 3 actividades de la última semana como "últimas".
 * Se puede extender en futuros hitos con un campo "planificada".
 */
export type ActividadItem = {
  fecha: string;
  tipo: 'Partido' | 'Entreno' | 'Gym';
  descripcion: string;
  hacePct?: number;
};

export function ultimasActividades(
  partidos: Partido[],
  entrenos: Entrenamiento[],
  gym: GymSesion[],
  limite = 4,
): ActividadItem[] {
  const items: ActividadItem[] = [];
  for (const p of partidos) {
    items.push({
      fecha: p.fecha,
      tipo: 'Partido',
      descripcion: `vs ${p.rival}`,
    });
  }
  for (const e of entrenos) {
    items.push({
      fecha: e.fecha,
      tipo: 'Entreno',
      descripcion: e.tipo,
    });
  }
  for (const g of gym) {
    items.push({
      fecha: g.fecha,
      tipo: 'Gym',
      descripcion: g.foco,
    });
  }
  return items.sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, limite);
}

/** Diferencia en días entre hoy y una fecha dada (para "hace X días"). */
export function hacen(iso: string): number {
  return diferenciaDias(iso, hoyISO());
}
