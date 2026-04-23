import { Crest } from './components/Crest';

/**
 * Pantalla de bienvenida provisoria (Hito 1).
 * En el Hito 2 se reemplaza por un Router + Layout con las 6 secciones.
 * Objetivo acá: verificar que Tailwind, la paleta y el escudo renderizan bien.
 */
function App() {
  return (
    <main className="min-h-screen bg-azul-principal text-white flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Círculo amarillo decorativo en la esquina superior derecha */}
      <div
        aria-hidden
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-amarillo-acento/20 blur-2xl"
      />

      {/* Escudo grande de bienvenida */}
      <Crest size={120} className="drop-shadow-lg" />

      {/* Nombre y subtítulo */}
      <h1 className="mt-6 text-3xl sm:text-4xl font-serif font-bold tracking-tight text-center">
        Santiago Benito
      </h1>
      <p className="mt-2 text-base sm:text-lg text-amarillo-claro/90 text-center">
        Medio · M15 · Tucumán Lawn Tennis Club
      </p>

      {/* Badge TLTC (bandera amarilla) */}
      <span className="mt-6 inline-flex items-center gap-2 bg-amarillo-acento text-azul-oscuro font-bold px-4 py-1.5 rounded-full text-sm tracking-wide shadow">
        TLTC
      </span>

      {/* Mensaje de estado del Hito 1 */}
      <div className="mt-12 max-w-sm text-center">
        <p className="text-sm text-amarillo-claro/80">
          ¡Listo el Hito 1! Proyecto base + escudo funcionando.
        </p>
        <p className="mt-2 text-xs text-white/60">
          Próximo paso: el layout con los 6 tabs (Inicio, Partidos, Entrenos, Gym, Físico, Lesiones).
        </p>
      </div>
    </main>
  );
}

export default App;
