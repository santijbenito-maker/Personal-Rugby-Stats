/**
 * Íconos SVG inline usados en la navegación.
 * Estilo stroke delgado (tipo Lucide/Heroicons), currentColor para heredar
 * el color del padre (azul cuando está activo, gris cuando no).
 */
type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

const base = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
});

// Inicio (Dashboard) — casa
export function IconoInicio({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth} aria-hidden>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M10 21v-6h4v6" />
    </svg>
  );
}

// Partidos — pelota de rugby (ovoide con costuras)
export function IconoPartidos({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth} aria-hidden>
      <ellipse cx="12" cy="12" rx="9" ry="6" transform="rotate(-30 12 12)" />
      <path d="M9 13.5 15 10.5" />
      <path d="m10 11 1 .6" />
      <path d="m11.5 10.2 1 .6" />
      <path d="m13 9.4 1 .6" />
    </svg>
  );
}

// Entrenos — silbato con cordón
export function IconoEntrenos({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth} aria-hidden>
      <path d="M14 8h6l1 2-1 2-1 3a4 4 0 0 1-4 4H9a5 5 0 0 1 0-10h5" />
      <path d="M13 8V5l-4 1" />
      <circle cx="10" cy="14" r="1" />
    </svg>
  );
}

// Gym — mancuerna (dumbbell)
export function IconoGym({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth} aria-hidden>
      <path d="M3 12h2" />
      <path d="M19 12h2" />
      <path d="M5 7v10" />
      <path d="M19 7v10" />
      <path d="M7 9v6" />
      <path d="M17 9v6" />
      <path d="M7 12h10" />
    </svg>
  );
}

// Físico — pulso / actividad
export function IconoFisico({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth} aria-hidden>
      <path d="M3 12h4l2-7 4 14 2-7h6" />
    </svg>
  );
}

// Lesiones — curita (bandage)
export function IconoLesiones({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth} aria-hidden>
      <rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-35 12 12)" />
      <circle cx="10" cy="12" r="0.6" fill="currentColor" />
      <circle cx="12" cy="11" r="0.6" fill="currentColor" />
      <circle cx="14" cy="13" r="0.6" fill="currentColor" />
      <circle cx="12" cy="13.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

// Perfil — usuario
export function IconoPerfil({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth} aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

// + (plus) — para botones "Cargar nuevo..."
export function IconoMas({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth} aria-hidden>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

// Flecha izquierda — volver
export function IconoFlechaIzq({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth} aria-hidden>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

// ─── Iconos de clima ───
export function IconoSol({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth} aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function IconoNube({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth} aria-hidden>
      <path d="M17.5 19a4.5 4.5 0 1 0-1-8.87A6 6 0 1 0 7 17h10.5Z" />
    </svg>
  );
}

export function IconoLluvia({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth} aria-hidden>
      <path d="M17.5 15a4.5 4.5 0 1 0-1-8.87A6 6 0 1 0 7 13h10.5Z" />
      <path d="M8 19v2M12 19v2M16 19v2" />
    </svg>
  );
}

export function IconoFrio({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth} aria-hidden>
      <path d="M12 2v20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07M2 12h20" />
      <path d="m6.5 6.5 1.5 1-1.5 1M15 5.5 12 8l-3-2.5M17.5 6.5 16 7.5l1.5 1M18.5 9 17 8l1 1.5M12 11l-2.5 3L12 17l2.5-3L12 11Z" />
    </svg>
  );
}

// Cerrar (X) — para remover items
export function IconoCerrar({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth} aria-hidden>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

// Chevron derecha — para detalles/abrir
export function IconoChevronDer({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth} aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/** Metadata de cada tab de la navegación principal. */
export type TabNav = {
  ruta: string;
  label: string;
  Icono: (props: IconProps) => JSX.Element;
};

export const TABS_NAV: TabNav[] = [
  { ruta: '/', label: 'Inicio', Icono: IconoInicio },
  { ruta: '/partidos', label: 'Partidos', Icono: IconoPartidos },
  { ruta: '/entrenos', label: 'Entrenos', Icono: IconoEntrenos },
  { ruta: '/gym', label: 'Gym', Icono: IconoGym },
  { ruta: '/fisico', label: 'Físico', Icono: IconoFisico },
  { ruta: '/lesiones', label: 'Lesiones', Icono: IconoLesiones },
];
