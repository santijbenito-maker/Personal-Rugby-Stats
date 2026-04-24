import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { borrarTodosLosDatos, db } from '../db/schema';
import { cargarDatosDeEjemplo } from '../db/seed';
import { Crest } from '../components/Crest';

export function Perfil() {
  const [cargando, setCargando] = useState<null | 'seed' | 'borrar'>(null);

  const counts = useLiveQuery(async () => ({
    partidos: await db.partidos.count(),
    entrenos: await db.entrenamientos.count(),
    gym: await db.gym_sesiones.count(),
    tests: await db.tests_fisicos.count(),
    lesiones: await db.lesiones.count(),
  }));

  const handleBorrar = async () => {
    if (!confirm('¿Seguro que querés borrar TODOS tus datos? Esta acción no se puede deshacer.')) return;
    setCargando('borrar');
    try {
      await borrarTodosLosDatos();
    } finally {
      setCargando(null);
    }
  };

  const handleEjemplo = async () => {
    setCargando('seed');
    try {
      await cargarDatosDeEjemplo();
    } finally {
      setCargando(null);
    }
  };

  const edad = calcularEdad('2011-10-29');

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Título */}
      <div>
        <div className="flex items-center gap-3">
          <span className="inline-block w-1 h-7 bg-amarillo-acento rounded-full" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Perfil</h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 ml-4">Tus datos y tu app</p>
      </div>

      {/* Ficha del jugador */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center gap-4">
          <Crest size={72} />
          <div className="min-w-0">
            <p className="text-xl font-serif font-bold">Santiago Benito</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {edad} años · Medio (9/10)
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              M15 · Tucumán Lawn Tennis Club
            </p>
          </div>
        </div>
      </div>

      {/* Resumen de datos guardados */}
      {counts && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="font-semibold mb-3">Datos guardados</h2>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            <Fila label="Partidos" v={counts.partidos} />
            <Fila label="Entrenamientos" v={counts.entrenos} />
            <Fila label="Sesiones de gym" v={counts.gym} />
            <Fila label="Tests físicos" v={counts.tests} />
            <Fila label="Lesiones" v={counts.lesiones} />
          </ul>
        </div>
      )}

      {/* Acciones (versión preliminar — la UI final va en Hito 8) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800 p-5 space-y-3">
        <h2 className="font-semibold">Datos</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          En el Hito 8 sumamos exportar/importar JSON y la confirmación doble con "BORRAR".
        </p>

        <button
          onClick={handleEjemplo}
          disabled={cargando !== null}
          className="w-full bg-amarillo-acento hover:brightness-95 text-azul-oscuro font-semibold rounded-lg px-4 py-2.5 text-sm transition disabled:opacity-50"
        >
          {cargando === 'seed' ? 'Cargando…' : 'Cargar datos de ejemplo'}
        </button>

        <button
          onClick={handleBorrar}
          disabled={cargando !== null}
          className="w-full bg-white dark:bg-slate-900 hover:bg-rojo/5 border border-rojo text-rojo font-semibold rounded-lg px-4 py-2.5 text-sm transition disabled:opacity-50"
        >
          {cargando === 'borrar' ? 'Borrando…' : 'Borrar todos mis datos'}
        </button>
      </div>
    </div>
  );
}

function Fila({ label, v }: { label: string; v: number }) {
  return (
    <li className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
      <span className="font-bold">{v}</span>
    </li>
  );
}

/** Calcula la edad a partir de una fecha ISO "YYYY-MM-DD". */
function calcularEdad(fechaNacISO: string): number {
  const nac = new Date(fechaNacISO);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}
