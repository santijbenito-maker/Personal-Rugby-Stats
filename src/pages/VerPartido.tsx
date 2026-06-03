import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { formatoLargo, hace } from '../lib/fechas';
import { ResumenPartido } from '../components/ResumenPartido';
import { VideosPartido } from '../components/VideosPartido';
import { IconoFlechaIzq, IconoRivales } from '../components/icons';
import { eliminarVideosDePartido } from '../lib/videos';
import { buscarRivalPorNombre } from '../lib/scouting';

export function VerPartido() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const partido = useLiveQuery(() => (id ? db.partidos.get(id) : undefined), [id]);
  const rivales = useLiveQuery(() => db.rivales.toArray(), [], []);

  if (partido === undefined) {
    return (
      <div className="max-w-md mx-auto text-center py-12 text-slate-500 dark:text-slate-400">
        Cargando…
      </div>
    );
  }
  if (partido === null) {
    return <PartidoNoEncontrado />;
  }
  if (!partido) return <PartidoNoEncontrado />;

  const handleBorrar = async () => {
    if (!confirm(`¿Borrar el partido vs ${partido.rival}? También se borran sus videos.`)) return;
    await eliminarVideosDePartido(partido.id);
    await db.partidos.delete(partido.id);
    navigate('/partidos');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">
      {/* Cabecera con botón volver */}
      <div className="flex items-center gap-3">
        <Link
          to="/partidos"
          aria-label="Volver a partidos"
          className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
        >
          <IconoFlechaIzq size={22} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
            vs {partido.rival}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {formatoLargo(partido.fecha)} · {hace(partido.fecha)}
          </p>
        </div>
      </div>

      {/* Atajo a la ficha de scouting del rival (si existe) o a crear una */}
      <ScoutingLink rivalNombre={partido.rival} rivalIdExistente={
        buscarRivalPorNombre(rivales, partido.rival)?.id
      } />

      {/* Resumen completo */}
      <ResumenPartido partido={partido} />

      {/* Videos del partido */}
      <VideosPartido partidoId={partido.id} />

      {/* Notas (si hay alguna) */}
      {(partido.notasBien || partido.notasMejorar || partido.notasEntrenador) && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <h2 className="font-semibold">Notas</h2>
          {partido.notasBien && (
            <NotaBloque titulo="Qué hice bien" hint="✅" texto={partido.notasBien} />
          )}
          {partido.notasMejorar && (
            <NotaBloque titulo="Qué puedo mejorar" hint="📈" texto={partido.notasMejorar} />
          )}
          {partido.notasEntrenador && (
            <NotaBloque
              titulo="Notas del entrenador"
              hint="💬"
              texto={partido.notasEntrenador}
            />
          )}
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-3">
        <Link
          to={`/partidos/${partido.id}/editar`}
          className="flex-1 text-center px-4 py-2.5 rounded-lg bg-azul-principal hover:bg-azul-oscuro text-white font-semibold transition"
        >
          ✏ Editar
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

/**
 * Atajo para ir a la ficha de scouting del rival. Si ya existe, te lleva al
 * detalle. Si no, abre el form de nuevo rival con el nombre pre-cargado.
 */
function ScoutingLink({
  rivalNombre,
  rivalIdExistente,
}: {
  rivalNombre: string;
  rivalIdExistente?: string;
}) {
  if (!rivalNombre) return null;
  const destino = rivalIdExistente
    ? `/rivales/${rivalIdExistente}`
    : `/rivales/nuevo?nombre=${encodeURIComponent(rivalNombre)}`;
  return (
    <Link
      to={destino}
      className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2.5 hover:border-azul-principal/40 transition"
    >
      <div className="flex items-center gap-2 min-w-0">
        <IconoRivales size={18} className="text-azul-principal dark:text-amarillo-acento shrink-0" />
        <span className="text-sm font-medium truncate">
          {rivalIdExistente
            ? `Ver scouting de ${rivalNombre}`
            : `Cargar scouting de ${rivalNombre}`}
        </span>
      </div>
      <span className="text-slate-400 text-sm shrink-0">→</span>
    </Link>
  );
}

function NotaBloque({ titulo, hint, texto }: { titulo: string; hint: string; texto: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
        <span className="mr-1">{hint}</span>
        {titulo}
      </p>
      <p className="mt-1 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line">
        {texto}
      </p>
    </div>
  );
}

function PartidoNoEncontrado() {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <p className="text-xl font-bold">Partido no encontrado</p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Puede que lo hayas borrado o que el link sea inválido.
      </p>
      <Link
        to="/partidos"
        className="mt-6 inline-flex bg-azul-principal hover:bg-azul-oscuro text-white font-semibold px-4 py-2 rounded-lg transition"
      >
        Volver a partidos
      </Link>
    </div>
  );
}
