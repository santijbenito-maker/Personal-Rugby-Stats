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
import { estoyAplicandoRemoto } from '../lib/syncFlag';

/**
 * Tombstone: marca de borrado para que la sincronización propague deletes
 * a otros dispositivos. PK compuesta (kind, id).
 */
export type Tombstone = {
  kind: string;
  id: string;
  deletedAt: number;
};

/**
 * Mapeo tabla local → "kind" usado por la sincronización en Supabase.
 * Las tablas que NO están acá no se sincronizan (videos: muy pesados; tombstones: meta).
 */
export const TIPOS_SINCRONIZADOS = {
  partidos: 'partido',
  entrenamientos: 'entrenamiento',
  gym_sesiones: 'gym_sesion',
  gym_ejercicios: 'gym_ejercicio',
  tests_fisicos: 'test_fisico',
  lesiones: 'lesion',
  config: 'config',
} as const;

export type TablaSync = keyof typeof TIPOS_SINCRONIZADOS;
export type Kind = (typeof TIPOS_SINCRONIZADOS)[TablaSync];

/** Evento custom que disparamos cuando hay un cambio local: dispara el push. */
export const EVENTO_CAMBIO_LOCAL = 'rugby-stats:cambio-local';

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
  tombstones!: Table<Tombstone, [string, string]>;

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

    // Versión 6: posicion (string única) → posiciones (array). Permite cargar
    // partidos donde se jugó 9 y 10 en simultáneo. Migramos arrancando con un
    // array que tiene la posición vieja como único elemento.
    this.version(6)
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
        type PartidoConPosicionVieja = Partial<Partido> & { posicion?: string };
        await tx
          .table('partidos')
          .toCollection()
          .modify((p: PartidoConPosicionVieja) => {
            if (!Array.isArray(p.posiciones)) {
              p.posiciones = p.posicion ? [p.posicion as Partido['posiciones'][number]] : ['10 - Apertura'];
            }
            if ('posicion' in p) delete p.posicion;
          });
      });

    // Versión 7: agrega la tabla "tombstones" (marcas de borrado para que la
    // sincronización propague deletes entre dispositivos), e indexa
    // "actualizadoEn" en cada tabla sincronizada para poder hacer queries
    // tipo "traeme todo lo que cambió desde X". Backfill de actualizadoEn
    // donde no existía (gym_ejercicios y registros muy viejos).
    this.version(7)
      .stores({
        partidos: 'id, fecha, actualizadoEn',
        entrenamientos: 'id, fecha, asistencia, actualizadoEn',
        gym_sesiones: 'id, fecha, foco, actualizadoEn',
        gym_ejercicios: 'id, nombre, grupoMuscular, frecuenciaDeUso, actualizadoEn',
        tests_fisicos: 'id, fecha, actualizadoEn',
        lesiones: 'id, fecha, fechaAlta, actualizadoEn',
        config: 'clave, actualizadoEn',
        videos: 'id, partidoId, creadoEn',
        tombstones: '[kind+id], deletedAt',
      })
      .upgrade(async (tx) => {
        const ahora = Date.now();
        const tablas = [
          'partidos',
          'entrenamientos',
          'gym_sesiones',
          'gym_ejercicios',
          'tests_fisicos',
          'lesiones',
          'config',
        ] as const;
        for (const t of tablas) {
          await tx
            .table(t)
            .toCollection()
            .modify((r: { creadoEn?: number; actualizadoEn?: number }) => {
              if (typeof r.actualizadoEn !== 'number') {
                r.actualizadoEn = typeof r.creadoEn === 'number' ? r.creadoEn : ahora;
              }
            });
        }
      });

    // Versión 8: tipo (string único) → tipos (array) en Entrenamiento.
    // Mismo patrón que la migración v6 de partido.posicion → posiciones:
    // permite cargar entrenamientos que combinan técnico + físico, etc.
    this.version(8)
      .stores({
        partidos: 'id, fecha, actualizadoEn',
        entrenamientos: 'id, fecha, asistencia, actualizadoEn',
        gym_sesiones: 'id, fecha, foco, actualizadoEn',
        gym_ejercicios: 'id, nombre, grupoMuscular, frecuenciaDeUso, actualizadoEn',
        tests_fisicos: 'id, fecha, actualizadoEn',
        lesiones: 'id, fecha, fechaAlta, actualizadoEn',
        config: 'clave, actualizadoEn',
        videos: 'id, partidoId, creadoEn',
        tombstones: '[kind+id], deletedAt',
      })
      .upgrade(async (tx) => {
        type EntrenamientoConTipoViejo = Partial<Entrenamiento> & { tipo?: string };
        await tx
          .table('entrenamientos')
          .toCollection()
          .modify((e: EntrenamientoConTipoViejo) => {
            if (!Array.isArray(e.tipos)) {
              e.tipos = e.tipo
                ? [e.tipo as Entrenamiento['tipos'][number]]
                : ['Técnico'];
            }
            if ('tipo' in e) delete e.tipo;
          });
      });
  }
}

