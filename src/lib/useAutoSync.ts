import { useEffect } from 'react';
import { supabase } from './supabase';
import { syncCompleto } from './syncEngine';
import { setFase, setError, marcarSyncOk, getEstado } from './syncEstado';
import { EVENTO_CAMBIO_LOCAL } from '../db/schema';
import { useSesion } from './useSesion';

/**
 * Hook que se monta una sola vez en la raíz de la app y se encarga de
 * disparar la sincronización en los momentos correctos:
 *
 * 1. Al loguearse (sync inicial completo).
 * 2. Cada vez que hay un cambio local — debounced 2s — sube los cambios.
 * 3. Cada 30s mientras la pestaña está activa, hace pull para traer
 *    cambios de otros dispositivos.
 * 4. Cuando la pestaña vuelve a primer plano (visibilitychange) o el
 *    navegador recupera conexión (online), syncea.
 * 5. Realtime de Supabase: cuando otro dispositivo escribe en el server,
 *    nos avisa y bajamos el cambio al toque.
 */
const DEBOUNCE_MS = 2000;
const INTERVALO_PULL_MS = 30_000;

export function useAutoSync() {
  const { usuario, cargando } = useSesion();

  useEffect(() => {
    if (cargando) return;
    if (!usuario) {
      setFase('sin-sesion');
      return;
    }

    let cancelado = false;
    let timerDebounce: number | null = null;
    let timerIntervalo: number | null = null;

    const correrSync = async (motivo: string) => {
      if (cancelado) return;
      if (!navigator.onLine) {
        setFase('offline');
        return;
      }
      try {
        setFase('sincronizando');
        if (import.meta.env.DEV) console.debug('[sync]', motivo);
        await syncCompleto();
        if (cancelado) return;
        marcarSyncOk();
      } catch (err) {
        if (cancelado) return;
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[sync] error:', msg);
        setError(msg);
      }
    };

    // 1. Sync inicial al loguearse
    void correrSync('inicial');

    // 2. Debounced push tras cambios locales
    const onCambioLocal = () => {
      if (timerDebounce !== null) window.clearTimeout(timerDebounce);
      timerDebounce = window.setTimeout(() => {
        timerDebounce = null;
        void correrSync('cambio-local');
      }, DEBOUNCE_MS);
    };
    window.addEventListener(EVENTO_CAMBIO_LOCAL, onCambioLocal);

    // 3. Pull periódico
    timerIntervalo = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void correrSync('intervalo');
      }
    }, INTERVALO_PULL_MS);

    // 4. Volver a primer plano / recuperar conexión
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void correrSync('visibilitychange');
    };
    const onOnline = () => {
      void correrSync('online');
    };
    const onOffline = () => {
      // No sobreescribir si ya hay un error real; sino marcamos offline.
      if (getEstado().fase !== 'error') setFase('offline');
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // 5. Realtime: cuando otro dispositivo escribe, llega un push y syncamos
    //    al toque (en realidad pulleamos: la suscripción nos cuenta que hay
    //    novedad, pero el merge lo hacemos vía sync normal para reusar
    //    toda la lógica de timestamps).
    const canal = supabase
      .channel(`app_records_${usuario.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_records',
          filter: `user_id=eq.${usuario.id}`,
        },
        () => {
          void correrSync('realtime');
        },
      )
      .subscribe();

    return () => {
      cancelado = true;
      if (timerDebounce !== null) window.clearTimeout(timerDebounce);
      if (timerIntervalo !== null) window.clearInterval(timerIntervalo);
      window.removeEventListener(EVENTO_CAMBIO_LOCAL, onCambioLocal);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      void supabase.removeChannel(canal);
    };
  }, [usuario, cargando]);
}
