import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { LesionCard } from '../components/LesionCard';
import { MetricCard } from '../components/MetricCard';
import { IconoMas, IconoLesiones } from '../components/icons';
import { lesionesActivas, lesionesDelAño } from '../lib/fisico';

export function Lesiones() {
  const lesiones = useLiveQuery(
    () => db.lesiones.orderBy('fecha').reverse().toArray(),
    [],
    [],
  );

  const activas = lesionesActivas(lesiones);
  const delAño = lesionesDelAño(lesiones);
  const añoActual = new Date().getFullYear();

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Título */}
      <div>
        <div className="flex items-center gap-3">
          <span className="inline-block w-1 h-7 bg-amarillo-acento rounded-full" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Lesiones</h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 ml-4">
          Seguimiento y recuperación
        </p>
      </div>

      {/* "Todo sano" o métricas */}
      {activas.length === 0 ? (
        <TodoSanoCard cantidadAño={delAño.length} año={añoActual} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Activas" valor={activas.length} color="rojo" />
          <MetricCard label={`Año ${añoActual}`} valor={delAño.length} color="azul" />
        </div>
      )}

      {/* Botón cargar */}
      <Link
        to="/lesiones/nueva"
        className="flex items-center justify-center gap-2 w-full bg-amarillo-acento hover:brightness-95 text-azul-oscuro font-bold rounded-xl px-4 py-3.5 shadow-tarjeta transition"
      >
        <IconoMas size={22} strokeWidth={2.5} />
        Registrar lesión
      </Link>

      {/* Lista (incluye recuperadas) o empty state */}
      {lesiones.length === 0 ? (
        <EmptyStateLesiones />
      ) : (
        <div className="space-y-3">
          {lesiones.map((l) => (
            <LesionCard key={l.id} lesion={l} />
          ))}
        </div>
      )}
    </div>
  );
}

function TodoSanoCard({ cantidadAño, año }: { cantidadAño: number; año: number }) {
  return (
    <div className="bg-verde-claro border border-verde-record/25 rounded-xl p-5 flex items-center gap-4">
      <span className="text-4xl" aria-hidden>
        💚
      </span>
      <div>
        <p className="font-bold text-verde-record text-lg">Todo sano</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
          No tenés lesiones activas. {cantidadAño === 0
            ? `Ninguna registrada en ${año}.`
            : `${cantidadAño} registrada${cantidadAño === 1 ? '' : 's'} en ${año}.`}
        </p>
      </div>
    </div>
  );
}

function EmptyStateLesiones() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amarillo-claro dark:bg-amarillo-acento/10 text-azul-principal dark:text-amarillo-acento">
        <IconoLesiones size={28} />
      </div>
      <h2 className="mt-3 font-semibold">No tenés lesiones registradas</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
        Si te lesionás, registralo acá para llevar el seguimiento del tratamiento y los días sin
        jugar.
      </p>
    </div>
  );
}
