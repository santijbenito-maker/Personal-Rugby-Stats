import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { formatoLargo, hace, hoyISO } from '../lib/fechas';
import { diasPerdidos, esActiva } from '../lib/fisico';
import { IconoFlechaIzq } from '../components/icons';
import { useToast } from '../components/Toaster';

export function VerLesion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mostrar } = useToast();
  const [marcando, setMarcando] = useState(false);
  const lesion = useLiveQuery(() => (id ? db.lesiones.get(id) : undefined), [id]);

  if (lesion === undefined) {
    return (
      <div className="max-w-md mx-auto text-center py-12 text-slate-500 dark:text-slate-400">
        Cargando…
      </div>
    );
  }
  if (!lesion) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-xl font-bold">Lesión no encontrada</p>
        <Link
          to="/lesiones"
          className="mt-6 inline-flex bg-azul-principal hover:bg-azul-oscuro text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Volver
        </Link>
      </div>
    );
  }

  const activa = esActiva(lesion);
  const dias = diasPerdidos(lesion);

  const handleMarcarRecuperado = async () => {
    setMarcando(true);
    try {
      await db.lesiones.update(lesion.id, {
        fechaAlta: hoyISO(),
        actualizadoEn: Date.now(),
      });
      mostrar({ tipo: 'exito', mensaje: '¡Recuperado! Buena, a darle de nuevo.' });
    } finally {
      setMarcando(false);
    }
  };

  const handleBorrar = async () => {
    if (!confirm('¿Borrar este registro de lesión?')) return;
    await db.lesiones.delete(lesion.id);
    navigate('/lesiones');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">
      <div className="flex items-center gap-3">
        <Link
          to="/lesiones"
          aria-label="Volver"
          className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
        >
          <IconoFlechaIzq size={22} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
            {lesion.zona}{lesion.lado !== 'No aplica' ? ` · ${lesion.lado}` : ''}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {formatoLargo(lesion.fecha)} · {hace(lesion.fecha)}
          </p>
        </div>
      </div>

      {/* Estado destacado */}
      {activa ? (
        <div className="bg-rojo/10 border border-rojo/30 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl" aria-hidden>🩹</span>
          <div className="flex-1">
            <p className="font-bold text-rojo">Lesión activa</p>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              {dias} día{dias === 1 ? '' : 's'} desde la lesión · estimados {lesion.diasEstimados}
            </p>
          </div>
          <button
            type="button"
            onClick={handleMarcarRecuperado}
            disabled={marcando}
            className="bg-verde-record hover:brightness-95 text-white text-xs font-bold px-3 py-2 rounded-lg shadow transition disabled:opacity-50"
          >
            Marcar como recuperado
          </button>
        </div>
      ) : (
        <div className="bg-verde-claro border border-verde-record/30 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl" aria-hidden>💚</span>
          <div>
            <p className="font-bold text-verde-record">Recuperado</p>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              {dias} día{dias === 1 ? '' : 's'} sin jugar · alta {lesion.fechaAlta && hace(lesion.fechaAlta)}
            </p>
          </div>
        </div>
      )}

      {/* Detalles */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <h2 className="font-semibold mb-3">Detalle</h2>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          <Fila
            label="Tipo"
            valor={
              lesion.tipo === 'Otro' && lesion.tipoOtro
                ? `Otro · ${lesion.tipoOtro}`
                : lesion.tipo
            }
          />
          <Fila label="Gravedad" valor={lesion.gravedad} />
          <Fila label="Días estimados" valor={`${lesion.diasEstimados}`} />
          <Fila label="Días perdidos" valor={`${dias}`} />
          {lesion.fechaAlta && <Fila label="Fecha de alta" valor={formatoLargo(lesion.fechaAlta)} />}
        </ul>
      </div>

      {(lesion.tratamiento || lesion.notas) && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          {lesion.tratamiento && (
            <div>
              <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                🩹 Tratamiento
              </h3>
              <p className="mt-1 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line">
                {lesion.tratamiento}
              </p>
            </div>
          )}
          {lesion.notas && (
            <div>
              <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                📝 Notas
              </h3>
              <p className="mt-1 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line">
                {lesion.notas}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Link
          to={`/lesiones/${lesion.id}/editar`}
          className="flex-1 text-center px-4 py-2.5 rounded-lg bg-azul-principal hover:bg-azul-oscuro text-white font-semibold transition"
        >
          Editar
        </Link>
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

function Fila({ label, valor }: { label: string; valor: string }) {
  return (
    <li className="flex items-center justify-between py-2.5">
      <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
      <span className="text-sm font-bold">{valor}</span>
    </li>
  );
}
