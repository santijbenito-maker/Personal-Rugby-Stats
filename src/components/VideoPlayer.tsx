import { useEffect, useMemo } from 'react';
import type { VideoPartido } from '../types';
import { IconoCerrar } from './icons';

type Props = {
  video: VideoPartido;
  onCerrar: () => void;
};

/**
 * Modal de pantalla completa con un <video controls> reproduciendo el blob
 * del adjunto. Crea un Object URL al montar y lo libera al desmontar para
 * no perder memoria (los blobs grandes no se recolectan solos).
 */
export function VideoPlayer({ video, onCerrar }: Props) {
  const url = useMemo(() => URL.createObjectURL(video.blob), [video.blob]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      URL.revokeObjectURL(url);
    };
  }, [url, onCerrar]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85" onClick={onCerrar} aria-hidden />
      <div role="dialog" aria-modal="true" className="relative w-full max-w-3xl">
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="absolute -top-12 right-0 text-white/90 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          <IconoCerrar size={24} />
        </button>
        <video
          src={url}
          controls
          autoPlay
          playsInline
          className="w-full max-h-[80vh] rounded-lg shadow-2xl bg-black"
        />
        <div className="mt-3 text-white text-center">
          <p className="font-semibold">{video.nombre}</p>
          {video.descripcion && (
            <p className="text-sm text-white/70 mt-0.5">{video.descripcion}</p>
          )}
        </div>
      </div>
    </div>
  );
}
