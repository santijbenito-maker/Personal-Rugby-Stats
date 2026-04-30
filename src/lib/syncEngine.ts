import { supabase } from './supabase';
import {
  db,
  TIPOS_SINCRONIZADOS,
  type TablaSync,
  type Kind,
  type Tombstone,
} from '../db/schema';
import { marcarAplicandoRemoto } from './syncFlag';

/**
 * Motor de sincronización per-record con Supabase.
 *
 * Diseño: cada partido / entreno / etc. es una fila propia en la tabla
 * `app_records` del servidor. Eso permite que dos dispositivos editen
 * cosas distintas sin pisarse — el merge es por registro, usando el
 * timestamp `actualizadoEn` (ms desde epoch) para resolver conflictos
 * (gana el más nuevo).
 *
 * Diferencia con el sync v1 (subir/bajar todo en un blob): acá nunca se
 * pierden datos por sobreescritura de un dispositivo a otro mientras los
 * cambios sean en registros distintos. Solo se "pisan" cuando dos
 * dispositivos editan EL MISMO registro y uno termina después.
 */

const TABLA_SERVER = 'app_records';
const STORAGE_KEY_LAST_PULLED = 'sync:lastPulledAtMs';
const STORAGE_KEY_LAST_PUSHED = 'sync:lastPushedAtMs';

/** Fila tal como vive en Supabase. */
type FilaServer = {
  user_id: string;
  kind: Kind;
  id: string;
  data: Record<string, unknown> | null;
  updated_at_ms: number;
  deleted: boolean;
};

/** Mapeo inverso kind → nombre de tabla local. */
const TABLA_POR_KIND: Record<Kind, TablaSync> = Object.fromEntries(
  Object.entries(TIPOS_SINCRONIZADOS).map(([tabla, kind]) => [kind, tabla as TablaSync]),
) as Record<Kind, TablaSync>;

/** Devuelve el id de un registro local (para `config` es la `clave`). */
function getId(tabla: TablaSync, registro: Record<string, unknown>): string {
  if (tabla === 'config') return String(registro.clave);
  return String(registro.id);
}

/** Lee timestamp guardado en localStorage. 0 si nunca se sincronizó. */
function leerTimestamp(clave: string): number {
  if (typeof localStorage === 'undefined') return 0;
  const v = Number(localStorage.getItem(clave) ?? 0);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

function guardarTimestamp(clave: string, valor: number) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(clave, String(valor));
}

// ───────────────────────────────────────────────────────────────
// PUSH: subir cambios locales al servidor
// ───────────────────────────────────────────────────────────────

/**
 * Junta todos los registros locales con `actualizadoEn > desde`, los manda
 * al servidor con upsert. También manda los tombstones nuevos como filas
 * con `deleted=true, data=null`.
 *
 * Devuelve el timestamp del cambio más reciente que se subió, para
 * actualizar el cursor.
 */
async function pushDesde(desde: number): Promise<number> {
  const ahora = Date.now();
  const filas: FilaServer[] = [];

  // 1. Registros vivos
  for (const tabla of Object.keys(TIPOS_SINCRONIZADOS) as TablaSync[]) {
    const kind = TIPOS_SINCRONIZADOS[tabla];
    const registros = await db
      .table<Record<string, unknown>>(tabla)
      .where('actualizadoEn')
      .above(desde)
      .toArray();

    for (const r of registros) {
      const ts = typeof r.actualizadoEn === 'number' ? r.actualizadoEn : ahora;
      filas.push({
        user_id: '',
        kind,
        id: getId(tabla, r),
        data: r,
        updated_at_ms: ts,
        deleted: false,
      });
    }
  }

  // 2. Tombstones nuevos
  const tombstonesNuevos = await db.tombstones
    .where('deletedAt')
    .above(desde)
    .toArray();

  for (const t of tombstonesNuevos as Tombstone[]) {
    filas.push({
      user_id: '',
      kind: t.kind as Kind,
      id: t.id,
      data: null,
      updated_at_ms: t.deletedAt,
      deleted: true,
    });
  }

  if (filas.length === 0) return desde;

  // 3. Upsert. user_id se completa con auth.uid() en el server vía RLS check,
  //    pero la columna existe y debemos enviarla. La obtenemos de la sesión.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No estás logueado.');

  for (const f of filas) f.user_id = user.id;

  const { error } = await supabase
    .from(TABLA_SERVER)
    .upsert(filas, { onConflict: 'user_id,kind,id' });
  if (error) throw error;

  const maxTs = filas.reduce((max, f) => Math.max(max, f.updated_at_ms), desde);
  return maxTs;
}

// ───────────────────────────────────────────────────────────────
// PULL: bajar cambios del servidor y aplicarlos localmente
// ───────────────────────────────────────────────────────────────

/**
 * Trae todas las filas con `updated_at_ms > desde` del usuario logueado
 * y las aplica localmente: un registro remoto sólo pisa al local si su
 * timestamp es más nuevo. Si está marcado como borrado, hace delete local
 * (más tombstone, para no resucitar).
 *
 * Devuelve el timestamp más nuevo que se bajó.
 */
