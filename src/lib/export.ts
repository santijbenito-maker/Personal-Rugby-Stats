import { db } from '../db/schema';
import type {
  Partido,
  Entrenamiento,
  GymSesion,
  GymEjercicio,
  TestFisico,
  Lesion,
  Config,
} from '../types';
import { hoyISO } from './fechas';

/**
 * Formato del archivo de backup. La versión sirve para que en el futuro,
 * si cambiamos campos, podamos hacer migraciones de datos importados.
 */
export type Backup = {
  app: 'rugby-stats-sb';
  version: 1;
  exportadoEn: string; // ISO datetime
  partidos: Partido[];
  entrenamientos: Entrenamiento[];
  gym_sesiones: GymSesion[];
  gym_ejercicios: GymEjercicio[];
  tests_fisicos: TestFisico[];
  lesiones: Lesion[];
  config: Config[];
};

export type ConteoBackup = {
  partidos: number;
  entrenamientos: number;
  gym_sesiones: number;
  gym_ejercicios: number;
  tests_fisicos: number;
  lesiones: number;
};

// ───────────────────────────────────────────────────────────────
// Exportar
// ───────────────────────────────────────────────────────────────

/** Genera un objeto Backup con todo el contenido de la base. */
export async function exportarTodo(): Promise<Backup> {
  const [partidos, entrenamientos, gym_sesiones, gym_ejercicios, tests_fisicos, lesiones, config] =
    await Promise.all([
      db.partidos.toArray(),
      db.entrenamientos.toArray(),
      db.gym_sesiones.toArray(),
      db.gym_ejercicios.toArray(),
      db.tests_fisicos.toArray(),
      db.lesiones.toArray(),
      db.config.toArray(),
    ]);

  return {
    app: 'rugby-stats-sb',
    version: 1,
    exportadoEn: new Date().toISOString(),
    partidos,
    entrenamientos,
    gym_sesiones,
    gym_ejercicios,
    tests_fisicos,
    lesiones,
    config,
  };
}

/** Dispara la descarga del archivo JSON con un nombre informativo. */
export function descargarBackup(backup: Backup) {
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rugby-stats-sb-${hoyISO()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Liberar el ObjectURL después de un instante (Safari necesita que esté
  // vivo durante el click).
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ───────────────────────────────────────────────────────────────
// Validar / Importar
// ───────────────────────────────────────────────────────────────

/**
 * Verifica que un objeto cualquiera tenga la forma de un Backup válido.
 * Tira un Error con mensaje claro si no.
 */
export function validarBackup(obj: unknown): asserts obj is Backup {
  if (!obj || typeof obj !== 'object') {
    throw new Error('El archivo no parece un backup válido (no es un objeto).');
  }
  const o = obj as Record<string, unknown>;
  if (o.app !== 'rugby-stats-sb') {
    throw new Error('Este archivo no es un backup de Stats SB.');
  }
  if (typeof o.version !== 'number') {
    throw new Error('El archivo no tiene versión.');
  }
  if (o.version !== 1) {
    throw new Error(`Versión ${o.version} no soportada todavía. Necesitás actualizar la app.`);
  }
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
    if (!Array.isArray(o[t])) {
      throw new Error(`El archivo no tiene la tabla "${t}" (o no es una lista).`);
    }
  }
}

/** Cuenta cuántos registros hay en cada tabla del backup. */
export function contar(b: Backup): ConteoBackup {
  return {
    partidos: b.partidos.length,
    entrenamientos: b.entrenamientos.length,
    gym_sesiones: b.gym_sesiones.length,
    gym_ejercicios: b.gym_ejercicios.length,
    tests_fisicos: b.tests_fisicos.length,
    lesiones: b.lesiones.length,
  };
}

/**
 * Lee un File del input y lo parsea como Backup validado.
 * Tira Error con mensaje claro si el archivo es inválido.
 */
export async function leerArchivoComoBackup(file: File): Promise<Backup> {
  const texto = await file.text();
  let obj: unknown;
  try {
    obj = JSON.parse(texto);
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }
  validarBackup(obj);
  return obj;
}

export type ModoImport = 'reemplazar' | 'sumar';

/**
 * Importa un backup a la base.
 * - "reemplazar": vacía las tablas y vuelca el backup completo.
 * - "sumar": agrega los registros que no existan (por id), conserva los actuales.
 */
export async function importarBackup(b: Backup, modo: ModoImport) {
  await db.transaction(
    'rw',
    [
      db.partidos,
      db.entrenamientos,
      db.gym_sesiones,
      db.gym_ejercicios,
      db.tests_fisicos,
      db.lesiones,
      db.config,
    ],
    async () => {
      if (modo === 'reemplazar') {
        await Promise.all(db.tables.map((t) => t.clear()));
        await db.partidos.bulkAdd(b.partidos);
        await db.entrenamientos.bulkAdd(b.entrenamientos);
        await db.gym_sesiones.bulkAdd(b.gym_sesiones);
        await db.gym_ejercicios.bulkAdd(b.gym_ejercicios);
        await db.tests_fisicos.bulkAdd(b.tests_fisicos);
        await db.lesiones.bulkAdd(b.lesiones);
        await db.config.bulkAdd(b.config);
      } else {
        // bulkPut hace upsert: agrega si no existe, actualiza si ya está.
        await db.partidos.bulkPut(b.partidos);
        await db.entrenamientos.bulkPut(b.entrenamientos);
        await db.gym_sesiones.bulkPut(b.gym_sesiones);
        await db.gym_ejercicios.bulkPut(b.gym_ejercicios);
        await db.tests_fisicos.bulkPut(b.tests_fisicos);
        await db.lesiones.bulkPut(b.lesiones);
        await db.config.bulkPut(b.config);
      }
    },
  );
}
