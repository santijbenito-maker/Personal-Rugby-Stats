import Dexie, { type Table } from 'dexie';
import type {
  Partido,
  Entrenamiento,
  GymSesion,
  GymEjercicio,
  TestFisico,
  Lesion,
  Config,
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
  }
}

export const db = new RugbyDB();

/**
 * Vacía todas las tablas. Útil para "empezar limpio" desde Perfil
 * o para tests. No elimina la base de datos, sólo los registros.
 */
export async function borrarTodosLosDatos() {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
  });
}
