import { useEffect, useState } from 'react';

/**
 * Evento beforeinstallprompt: Chrome/Edge lo dispara cuando la PWA es
 * instalable. No está en los typings estándar de TS, así que lo declaro acá.
 */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

/**
 * Hook que escucha si el navegador puede ofrecer instalar la app.
 * Devuelve { puedeInstalar, instalar, yaInstalada } para mostrar un botón
 * "Instalar app" cuando corresponda.
 */
export function useInstalable() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [yaInstalada, setYaInstalada] = useState(esStandalone());

  useEffect(() => {
    const handler = (e: Event) => {
      // Evitar que el navegador muestre su mini-info-bar automáticamente
      e.preventDefault();
      setEvento(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setYaInstalada(true);
      setEvento(null);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const instalar = async (): Promise<'aceptado' | 'rechazado' | 'no-disponible'> => {
    if (!evento) return 'no-disponible';
    await evento.prompt();
    const choice = await evento.userChoice;
    setEvento(null);
    return choice.outcome === 'accepted' ? 'aceptado' : 'rechazado';
  };

  return {
    puedeInstalar: evento !== null && !yaInstalada,
    yaInstalada,
    instalar,
  };
}

/** ¿La app ya se está ejecutando en modo "standalone" (instalada)? */
function esStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  // iOS
  // @ts-expect-error — propiedad no estándar de Safari
  if (window.navigator.standalone) return true;
  // Otros navegadores
  return window.matchMedia('(display-mode: standalone)').matches;
}
