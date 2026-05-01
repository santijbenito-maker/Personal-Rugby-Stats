import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { formatoLargo, hace } from '../lib/fechas';
import { ResumenEntreno } from '../components/ResumenEntreno';
import { IconoFlechaIzq } from '../components/icons';

export function VerEntreno() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const entreno = useLiveQuery(() => (id ? db.entrenamientos.get(id) : undefined), [id]);

  if (entreno === undefined) {
    return (
      <div className="max-w-md mx-auto text-center py-12 text-slate-500 dark:text-slate-400">
        Cargando…
      </div>
    );
  }
  if (!entreno) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-xl font-bold">Entrenamiento no encontrado</p>
        <Link
          to="/entrenos"
          className="mt-6 inline-flex bg-azul-principal hover:bg-azul-oscuro text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Volver a entrenamientos
        </Link>
      </div>
    );
  }

  const handleBorrar = async () => {
    if (!confirm('¿Borrar este entrenamiento?')) return;
    await db.entrenamientos.delete(entreno.id);
    navigate('/entrenos');
  };

  // Compat con datos viejos: si todavía tienen "tipo" en lugar de "tipos".
  const conTipoViejo = entreno as typeof entreno & { tipo?: string };
  const tipos =
    entreno.tipos && entreno.tipos.length > 0
      ? entreno.tipos
      : conTipoViejo.tipo
        ? [conTipoViejo.tipo]
        : ['Técnico'];

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">
      <div className="flex items-center gap-3">
        <Link
          to="/entrenos"
          aria-label="Volver"
          className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
        >
          <IconoFlechaIzq size={22} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
            {tipos.join(' + ')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {formatoLargo(entreno.fecha)} · {hace(entreno.fecha)}
          </p>
        </div>
      </div>

      <ResumenEntreno entreno={entreno} />

      <div className="flex gap-3">
        <Link
          to={`/entrenos/${entreno.id}/editar`}
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
