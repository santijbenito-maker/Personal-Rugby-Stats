import { useState } from 'react';
import { useSesion } from '../lib/useSesion';
import { loginConEmail, cerrarSesion, subirAlServidor, bajarYReemplazar } from '../lib/sync';
import { useToast } from './Toaster';

/**
 * Tarjeta de "Sincronización entre dispositivos" en la página Perfil.
 * - Si no estás logueado: form de mail + botón "Enviar link".
 * - Si estás logueado: botones manuales "Subir ahora" y "Bajar y reemplazar".
 *
 * El sync NO incluye videos (son grandes y locales al dispositivo) — usa el
 * mismo formato JSON que el export/import a archivo.
 */
export function SyncCard() {
  const { usuario, cargando } = useSesion();
  const { mostrar } = useToast();

  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [linkEnviado, setLinkEnviado] = useState(false);
  const [trabajando, setTrabajando] = useState<null | 'subir' | 'bajar' | 'salir'>(null);

  const handleEnviarLink = async () => {
    if (!email.includes('@')) {
      mostrar({ tipo: 'error', mensaje: 'Poné un mail válido.' });
      return;
    }
    setEnviando(true);
    try {
      // Volvemos a la URL exacta de la app para que el link de mail traiga
      // de vuelta acá (no al root de github.io).
      const redirectTo = window.location.origin + window.location.pathname;
      await loginConEmail(email, redirectTo);
      setLinkEnviado(true);
      mostrar({
        tipo: 'exito',
        mensaje: 'Te mandamos un link al mail. Tocalo desde el mismo dispositivo.',
        duracion: 8000,
      });
    } catch (err) {
      mostrar({
        tipo: 'error',
        mensaje: err instanceof Error ? err.message : 'No pude mandar el link',
      });
    } finally {
      setEnviando(false);
    }
  };

  const handleSubir = async () => {
    setTrabajando('subir');
    try {
      const { actualizadoEn } = await subirAlServidor();
      mostrar({
        tipo: 'exito',
        mensaje: `Datos subidos al servidor. Hora: ${formatearHora(actualizadoEn)}`,
      });
    } catch (err) {
      mostrar({
        tipo: 'error',
        mensaje: err instanceof Error ? err.message : 'Falló la subida',
      });
    } finally {
      setTrabajando(null);
    }
  };

  const handleBajar = async () => {
    if (
      !confirm(
        '¿Reemplazar los datos de este dispositivo con los del servidor? Vas a perder cambios locales que no hayas subido.',
      )
    )
      return;
    setTrabajando('bajar');
    try {
      const { actualizadoEn } = await bajarYReemplazar();
      mostrar({
        tipo: 'exito',
        mensaje: `Datos bajados. Última subida: ${formatearHora(actualizadoEn)}`,
      });
    } catch (err) {
      mostrar({
        tipo: 'error',
        mensaje: err instanceof Error ? err.message : 'Falló la bajada',
      });
    } finally {
      setTrabajando(null);
    }
  };

  const handleSalir = async () => {
    setTrabajando('salir');
    try {
      await cerrarSesion();
      setEmail('');
      setLinkEnviado(false);
      mostrar({ tipo: 'exito', mensaje: 'Sesión cerrada' });
    } finally {
      setTrabajando(null);
    }
  };

  if (cargando) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800 p-5">
        <p className="text-sm text-slate-500 dark:text-slate-400">Cargando estado de sesión…</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800 p-5 space-y-3">
      <div>
        <h2 className="font-semibold flex items-center gap-2">
          <span aria-hidden>☁️</span>
          Sincronización entre dispositivos
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Subí tus datos a un servidor y bajalos en otro dispositivo. Los videos no se sincronizan
          (siguen siendo locales).
        </p>
      </div>

      {!usuario ? (
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium block mb-1.5">Tu mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vos@ejemplo.com"
              className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-azul-principal focus:outline-none focus:ring-2 focus:ring-azul-principal/20"
              disabled={enviando}
            />
          </label>
          <button
            type="button"
            onClick={handleEnviarLink}
            disabled={enviando || email.length === 0}
            className="w-full bg-azul-principal hover:bg-azul-oscuro text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition disabled:opacity-50"
          >
            {enviando ? 'Enviando…' : '✉  Enviarme link de inicio de sesión'}
          </button>
          {linkEnviado && (
            <p className="text-xs text-verde-record bg-verde-claro rounded-md px-3 py-2 border border-verde-record/20">
              ✓ Te mandamos un mail con el link. Abrilo desde este dispositivo y volvés logueado.
              Si no te llega en 1-2 minutos, fijate en spam.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-verde-claro border border-verde-record/20 rounded-md px-3 py-2 text-sm">
            <p className="font-semibold text-verde-record">✓ Conectado</p>
            <p className="text-xs text-slate-700 dark:text-slate-200 truncate">{usuario.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSubir}
              disabled={trabajando !== null}
              className="bg-amarillo-acento hover:brightness-95 text-azul-oscuro font-semibold rounded-lg px-4 py-2.5 text-sm transition disabled:opacity-50"
            >
              {trabajando === 'subir' ? 'Subiendo…' : '⬆ Subir ahora'}
            </button>
            <button
              type="button"
              onClick={handleBajar}
              disabled={trabajando !== null}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg px-4 py-2.5 text-sm transition disabled:opacity-50"
            >
              {trabajando === 'bajar' ? 'Bajando…' : '⬇ Bajar y reemplazar'}
            </button>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            <strong>Subir</strong>: este dispositivo manda sus datos al servidor.{' '}
            <strong>Bajar</strong>: el servidor sobrescribe los datos de este dispositivo. Como
            sólo sos vos, lo más simple es: cargás siempre desde el celu, subís cuando termina el
            partido, y desde la compu bajás antes de revisar.
          </p>

          <button
            type="button"
            onClick={handleSalir}
            disabled={trabajando !== null}
            className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-rojo transition py-1"
          >
            {trabajando === 'salir' ? 'Cerrando…' : 'Cerrar sesión en este dispositivo'}
          </button>
        </div>
      )}
    </div>
  );
}

function formatearHora(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
