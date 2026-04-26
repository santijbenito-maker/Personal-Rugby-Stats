import Dexie, { type Table } from 'dexie';
import type {
  Partido,
  Entrenamiento,
  GymSesion,
  GymEjercicio,
  TestFisico,
  Lesion,
  Config,
  VideoPartido,
} from '../types';

/**
 * Base de datos local IndexedDB de la app.
 * Todos los datos viven en el navegador del usuario — sin servidor.
 * Para migrar el esquema en futuras versiones se agrega un .version(N).stores()
 * con .upgrade() si hay que transformar datos existentes.
 */
class RugbyDB extends Dexie {
  partidos!: Table<Partido, string>;
  entrenamientos!: Table<Entrenamiento, string>;
  gym_sesiones!: Table<GymSesion, string>;
  gym_ejercicios!: Table<GymEjercicio, string>;
  tests_fisicos!: Table<TestFisico, string>;
  lesiones!: Table<Lesion, string>;
  config!: Table<Config, string>;
  videos!: Table<VideoPartido, string>;

  constructor() {
    super('RugbyStatsSB');

    // Versión 1: indexamos por id (primary key) y por fecha para poder
    // hacer queries ordenadas y filtros por rango rápido.
    this.version(1).stores({
      partidos: 'id, fecha',
      entrenamientos: 'id, fecha, asistencia',
      gym_sesiones: 'id, fecha, foco',
      gym_ejercicios: 'id, nombre, grupoMuscular, frecuenciaDeUso',
      tests_fisicos: 'id, fecha',
      lesiones: 'id, fecha, fechaAlta',
      config: 'clave',
    });

    // Versión 2: agregamos la tabla de videos, indexada por partidoId
    // para listar rápido los videos de un partido.
    this.version(2).stores({
      partidos: 'id, fecha',
      entrenamientos: 'id, fecha, asistencia',
      gym_sesiones: 'id, fecha, foco',
      gym_ejercicios: 'id, nombre, grupoMuscular, frecuenciaDeUso',
      tests_fisicos: 'id, fecha',
      lesiones: 'id, fecha, fechaAlta',
      config: 'clave',
      videos: 'id, partidoId, creadoEn',
    });

    // Versión 3: backfill de campos nuevos en Partido (knockOns y usoPie).
    // Los partidos guardados con versiones previas no tenían estos campos
    // y eso rompía los counters al editar (no podían sumar/restar a `undefined`).
    // El upgrade los rellena con 0.
    this.version(3)
      .stores({
        partidos: 'id, fecha',
        entrenamientos: 'id, fecha, asistencia',
        gym_sesiones: 'id, fecha, foco',
        gym_ejercicios: 'id, nombre, grupoMuscular, frecuenciaDeUso',
        tests_fisicos: 'id, fecha',
        lesiones: 'id, fecha, fechaAlta',
        config: 'clave',
        videos: 'id, partidoId, creadoEn',
      })
      .upgrade(async (tx) => {
        await tx
          .table('partidos')
          .toCollection()
          .modify((p: Partial<Partido>) => {
            if (typeof p.knockOns !== 'number') p.knockOns = 0;
            if (typeof p.usoPie !== 'number') p.usoPie = 0;
          });
      });

    // Versión 4: backfill de recepcionKicks (counter) y coberturas (rating 1-5).
    // Mismo motivo que la v3: los partidos viejos no tenían estos campos,
    // ahora se agregan a la pestaña Defensa del formulario.
    this.version(4)
      .stores({
        partidos: 'id, fecha',
        entrenamientos: 'id, fecha, asistencia',
        gym_sesiones: 'id, fecha, foco',
        gym_ejercicios: 'id, nombre, grupoMuscular, frecuenciaDeUso',
        tests_fisicos: 'id, fecha',
        lesiones: 'id, fecha, fechaAlta',
        config: 'clave',
        videos: 'id, partidoId, creadoEn',
      })
      .upgrade(async (tx) => {
        await tx
          .table('partidos')
          .toCollection()
          .modify((p: Partial<Partido>) => {
            if (typeof p.recepcionKicks !== 'number') p.recepcionKicks = 0;
            // Default 3 (mitad del rango 1-5) — neutral
            if (typeof p.coberturas !== 'number') p.coberturas = 3;
          });
      });

    // Versión 5: refactor de tackles. Antes guardábamos "efectivos + fallados";
    // ahora "efectivos + intentados" (= efectivos + fallados, mismo dato pero
    // expresado como X/Y). Computamos intentados desde lo que ya había:
    // intentados = efectivos + fallados.
    this.version(5)
      .stores({
        partidos: 'id, fecha',
        entrenamientos: 'id, fecha, asistencia',
        gym_sesiones: 'id, fecha, foco',
        gym_ejercicios: 'id, nombre, grupoMuscular, frecuenciaDeUso',
        tests_fisicos: 'id, fecha',
        lesiones: 'id, fecha, fechaAlta',
        config: 'clave',
        videos: 'id, partidoId, creadoEn',
      })
      .upgrade(async (tx) => {
        type PartidoConFallados = Partial<Partido> & { tacklesFallados?: number };
        await tx
          .table('partidos')
          .toCollection()
          .modify((p: PartidoConFallados) => {
            if (typeof p.tacklesIntentados !== 'number') {
              const efectivos = typeof p.tacklesEfectivos === 'number' ? p.tacklesEfectivos : 0;
              const fallados = typeof p.tacklesFallados === 'number' ? p.tacklesFallados : 0;
              p.tacklesIntentados = efectivos + fallados;
            }
            // Limpiamos el campo viejo para no dejar datos orphan en la base
            if ('tacklesFallados' in p) delete p.tacklesFallados;
          });
      });
  }
}

export const db = new RugbyDB();

/**
 * Vacía todas las tablas y vuelve a sembrar la biblioteca de ejercicios
 * (para que Santi pueda seguir cargando gym sin perder los nombres base).
 * No elimina la base de datos, sólo los registros.
 */
export async function borrarTodosLosDatos() {
  // Import diferido para evitar ciclo: schema <-> seed.
  const { sembrarBibliotecaEjercicios } = await import('./seed');
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
  });
  await sembrarBibliotecaEjercicios();
}
