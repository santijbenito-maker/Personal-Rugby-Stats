/**
 * Flag global que indica si el motor de sync está aplicando un cambio que
 * vino del servidor (durante un pull). Los hooks de Dexie lo consultan
 * para no:
 *   - re-bumpear "actualizadoEn" sobre el timestamp del server
 *   - disparar el evento de cambio local que haría que ese cambio remoto
 *     vuelva a subirse al servidor (loop infinito)
 *
 * Vive en un módulo aparte para evitar dependencia circular entre
 * db/schema (donde están los hooks) y lib/syncEngine (donde está la
 * lógica que prende/apaga el flag).
 */
let aplicandoRemoto = false;

export function estoyAplicandoRemoto() {
  return aplicandoRemoto;
}

export function marcarAplicandoRemoto(v: boolean) {
  aplicandoRemoto = v;
}
