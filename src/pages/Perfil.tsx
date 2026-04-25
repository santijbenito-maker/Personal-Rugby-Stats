import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { cargarDatosDeEjemplo } from '../db/seed';
import { exportarTodo, descargarBackup } from '../lib/export';
import { Crest } from '../components/Crest';
import { ImportarModal } from '../components/ImportarModal';
import { BorrarConfirmacion } from '../components/BorrarConfirmacion';
import { useToast } from '../components/Toaster';

export function Perfil() {
  const { mostrar } = useToast();
  const [trabajando, setTrabajando] = useState<null | 'export' | 'seed'>(null);
  const [importarAbierto, setImportarAbierto] = useState(false);
  const [borrarAbierto, setBorrarAbierto] = useState(false);

  const counts = useLiveQuery(async () => ({
    partidos: await db.partidos.count(),
    entrenos: await db.entrenamientos.count(),
    gym: await db.gym_sesiones.count(),
    tests: await db.tests_fisicos.count(),
    lesiones: await db.lesiones.count(),
  }));

  const totalRegistros =
    (counts?.partidos ?? 0) +
    (counts?.entrenos ?? 0) +
    (counts?.gym ?? 0) +
    (counts?.tests ?? 0) +
    (counts?.lesiones ?? 0);

  const edad = calcularEdad('2011-10-29');

  const handleExportar = async () => {
    setTrabajando('export');
    try {
      const backup = await exportarTodo();
      descargarBackup(backup);
      mostrar({ tipo: 'exito', mensaje: 'Backup descargado' });
    } catch (e) {
      mostrar({ tipo: 'error', mensaje: e instanceof Error ? e.message : 'No pude exportar' });
    } finally {
      setTrabajando(null);
    }
  };

  const handleEjemplo = async () => {
    setTrabajando('seed');
    try {
      await cargarDatosDeEjemplo();
      mostrar({ tipo: 'exito', mensaje: 'Datos de ejemplo cargados' });
    } finally {
      setTrabajando(null);
    }
  };

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
            <p className="text-sm text-slate-600 dark:text-slate-400">{edad} años · Medio (9/10)</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              M15 · Tucumán Lawn Tennis Club
            </p>
          </div>
        </div>
      </div>

      {/* Resumen de datos */}
      {counts && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="font-semibold mb-3">Datos guardados</h2>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            <Fila label="Partidos" v={counts.partidos} />
            <Fila label="Entrenamientos" v={counts.entrenos} />
            <Fila label="Sesiones de gym" v={counts.gym} />
            <Fila label="Tests físicos" v={counts.tests} />
            <Fila label="Lesiones" v={counts.lesiones} />
            <Fila label="TOTAL" v={totalRegistros} destacado />
          </ul>
        </div>
      )}

      {/* Backup: Exportar / Importar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800 p-5 space-y-3">
        <div>
          <h2 className="font-semibold">Backup de tus datos</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Descargá un archivo JSON con todo, o restaurá un backup que tengas guardado.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportar}
          disabled={trabajando === 'export' || totalRegistros === 0}
          className="w-full flex items-center justify-center gap-2 bg-azul-principal hover:bg-azul-oscuro text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition disabled:opacity-50"
        >
          {trabajando === 'export' ? 'Exportando…' : '⬇  Exportar todos mis datos'}
        </button>
        {totalRegistros === 0 && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-1">
            No hay datos para exportar todavía.
          </p>
        )}

        <button
          type="button"
          onClick={() => setImportarAbierto(true)}
          className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg px-4 py-2.5 text-sm transition"
        >
          ⬆  Importar datos
        </button>
      </div>

      {/* Datos de ejemplo (atajo) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800 p-5">
        <h2 className="font-semibold">Datos de ejemplo</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
          Carga 4 partidos, 6 entrenamientos, 9 sesiones de gym, 3 tests y 1 lesión recuperada.
          Sólo si todavía no cargaste nada propio.
        </p>
        <button
          type="button"
          onClick={handleEjemplo}
          disabled={trabajando === 'seed' || totalRegistros > 0}
          className="w-full bg-amarillo-acento hover:brightness-95 text-azul-oscuro font-semibold rounded-lg px-4 py-2.5 text-sm transition disabled:opacity-50"
        >
          {trabajando === 'seed' ? 'Cargando…' : 'Cargar datos de ejemplo'}
        </button>
        {totalRegistros > 0 && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Ya tenés datos cargados — para usar el ejemplo borralo todo primero.
          </p>
        )}
      </div>

      {/* Zona peligrosa */}
      <div className="bg-rojo/5 border border-rojo/20 rounded-xl p-5">
        <h2 className="font-semibold text-rojo">Zona peligrosa</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
          Borra TODOS tus datos del dispositivo. La biblioteca de ejercicios queda intacta.
        </p>
        <button
          type="button"
          onClick={() => setBorrarAbierto(true)}
          className="w-full bg-white dark:bg-slate-900 hover:bg-rojo/10 border border-rojo text-rojo font-semibold rounded-lg px-4 py-2.5 text-sm transition"
        >
          🗑  Borrar todos mis datos
        </button>
      </div>

      <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 px-4 pb-4">
        Stats SB · M15 TLTC · v0.1 · Todos los datos viven en este dispositivo
      </p>

      {/* Modales */}
      <ImportarModal
        abierto={importarAbierto}
        onCerrar={() => setImportarAbierto(false)}
        onImportado={(_b, modo) => {
          setImportarAbierto(false);
          mostrar({
            tipo: 'exito',
            mensaje: modo === 'reemplazar' ? 'Datos reemplazados con el backup' : 'Backup sumado a tus datos',
          });
        }}
      />
      <BorrarConfirmacion
        abierto={borrarAbierto}
        onCerrar={() => setBorrarAbierto(false)}
        onBorrado={() => {
          setBorrarAbierto(false);
          mostrar({ tipo: 'exito', mensaje: 'Todos los datos fueron borrados' });
        }}
      />
    </div>
  );
}

function Fila({ label, v, destacado }: { label: string; v: number; destacado?: boolean }) {
  return (
    <li
      className={[
        'flex items-center justify-between px-3 py-2 rounded-lg',
        destacado
          ? 'bg-azul-principal/5 dark:bg-azul-principal/20 border border-azul-principal/20'
          : 'bg-slate-50 dark:bg-slate-800/50',
      ].join(' ')}
    >
      <span className={['text-slate-600 dark:text-slate-300', destacado && 'font-semibold'].filter(Boolean).join(' ')}>
        {label}
      </span>
      <span className={['font-bold tabular-nums', destacado && 'text-azul-principal dark:text-amarillo-acento'].filter(Boolean).join(' ')}>
        {v}
      </span>
    </li>
  );
}

function calcularEdad(fechaNacISO: string): number {
  const nac = new Date(fechaNacISO);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}
