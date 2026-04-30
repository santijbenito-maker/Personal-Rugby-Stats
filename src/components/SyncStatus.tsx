import { useEstadoSync } from '../lib/syncEstado';

/**
 * Indicador chico (colita visible en Header / Perfil) del estado de sync.
 * Muestra un dot de color con tooltip / texto al lado.
 *
 * Estados:
 *   - inicial / sin-sesion: gris claro, "Sin sincronizar"
 *   - sincronizando:        amarillo pulsando, "Sincronizando…"
 *   - idle (ok):            verde, "Sincronizado · hace Xs"
 *   - offline:              gris, "Sin conexión"
 *   - error:                rojo, "Error: <mensaje>"
 */
export function SyncStatus({ compacto = false }: { compacto?: boolean }) {
  const { fase, ultimaSyncMs, mensajeError } = useEstadoSync();

  const { color, texto, animado } = (() => {
    switch (fase) {
      case 'sincronizando':
        return { color: 'bg-amarillo-acento', texto: 'Sincronizando…', animado: true };
      case 'idle':
        return {
          color: 'bg-verde-record',
          texto: ultimaSyncMs ? `Sincronizado · ${tiempoRelativo(ultimaSyncMs)}` : 'Sincronizado',
          animado: false,
        };
      case 'offline':
        return { color: 'bg-slate-400', texto: 'Sin conexión', animado: false };
      case 'error':
        return { color: 'bg-rojo', texto: `Error: ${mensajeError ?? 'desconocido'}`, animado: false };
      case 'sin-sesion':
        return { color: 'bg-slate-300', texto: 'Sin sincronizar (no logueado)', animado: false };
      case 'inicial':
      default:
        return { color: 'bg-slate-300', texto: 'Esperando…', animado: false };
    }
  })();

  if (compacto) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400"
        title={texto}
      >
        <span
          className={`inline-block w-2 h-2 rounded-full ${color} ${animado ? 'animate-pulse' : ''}`}
          aria-hidden
        />
        <span className="hidden sm:inline">{texto}</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full ${color} ${animado ? 'animate-pulse' : ''}`}
        aria-hidden
      />
      <span>{texto}</span>
    </div>
  );
}

function tiempoRelativo(ms: number): string {
  const segs = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (segs < 5) return 'recién';
  if (segs < 60) return `hace ${segs}s`;
  const mins = Math.floor(segs / 60);
  if (mins < 60) return `hace ${mins} min`;
  const horas = Math.floor(mins / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `hace ${dias} d`;
}
