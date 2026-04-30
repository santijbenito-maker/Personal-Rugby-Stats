import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { useAutoSync } from '../lib/useAutoSync';

/**
 * Layout principal de la app:
 * - Mobile (<md): Header arriba + contenido + BottomNav fija abajo.
 * - Desktop (md+): Sidebar a la izquierda + contenido (sin header arriba).
 *
 * El <Outlet /> de React Router renderiza la página activa dentro del layout.
 *
 * También arranca acá el motor de auto-sync (un único lugar, montado una vez
 * mientras la app está abierta).
 */
export function Layout() {
  useAutoSync();
  return (
    <div className="min-h-screen md:flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sidebar de escritorio (oculta en mobile por su propio className) */}
      <Sidebar />

      {/* Columna de contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header mobile (oculto en md+ porque la sidebar ya muestra la identidad) */}
        <div className="md:hidden">
          <Header />
        </div>

        {/* Área scrollable: deja espacio para la BottomNav fija en mobile */}
        <main className="flex-1 px-4 py-5 md:px-8 md:py-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav mobile (oculta en md+ por su propio className) */}
      <BottomNav />
    </div>
  );
}