async function pullDesde(desde: number): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No estás logueado.');

  const { data, error } = await supabase
    .from(TABLA_SERVER)
    .select('user_id, kind, id, data, updated_at_ms, deleted')
    .eq('user_id', user.id)
    .gt('updated_at_ms', desde)
    .order('updated_at_ms', { ascending: true });
  if (error) throw error;
  if (!data || data.length === 0) return desde;

  let maxTs = desde;

  for (const f of data as FilaServer[]) {
    maxTs = Math.max(maxTs, f.updated_at_ms);
    await aplicarFilaRemota(f);
  }

  return maxTs;
}

/** Aplica una sola fila del server localmente, con merge por timestamp. */
async function aplicarFilaRemota(f: FilaServer) {
  const tabla = TABLA_POR_KIND[f.kind];
  if (!tabla) return; // kind desconocido (otra versión del cliente?), lo ignoramos

  if (f.deleted) {
    // Tombstone remoto: borrar local si lo nuestro es más viejo
    const local = await db.table<Record<string, unknown>>(tabla).get(f.id);
    if (local && Number(local.actualizadoEn ?? 0) > f.updated_at_ms) return;
    await db.transaction('rw', [db.table(tabla), db.tombstones], async () => {
      // No usamos .delete(id) directo: el hook de delete dispararía un evento
      // de cambio local que mandaría push de un tombstone que ya vino del
      // server. Borrar bypass-eando hooks no es trivial en Dexie, así que
      // dejamos que el hook escriba el tombstone local; el push debounced
      // lo va a mandar de vuelta — el server lo recibe y, como deleted ya
      // es true allí con timestamp igual, es no-op (idempotente).
      await db.table(tabla).delete(f.id);
      // Asegurar tombstone con timestamp del server
      await db.tombstones.put({ kind: f.kind, id: f.id, deletedAt: f.updated_at_ms });
    });
    return;
  }

  if (!f.data) return;

  const local = await db.table<Record<string, unknown>>(tabla).get(f.id);
  if (local && Number(local.actualizadoEn ?? 0) >= f.updated_at_ms) {
    // Lo local es igual o más nuevo: no pisar
    return;
  }

  // Aplicar (put = upsert por PK). Dexie va a disparar el hook de updating
  // o creating, lo que también va a setear actualizadoEn = Date.now() — ese
  // comportamiento sobreescribiría el timestamp del server. Para evitarlo
  // hacemos el escrito en una "ventana sin hooks" usando el método
  // bulkPut con la opción explícita: pasamos el actualizadoEn ya seteado.
  // Pero Dexie igual va a llamar al hook updating y va a sobreescribir.
  // Workaround: usamos table.bulkPut en una transacción con un flag global
  // que el hook respeta para no bumpear actualizadoEn.
  marcarAplicandoRemoto(true);
  try {
    await db.table(tabla).put(f.data);
  } finally {
    marcarAplicandoRemoto(false);
  }
}

// ───────────────────────────────────────────────────────────────
// Sync completo: pull + push, en ese orden
// ───────────────────────────────────────────────────────────────

let syncEnCurso: Promise<void> | null = null;

/**
 * Corre un ciclo completo: primero pull (incorporamos remoto al local),
 * después push (subimos lo que cambió localmente).
 *
 * Es deduplicado: si ya hay un sync corriendo, devuelve la promesa de ése.
 */
export async function syncCompleto(): Promise<void> {
  if (syncEnCurso) return syncEnCurso;
  syncEnCurso = ejecutarSync().finally(() => {
    syncEnCurso = null;
  });
  return syncEnCurso;
}

async function ejecutarSync() {
  const lastPulled = leerTimestamp(STORAGE_KEY_LAST_PULLED);
  const lastPushed = leerTimestamp(STORAGE_KEY_LAST_PUSHED);

  // Pull primero: si hay cambios remotos, los traemos antes de pisar nada.
  const nuevoPulled = await pullDesde(lastPulled);
  if (nuevoPulled > lastPulled) guardarTimestamp(STORAGE_KEY_LAST_PULLED, nuevoPulled);

  // Bumpear lastPushed al menos hasta nuevoPulled: los registros que
  // acabamos de bajar tienen timestamp del server, y como ese ts es > lastPushed,
  // si no movemos el cursor el siguiente push los re-mandaría al server (no rompe
  // nada — son idempotentes — pero malgasta tráfico y tiempo).
  const desdePush = Math.max(lastPushed, nuevoPulled);

  // Push después: lo nuestro local viaja al server.
  const nuevoPushed = await pushDesde(desdePush);
  const finalPushed = Math.max(nuevoPushed, desdePush);
  if (finalPushed > lastPushed) guardarTimestamp(STORAGE_KEY_LAST_PUSHED, finalPushed);
}

// ───────────────────────────────────────────────────────────────
// Reset de cursores (para "forzar resync completo")
// ───────────────────────────────────────────────────────────────

/**
 * Olvida los cursores de pull/push. La próxima sync va a comparar TODO
 * lo local con TODO lo remoto. Útil después de importar un backup o si
 * el usuario hizo "Bajar y reemplazar" desde un dispositivo nuevo.
 */
export function resetearCursores() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_LAST_PULLED);
  localStorage.removeItem(STORAGE_KEY_LAST_PUSHED);
}
