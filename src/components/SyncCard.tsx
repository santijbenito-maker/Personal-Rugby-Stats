import { useEffect, useState } from 'react';
import { useSesion } from '../lib/useSesion';
import {
  loginConEmail,
  cerrarSesion,
  forzarSync,
  resyncCompletoDesdeCero,
} from '../lib/sync';
import { useToast } from './Toaster';
import { SyncStatus } from './SyncStatus';

// Espaciamos los pedidos de magic link para no chocar con el rate limit
// de Supabase (~2 mails/hora en el plan free) y para evitar doble-clicks
// accidentales. La marca se guarda en localStorage así sobrevive reloads.
const COOLDOWN_SEGUNDOS = 60;
const STORAGE_KEY_ULTIMO_ENVIO = 'sync:ultimoEnvioMagicLink';

/**
 * Tarjeta de "Sincronización entre dispositivos" en la página Perfil.
 *
 * Funcionamiento (post auto-sync):
 *  - Si no estás logueado: form de mail + botón "Enviar link".
 *  - Si estás logueado: indicador del estado de sync + sección colapsable
 *    "Modo avanzado" con los botones manuales de "forzar sync" y
 *    "resync completo desde cero".
 *
 * El sync NO incluye videos (son grandes y locales al dispositivo).
 */
export function SyncCard() {
  const { usuario, cargando } = useSesion();
  const { mostrar } = useToast();

  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [linkEnviado, setLinkEnviado] = useState(false);
  const [trabajando, setTrabajando] = useState<null | 'forzar' | 'resync' | 'salir'>(null);
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [avanzadoAbierto, setAvanzadoAbierto] = useState(false);

  useEffect(() => {
    const calcularRestante = () => {
      const ultimo = Number(localStorage.getItem(STORAGE_KEY_ULTIMO_ENVIO) ?? 0);
      const transcurrido = Math.floor((Date.now() - ultimo) / 1000);
      return Math.max(0, COOLDOWN_SEGUNDOS - transcurrido);
    };
    setSegundosRestantes(calcularRestante());
    const id = window.setInterval(() => {
      const restante = calcularRestante();
      setSegundosRestantes(restante);
      if (restante === 0) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [linkEnviado]);

  const handleEnviarLink = async () => {
    if (!email.includes('@')) {
      mostrar({ tipo: 'error', mensaje: 'Poné un mail válido.' });
      return;
    }
    if (segundosRestantes > 0) return;
    setEnviando(true);
    try {
      const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`;
      await loginConEmail(email, redirectTo);
      localStorage.setItem(STORAGE_KEY_ULTIMO_ENVIO, String(Date.now()));
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

  const handleForzar = async () => {
    setTrabajando('forzar');
    try {
      await forzarSync();
      mostrar({ tipo: 'exito', mensaje: 'Sincronizado.' });
    } catch (err) {
      mostrar({
        tipo: 'error',
        mensaje: err instanceof Error ? err.message : 'Falló la sincronización',
      });
    } finally {
      setTrabajando(null);
    }
  };

  const handleResync = async () => {
    if (
      !confirm(
        '¿Resincronizar todo desde cero? No se pierden datos: solo se vuelve a comparar todo con el servidor. Puede tardar unos segundos.',
      )
    )
      return;
    setTrabajando('resync');
    try {
      await resyncCompletoDesdeCero();
      mostrar({ tipo: 'exito', mensaje: 'Resync completo OK.' });
    } catch (err) {
      mostrar({
        tipo: 'error',
        mensaje: err instanceof Error ? err.message : 'Falló el resync',
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
          Tus partidos, entrenos, gym, tests y lesiones se sincronizan solos entre todos los
          dispositivos donde inicies sesión con el mismo mail. Los videos no se sincronizan
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
            disabled={enviando || email.length === 0 || segundosRestantes > 0}
            className="w-full bg-azul-principal hover:bg-azul-oscuro text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition disabled:opacity-50"
          >
            {enviando
              ? 'Enviando…'
              : segundosRestantes > 0
                ? `Esperá ${segundosRestantes}s para pedir otro link`
                : '✉  Enviarme link de inicio de sesión'}
          </button>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 break-all">
            Volverás a:{' '}
            <code className="font-mono">{`${window.location.origin}${import.meta.env.BASE_URL}`}</code>
          </p>
          {linkEnviado && (
            <p className="text-xs text-verde-record bg-verde-claro rounded-md px-3 py-2 border border-verde-record/20">
              ✓ Te mandamos un mail con el link. Abrilo desde este dispositivo y volvés logueado.
              Si no te llega en 1-2 minutos, fijate en spam.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-verde-claro border border-verde-record/20 rounded-md px-3 py-2">
            <p className="font-semibold text-verde-record text-sm">✓ Conectado</p>
            <p className="text-xs text-slate-700 dark:text-slate-200 truncate">{usuario.email}</p>
          </div>

          <div className="rounded-md border border-slate-200 dark:border-slate-800 px-3 py-2">
            <SyncStatus />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">
              La sincronización es automática: cada cambio se sube solo a los pocos segundos, y
              si otro dispositivo modifica algo te llega al toque. No tenés que tocar nada.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAvanzadoAbierto((v) => !v)}
            className="w-full text-left text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition py-1 flex items-center gap-1"
          >
            <span className="text-[10px]">{avanzadoAbierto ? '▼' : '▶'}</span>
            <span>Modo avanzado</span>
          </button>

          {avanzadoAbierto && (
            <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={handleForzar}
                disabled={trabajando !== null}
                className="w-full bg-amarillo-acento hover:brightness-95 text-azul-oscuro font-semibold rounded-lg px-4 py-2 text-sm transition disabled:opacity-50"
              >
                {trabajando === 'forzar' ? 'Sincronizando…' : '↻  Forzar sincronización ahora'}
              </button>
              <button
                type="button"
                onClick={handleResync}
                disabled={trabajando !== null}
                className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg px-4 py-2 text-sm transition disabled:opacity-50"
              >
                {trabajando === 'resync' ? 'Resincronizando…' : '⟳  Resync completo desde cero'}
              </button>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-snug">
                <strong>Forzar</strong>: corre el ciclo de sync ya, sin esperar al debounce.{' '}
                <strong>Resync completo</strong>: olvida los marcadores internos y vuelve a
                comparar todo con el servidor (no borra nada).
              </p>
            </div>
          )}

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
