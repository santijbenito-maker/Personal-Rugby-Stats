import { NavLink } from 'react-router-dom';
import { TABS_NAV } from './icons';

/**
 * Bottom navigation para celular: tabs con ícono + label (texto chico).
 * Fija al fondo, respetando el safe-area inset del iPhone. Soporta hasta
 * 7-8 tabs; más que eso requiere otro patrón (drawer / "más").
 */
export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegación principal"
    >
      <ul className="flex items-stretch justify-around">
        {TABS_NAV.map(({ ruta, label, Icono }) => (
          <li key={ruta} className="flex-1">
            <NavLink
              to={ruta}
              end={ruta === '/'}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center justify-center gap-0.5 py-2 px-1 text-[10px] font-medium',
                  'transition-colors',
                  isActive
                    ? 'text-azul-principal dark:text-amarillo-acento'
                    : 'text-slate-500 dark:text-slate-400',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icono size={22} strokeWidth={isActive ? 2.4 : 1.8} />
                  <span className="leading-none">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
