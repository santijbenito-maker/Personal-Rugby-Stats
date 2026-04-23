import { Link } from 'react-router-dom';
import { Crest } from './Crest';
import { IconoPerfil } from './icons';

type HeaderProps = {
  /** Si es true muestra el círculo amarillo decorativo (sólo en mobile). */
  conDecoracion?: boolean;
  /** Tamaño del escudo (mobile: 44, desktop compacto: 40). */
  tamañoEscudo?: number;
};

/**
 * Header con la identidad del club: escudo + nombre + subtítulo + acceso a perfil.
 * Fondo azul principal con un círculo amarillo semi-transparente decorativo.
 */
export function Header({ conDecoracion = true, tamañoEscudo = 44 }: HeaderProps) {
  return (
    <header className="bg-azul-principal text-white relative overflow-hidden">
      {/* Círculo amarillo decorativo (sólo visible si conDecoracion) */}
      {conDecoracion && (
        <div
          aria-hidden
          className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-amarillo-acento/20 blur-2xl pointer-events-none"
        />
      )}

      <div className="relative flex items-center gap-3 px-4 py-3">
        {/* Escudo a la izquierda */}
        <Link to="/" aria-label="Ir al inicio" className="shrink-0">
          <Crest size={tamañoEscudo} />
        </Link>

        {/* Nombre + subtítulo */}
        <div className="flex-1 min-w-0">
          <p className="font-serif font-bold text-base sm:text-lg leading-tight truncate">
            Santiago Benito
          </p>
          <p className="text-[11px] sm:text-xs text-amarillo-claro/80 leading-tight truncate">
            Medio · M15 · Tucumán Lawn Tennis Club
          </p>
        </div>

        {/* Badge TLTC + acceso a perfil */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center bg-amarillo-acento text-azul-oscuro font-bold px-3 py-1 rounded-full text-xs tracking-wide">
            TLTC
          </span>
          <Link
            to="/perfil"
            aria-label="Ir al perfil"
            className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition"
          >
            <IconoPerfil size={22} />
          </Link>
        </div>
      </div>
    </header>
  );
}
