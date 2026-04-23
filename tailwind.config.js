/** @type {import('tailwindcss').Config} */
// Configuración de Tailwind con la paleta oficial de la app (TLTC · SB · M15).
// Estos nombres se usan en las clases: bg-azul-principal, text-amarillo-acento, etc.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media', // usa prefers-color-scheme del sistema
  theme: {
    extend: {
      colors: {
        'azul-principal': '#1B3A6B',
        'azul-oscuro': '#122952',
        'amarillo-acento': '#F5B700',
        'amarillo-claro': '#FFF8E1',
        'verde-record': '#1D9E54',
        'verde-claro': 'rgba(29, 158, 84, 0.08)',
        'rojo': '#A32D2D',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'tarjeta': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
