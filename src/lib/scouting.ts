import type { Partido, Rival } from '../types';

/**
 * Normaliza el nombre del rival para hacer matching case-insensitive
 * y tolerante a espacios extra. Sin esto "huirapuca" y "Huirapuca" se
 * tratarían como rivales distintos.
 */
export function normalizarNombreRival(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Partidos jugados contra un rival (matcheando por nombre normalizado). */
export function partidosContraRival(partidos: Partido[], rival: Rival): Partido[] {
  const objetivo = normalizarNombreRival(rival.nombre);
  return partidos.filter((p) => normalizarNombreRival(p.rival) === objetivo);
}

/** Estadísticas agregadas contra un rival, derivadas de los partidos. */
export type StatsContraRival = {
  total: number;
  ganados: number;
  perdidos: number;
  empates: number;
  puntosPropiosTotal: number;
  puntosRivalTotal: number;
  /** Promedio de puntos propios cuando los enfrentaste. */
  promedioPropios: number;
  /** Promedio de puntos del rival. */
  promedioRival: number;
};

export function statsContraRival(partidos: Partido[], rival: Rival): StatsContraRival {
  const vs = partidosContraRival(partidos, rival);
  let ganados = 0;
  let perdidos = 0;
  let empates = 0;
  let propios = 0;
  let rivalPts = 0;
  for (const p of vs) {
    propios += p.puntosPropios;
    rivalPts += p.puntosRival;
    if (p.puntosPropios > p.puntosRival) ganados++;
    else if (p.puntosPropios < p.puntosRival) perdidos++;
    else empates++;
  }
  const total = vs.length;
  return {
    total,
    ganados,
    perdidos,
    empates,
    puntosPropiosTotal: propios,
    puntosRivalTotal: rivalPts,
    promedioPropios: total > 0 ? Number((propios / total).toFixed(1)) : 0,
    promedioRival: total > 0 ? Number((rivalPts / total).toFixed(1)) : 0,
  };
}

/** Busca un rival en la lista por nombre (matching normalizado). */
export function buscarRivalPorNombre(
  rivales: Rival[],
  nombre: string,
): Rival | undefined {
  const objetivo = normalizarNombreRival(nombre);
  return rivales.find((r) => normalizarNombreRival(r.nombre) === objetivo);
}
