/**
 * Escudo personal de Santiago Benito (SB) · M15 · Tucumán Lawn Tennis Club.
 * Es una pelota de rugby blanca con borde azul y contorno amarillo.
 * Se usa como favicon, en la bienvenida (120px), en el header (56px)
 * y en notificaciones (38px).
 */
type CrestProps = {
  /** Tamaño en píxeles (alto y ancho). Por defecto 100. */
  size?: number;
  /** Clases extra de Tailwind (por ejemplo para sombras o margen). */
  className?: string;
  /** Rótulo accesible del escudo. */
  title?: string;
};

export function Crest({ size = 100, className, title = 'Escudo TLTC · SB · M15' }: CrestProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {/* Contorno blanco principal con borde azul */}
      <ellipse cx="50" cy="50" rx="40" ry="46" fill="#FFFFFF" stroke="#1B3A6B" strokeWidth="3" />
      {/* Contorno interior amarillo */}
      <ellipse cx="50" cy="50" rx="36" ry="42" fill="none" stroke="#F5B700" strokeWidth="1.2" />
      {/* Línea vertical central (costura principal de la pelota) */}
      <line x1="50" y1="14" x2="50" y2="86" stroke="#F5B700" strokeWidth="1.5" opacity="0.8" />
      {/* Texto "TLTC" arriba */}
      <text
        x="50"
        y="28"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="8"
        fontWeight="700"
        fill="#1B3A6B"
        letterSpacing="2"
      >
        TLTC
      </text>
      {/* Iniciales grandes "SB" en el centro */}
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="30"
        fontWeight="700"
        fill="#1B3A6B"
        letterSpacing="-1"
      >
        SB
      </text>
      {/* Costuras horizontales y verticales (detalle de pelota de rugby) */}
      <line x1="44" y1="70" x2="56" y2="70" stroke="#F5B700" strokeWidth="1" />
      <line x1="46" y1="68" x2="46" y2="72" stroke="#F5B700" strokeWidth="0.8" />
      <line x1="50" y1="67.5" x2="50" y2="72.5" stroke="#F5B700" strokeWidth="0.8" />
      <line x1="54" y1="68" x2="54" y2="72" stroke="#F5B700" strokeWidth="0.8" />
      {/* Categoría "M15" al pie */}
      <text
        x="50"
        y="82"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize="5.5"
        fontWeight="600"
        fill="#1B3A6B"
        letterSpacing="0.8"
      >
        M15
      </text>
    </svg>
  );
}

export default Crest;
