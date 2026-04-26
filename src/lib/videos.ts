import { db } from '../db/schema';
import type { VideoPartido } from '../types';

/**
 * Agrega un archivo de video como adjunto de un partido.
 * El File se guarda como Blob directamente en IndexedDB (no se sube a ningún
 * lado — los videos viven en este dispositivo nada más).
 */
export async function agregarVideo(
  partidoId: string,
  file: File,
  descripcion?: string,
): Promise<VideoPartido> {
  const video: VideoPartido = {
    id: crypto.randomUUID(),
    partidoId,
    nombre: file.name,
    mimeType: file.type || 'video/mp4',
    tamañoBytes: file.size,
    blob: file,
    descripcion: descripcion?.trim() || undefined,
    creadoEn: Date.now(),
  };
  await db.videos.add(video);
  return video;
}

/** Lista los videos de un partido en orden de carga (más viejos primero). */
export async function listarVideosDePartido(partidoId: string): Promise<VideoPartido[]> {
  return db.videos.where('partidoId').equals(partidoId).sortBy('creadoEn');
}

export async function eliminarVideo(id: string): Promise<void> {
  await db.videos.delete(id);
}

/** Cuando se borra un partido, también borramos sus videos. */
export async function eliminarVideosDePartido(partidoId: string): Promise<void> {
  const ids = await db.videos.where('partidoId').equals(partidoId).primaryKeys();
  if (ids.length > 0) await db.videos.bulkDelete(ids);
}

/** Formatea bytes a "1.2 MB" / "523 KB" / "12 GB" según la magnitud. */
export function formatearBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const unidades = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), unidades.length - 1);
  const valor = bytes / Math.pow(1024, i);
  return `${valor < 10 ? valor.toFixed(1) : valor.toFixed(0)} ${unidades[i]}`;
}

/**
 * Pide al navegador la estimación de cuánto espacio está usando la app y
 * cuánto tiene disponible. No todos los navegadores soportan esta API.
 */
export async function estimarAlmacenamiento(): Promise<{ usado: number; total: number } | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null;
  const e = await navigator.storage.estimate();
  if (typeof e.usage !== 'number' || typeof e.quota !== 'number') return null;
  return { usado: e.usage, total: e.quota };
}
