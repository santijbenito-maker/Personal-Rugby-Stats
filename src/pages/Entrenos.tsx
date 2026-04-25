import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { EntrenoCard } from '../components/EntrenoCard';
import { MetricCard } from '../components/MetricCard';
import { IconoMas, IconoEntrenos } from '../components/icons';
import {
  metricaSesionesEntreno,
  metricaAsistencia,
  calcularRacha,
} from '../lib/calculos';

export function Entrenos() {
  const entrenos = useLiveQuery(
    () => db.entrenamientos.orderBy('fecha').reverse().toArray(),
    [],
    [],
  );
  const gym = useLiveQuery(() => db.gym_sesiones.toArray(), [], []);

  const sesiones = metricaSesionesEntreno(entrenos);
  const asistencia = metricaAsistencia(entrenos);
  const racha = calcularRacha(entrenos, gym);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Título */}
      <div>
        <div className="flex items-center gap-3">
          <span className="inline-block w-1 h-7 bg-amarillo-acento rounded-full" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Entrenos</h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 ml-4">
          {entrenos.length > 0
            ? `${entrenos.length} sesi${entrenos.length === 1 ? 'ón' : 'ones'} cargada${entrenos.length === 1 ? '' : 's'}`
            : 'Registrá cada entrenamiento'}
        </p>
      </div>

      {/* Métricas arriba */}
      {entrenos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label="Sesiones del mes"
            valor={sesiones.valor}
            color="azul"
            delta={sesiones.delta}
          />
          <MetricCard
            label="% asistencia"
            valor={asistencia ?? '—'}
            sufijo={asistencia !== null ? '%' : undefined}
            color="amarillo"
          />
          <MetricCard label="Racha" valor={racha} sufijo="días" color="verde" />
        </div>
      )}

      {/* Botón cargar */}
      <Link
        to="/entrenos/nuevo"
        className="flex items-center justify-center gap-2 w-full bg-amarillo-acento hover:brightness-95 text-azul-oscuro font-bold rounded-xl px-4 py-3.5 shadow-tarjeta transition"
      >
        <IconoMas size={22} strokeWidth={2.5} />
        Registrar entrenamiento
      </Link>

      {/* Lista o empty state */}
      {entrenos.length === 0 ? (
        <EmptyStateEntrenos />
      ) : (
        <div className="space-y-3">
          {entrenos.map((e) => (
            <EntrenoCard key={e.id} entreno={e} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyStateEntrenos() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amarillo-claro dark:bg-amarillo-acento/10 text-azul-principal dark:text-amarillo-acento">
        <IconoEntrenos size={28} />
      </div>
      <h2 className="mt-3 font-semibold">Todavía no cargaste entrenamientos</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
        Empezá a registrarlos para hacer crecer tu racha y ver el progreso en el dashboard.
      </p>
    </div>
  );
}
