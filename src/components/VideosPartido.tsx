import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { agregarVideo, eliminarVideo, formatearBytes } from '../lib/videos';
import { useToast } from './Toaster';
import { VideoPlayer } from './VideoPlayer';
import { IconoMas, IconoCerrar } from './icons';
import type { VideoPartido } from '../types';

type Props = {
  partidoId: string;
};

const TAMAÑO_MAX = 500 * 1024 * 1024; // 500 MB por video

/**
 * Sección de videos asociada a un partido.
 * Permite subir uno o más archivos de video desde el dispositivo, listarlos,
 * reproducirlos en un modal y borrarlos. Los videos viven en IndexedDB del
 * dispositivo — NO se sincronizan ni se incluyen en el backup JSON.
 */
export function VideosPartido({ partidoId }: Props) {
  const { mostrar } = useToast();
  const [reproduciendo, setReproduciendo] = useState<VideoPartido | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const videos = useLiveQuery(
    () => db.videos.where('partidoId').equals(partidoId).sortBy('creadoEn'),
    [partidoId],
    [],
  );

  const handleSeleccionar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setSubiendo(true);
    try {
      for (const file of files) {
        if (file.size > TAMAÑO_MAX) {
          mostrar({
            tipo: 'error',
            mensaje: `${file.name} pesa ${formatearBytes(file.size)} — el máximo es ${formatearBytes(TAMAÑO_MAX)}`,
          });
          continue;
        }
        await agregarVideo(partidoId, file);
      }
      const cantidad = files.length;
      mostrar({
        tipo: 'exito',
        mensaje: cantidad === 1 ? 'Video agregado' : `${cantidad} videos agregados`,
      });
    } catch (err) {
      mostrar({
        tipo: 'error',
        mensaje: err instanceof Error ? err.message : 'No pude guardar el video',
      });
    } finally {
      setSubiendo(false);
      // Limpiar el input para que el usuario pueda volver a elegir el mismo archivo
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleEliminar = async (v: VideoPartido) => {
    if (!confirm(`¿Borrar "${v.nombre}"?`)) return;
    await eliminarVideo(v.id);
    mostrar({ tipo: 'exito', mensaje: 'Video borrado' });
  };

  const totalBytes = videos.reduce((s, v) => s + v.tamañoBytes, 0);

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
      <header className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h2 className="font-semibold flex items-center gap-2">
            <span aria-hidden>🎬</span>
            Videos
            {videos.length > 0 && (
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                ({videos.length} · {formatearBytes(totalBytes)})
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Los videos viven en este dispositivo. No se incluyen en el backup JSON.
          </p>
        </div>
      </header>

      {/* Lista */}
      {videos.length > 0 && (
        <ul className="space-y-2 mb-3">
          {videos.map((v) => (
            <li
              key={v.id}
              className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3"
            >
              <button
                type="button"
                onClick={() => setReproduciendo(v)}
                aria-label={`Reproducir ${v.nombre}`}
                className="shrink-0 w-12 h-12 rounded-full bg-azul-principal hover:bg-azul-oscuro text-white flex items-center justify-center transition active:scale-95"
              >
                <span className="text-lg ml-0.5" aria-hidden>▶</span>
              </button>
              <button
                type="button"
                onClick={() => setReproduciendo(v)}
                className="flex-1 min-w-0 text-left"
              >
                <p className="text-sm font-medium truncate">{v.nombre}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatearBytes(v.tamañoBytes)}
                  {v.descripcion && ` · ${v.descripcion}`}
                </p>
              </button>
              <button
                type="button"
                onClick={() => handleEliminar(v)}
                aria-label={`Borrar ${v.nombre}`}
                className="shrink-0 p-2 text-slate-400 hover:text-rojo hover:bg-rojo/10 rounded-full transition"
              >
                <IconoCerrar size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Botón subir */}
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        className="sr-only"
        onChange={handleSeleccionar}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={subiendo}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-azul-principal text-azul-principal dark:text-amarillo-acento py-3 rounded-lg text-sm font-semibold transition disabled:opacity-50"
      >
        <IconoMas size={18} />
        {subiendo ? 'Guardando…' : 'Agregar video'}
      </button>

      {reproduciendo && (
        <VideoPlayer video={reproduciendo} onCerrar={() => setReproduciendo(null)} />
      )}
    </section>
  );
}
