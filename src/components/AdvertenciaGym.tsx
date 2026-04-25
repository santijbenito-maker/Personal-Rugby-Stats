import { IconoAdvertencia } from './icons';

/**
 * Banner amarillo claro fijo al tope de la sección Gym.
 * Es importante no quitarlo: Santi tiene 14 años y está creciendo.
 */
export function AdvertenciaGym() {
  return (
    <div className="bg-amarillo-claro dark:bg-amarillo-acento/15 border border-amarillo-acento/40 rounded-xl p-4 flex gap-3">
      <span className="shrink-0 text-amarillo-acento" aria-hidden>
        <IconoAdvertencia size={28} strokeWidth={2.2} />
      </span>
      <div className="text-sm text-slate-800 dark:text-slate-100">
        <p className="font-semibold mb-1">Recordá:</p>
        <p>
          Tenés 14 años y estás creciendo. <strong>Priorizá siempre la técnica sobre el peso</strong>.
          Antes de subir cargas consultá con tu profe. Si algo te duele (articulación, espalda,
          rodilla), pará y avisá.
        </p>
      </div>
    </div>
  );
}
