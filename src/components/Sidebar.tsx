import { Link, NavLink } from 'react-router-dom';
import { Crest } from './Crest';
import { TABS_NAV, IconoPerfil } from './icons';

/**
 * Sidebar de escritorio: escudo + identidad + 6 tabs verticales + acceso a perfil.
 * Oculta en mobile (ahí se usa BottomNav).
 */
export function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 h-screen sticky top-0 bg-azul-principal text-white">
      {/* Identidad del club arriba */}
      <div className="relative px-5 py-6 border-b border-white/10 overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amarillo-acento/20 blur-2xl pointer-events-none"
        />
        <Link to="/" className="relative flex items-center gap-3">
          <Crest size={48} />
          <div className="min-w-0">
            <p className="font-serif font-bold text-base leading-tight truncate">Santiago Benito</p>
            <p className="text-[11px] text-amarillo-claro/80 leading-tight">Medio · M15 · TLTC</p>
          </div>
        </Link>
      </div>

      {/* Tabs de navegación */}
      <nav className="flex-1 overflow-y-auto py-4" aria-label="Navegación principal">
        <ul className="space-y-1 px-3">
          {TABS_NAV.map(({ ruta, label, Icono }) => (
            <li key={ruta}>
              <NavLink
                to={ruta}
                end={ruta === '/'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                    'transition-colors',
                    isActive
                      ? 'bg-amarillo-acento text-azul-oscuro'
                      : 'text-white/80 hover:bg-white/10 hover:text-white',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <Icono size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Perfil al fondo */}
      <div className="px-3 py-3 border-t border-white/10">
        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            [
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
              'transition-colors',
              isActive
                ? 'bg-amarillo-acento text-azul-oscuro'
                : 'text-white/80 hover:bg-white/10 hover:text-white',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              <IconoPerfil size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              <span>Perfil</span>
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
