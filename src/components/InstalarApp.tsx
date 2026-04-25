import { useInstalable } from '../lib/pwa';
import { useToast } from './Toaster';

/**
 * Tarjeta "Instalar app" que aparece sólo si el navegador soporta la
 * instalación de PWA y la app no está instalada todavía. Si ya está
 * instalada muestra una confirmación discreta. Si el navegador no
 * soporta el prompt (Safari iOS, Firefox), no se muestra nada y se
 * deja una nota con instrucciones manuales en la sección Perfil.
 */
export function InstalarApp() {
  const { puedeInstalar, yaInstalada, instalar } = useInstalable();
  const { mostrar } = useToast();

  if (yaInstalada) {
    return (
      <div className="bg-verde-claro border border-verde-record/30 rounded-xl p-4 flex items-center gap-3">
        <span className="text-2xl" aria-hidden>✅</span>
        <div>
          <p className="font-bold text-verde-record">App instalada</p>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Estás usando Stats SB como app.
          </p>
        </div>
      </div>
    );
  }

  if (!puedeInstalar) {
    return null;
  }

  const handleInstalar = async () => {
    const r = await instalar();
    if (r === 'aceptado') {
      mostrar({ tipo: 'exito', mensaje: '¡Listo! Stats SB está instalada.' });
    }
  };

  return (
    <div className="bg-azul-principal text-white rounded-xl p-5 shadow-tarjeta">
      <div className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden>📲</span>
        <div className="flex-1">
          <p className="font-bold">Instalar la app</p>
          <p className="text-xs text-amarillo-claro/80 mt-0.5">
            Agregala a tu celular o escritorio. Funciona offline, abre en pantalla completa
            y queda como una app más.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleInstalar}
        className="mt-3 w-full bg-amarillo-acento hover:brightness-95 text-azul-oscuro font-bold rounded-lg px-4 py-2.5 text-sm transition"
      >
        Instalar Stats SB
      </button>
    </div>
  );
}