export const db = new RugbyDB();

// ───────────────────────────────────────────────────────────────
// Hooks de sincronización
// ───────────────────────────────────────────────────────────────
//
// Cada vez que se crea, modifica o borra un registro de las tablas
// sincronizadas, hacemos dos cosas:
//   1. Auto-stamp del campo "actualizadoEn" (así el motor de sync siempre
//      tiene un timestamp coherente, sin depender de que cada lugar de
//      escritura se acuerde de setearlo).
//   2. Disparamos un evento custom para que el motor de sync agende un push
//      con debounce (sin que cada sitio de escritura tenga que llamar a
//      "sincronizar" a mano).
//
// En el caso de delete: además de avisar, escribimos un tombstone para que
// el otro dispositivo se entere del borrado.

function notificarCambioLocal() {
  if (typeof window === 'undefined') return;
  if (estoyAplicandoRemoto()) return;
  // Microtask: dejamos que la transacción de Dexie commit antes de disparar
  // el evento, así el listener (sync engine) lee la base ya consistente.
  queueMicrotask(() => window.dispatchEvent(new Event(EVENTO_CAMBIO_LOCAL)));
}

for (const tabla of Object.keys(TIPOS_SINCRONIZADOS) as TablaSync[]) {
  // Cast a Table<any> porque el callback de cada hook tiene firma distinta
  // y los overloads de Dexie no se resuelven bien al iterar por tabla.
  const t = db.table(tabla) as Table<Record<string, unknown>, string>;
  const kind = TIPOS_SINCRONIZADOS[tabla];

  t.hook('creating', (_pk, obj) => {
    // Si estamos aplicando un cambio remoto, respetamos el actualizadoEn que
    // ya viene en el objeto (es el timestamp del server). Si es un cambio
    // local, lo seteamos al ahora.
    if (!estoyAplicandoRemoto() || typeof obj.actualizadoEn !== 'number') {
      obj.actualizadoEn = Date.now();
    }
    notificarCambioLocal();
  });

  t.hook('updating', (mods, _pk, obj) => {
    notificarCambioLocal();
    if (estoyAplicandoRemoto()) {
      // El motor de sync ya está poniendo el actualizadoEn correcto (del
      // server). No bumpear sobre eso, sino el cambio remoto se ve como
      // local y dispara un loop.
      return mods;
    }
    // Si el caller explícitamente puso actualizadoEn en mods, lo respetamos
    // (caso raro: import de backup). Sino, ahora.
    const yaTieneTs = (mods as Record<string, unknown>).actualizadoEn !== undefined;
    return yaTieneTs ? mods : { ...mods, actualizadoEn: Date.now() };
    // _pk y obj no se usan, el cast de tipos ya está cubierto arriba
    void _pk;
    void obj;
  });

  t.hook('deleting', (pk) => {
    if (estoyAplicandoRemoto()) {
      // El delete fue pedido por el motor de sync al aplicar un tombstone
      // remoto. El motor ya está escribiendo el tombstone con el ts correcto.
      return;
    }
    const id = String(pk);
    // Disparamos en paralelo (fuera de la transacción actual) para no
    // forzar que cada delete tenga que abrir una tx con tombstones en su
    // alcance. Si el navegador se cierra entre el delete y el tombstone
    // (microsegundos) hay un mini-window donde el borrado podría no
    // propagarse — aceptable para una app personal.
    Promise.resolve().then(() =>
      db.tombstones.put({ kind, id, deletedAt: Date.now() }).catch(() => {}),
    );
    notificarCambioLocal();
  });
}

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
