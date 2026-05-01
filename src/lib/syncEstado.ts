/**
 * Mini-store del estado de sincronización para que cualquier componente
 * pueda mostrar el indicador (Header, SyncCard, etc.) sin pasar props
 * ni montar un Context completo.
 *
 * Es un patrón pub-sub manual: hay un valor, una lista de listeners, y
 * useEstadoSync() los engancha vía useSyncExternalStore.
 */
import { useSyncExternalStore } from 'react';

export type EstadoSync = {
  /** "idle" mientras no hay nada en curso ni errores. */
  fase: 'inicial' | 'idle' | 'sincronizando' | 'error' | 'offline' | 'sin-sesion';
  /** Timestamp (ms) de la última sync exitosa, 0 si nunca. */
  ultimaSyncMs: number;
  /** Mensaje de error de la última falla, si fase = 'error'. */
  mensajeError: string | null;
};

let estado: EstadoSync = {
  fase: 'inicial',
  ultimaSyncMs: 0,
  mensajeError: null,
};

const listeners = new Set<() => void>();

function notificar() {
  for (const l of listeners) l();
}

export function setFase(fase: EstadoSync['fase']) {
  if (estado.fase === fase) return;
  estado = { ...estado, fase, mensajeError: fase === 'error' ? estado.mensajeError : null };
  notificar();
}

export function setError(mensaje: string) {
  estado = { ...estado, fase: 'error', mensajeError: mensaje };
  notificar();
}

export function marcarSyncOk() {
  estado = { ...estado, fase: 'idle', ultimaSyncMs: Date.now(), mensajeError: null };
  notificar();
}

export function getEstado(): EstadoSync {
  return estado;
}

export function useEstadoSync(): EstadoSync {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => estado,
    () => estado,
  );
}
