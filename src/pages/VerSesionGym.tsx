import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { formatoLargo, hace } from '../lib/fechas';
import { ResumenSesionGym } from '../components/ResumenSesionGym';
import { mejorSetDeEjercicio } from '../lib/gym';
import { IconoFlechaIzq } from '../components/icons';

export function VerSesionGym() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sesion = useLiveQuery(() => (id ? db.gym_sesiones.get(id) : undefined), [id]);
  const ejercicios = useLiveQuery(() => db.gym_ejercicios.toArray(), [], []);

  if (sesion === undefined) {
    return (
      <div className="max-w-md mx-auto text-center py-12 text-slate-500 dark:text-slate-400">
        Cargando…
      </div>
    );
  }
  if (!sesion) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-xl font-bold">Sesión no encontrada</p>
        <Link
          to="/gym"
          className="mt-6 inline-flex bg-azul-principal hover:bg-azul-oscuro text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Volver a gym
        </Link>
      </div>
    );
  }

  const handleBorrar = async () => {
    if (!confirm('¿Borrar esta sesión de gym?')) return;
    await db.gym_sesiones.delete(sesion.id);
    navigate('/gym');
  };

  const mapa = new Map(ejercicios.map((e) => [e.id, e]));

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">
      <div className="flex items-center gap-3">
        <Link
          to="/gym"
          aria-label="Volver"
          className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
        >
          <IconoFlechaIzq size={22} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">{sesion.foco}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {formatoLargo(sesion.fecha)} · {hace(sesion.fecha)}
          </p>
        </div>
      </div>

      <ResumenSesionGym sesion={sesion} ejercicios={ejercicios} />

      {/* Detalle de cada ejercicio con todas sus series */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <h2 className="font-semibold">Detalle por ejercicio</h2>
        {sesion.ejercicios.map((ej, i) => {
          const def = mapa.get(ej.ejercicioId);
          const top = mejorSetDeEjercicio(ej);
          return (
            <div key={i} className="border-t border-slate-100 dark:border-slate-800 pt-3 first:border-t-0 first:pt-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="font-semibold">
                  {def?.nombre ?? 'Ejercicio'}
                  {ej.fueRecord && (
                    <span className="ml-2 text-[10px] font-bold uppercase bg-verde-record text-white px-1.5 py-0.5 rounded">
                      🏆 PR
                    </span>
                  )}
                </p>
                {top && top.peso > 0 && (
                  <p className="text-sm font-bold text-azul-principal dark:text-amarillo-acento tabular-nums">
                    Top: {top.peso} kg × {top.reps}
                  </p>
                )}
              </div>
              <ul className="space-y-1">
                {ej.series.map((s, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-md"
                  >
                    <span className="text-slate-600 dark:text-slate-400">Serie {idx + 1}</span>
                    <span className="font-medium tabular-nums">
                      {s.peso > 0 ? `${s.peso} kg × ` : ''}
                      {s.reps} reps
                      {s.rir !== undefined && (
                        <span className="text-xs text-slate-500 ml-2">RIR {s.rir}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleBorrar}
          className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-rojo/5 border border-rojo text-rojo font-semibold transition"
        >
          Borrar
        </button>
      </div>
    </div>
  );
}
