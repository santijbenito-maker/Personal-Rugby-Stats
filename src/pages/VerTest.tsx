import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { formatoLargo, hace } from '../lib/fechas';
import { IconoFlechaIzq } from '../components/icons';

export function VerTest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const test = useLiveQuery(() => (id ? db.tests_fisicos.get(id) : undefined), [id]);

  if (test === undefined) {
    return (
      <div className="max-w-md mx-auto text-center py-12 text-slate-500 dark:text-slate-400">
        Cargando…
      </div>
    );
  }
  if (!test) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-xl font-bold">Test no encontrado</p>
        <Link
          to="/fisico"
          className="mt-6 inline-flex bg-azul-principal hover:bg-azul-oscuro text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Volver a Físico
        </Link>
      </div>
    );
  }

  const handleBorrar = async () => {
    if (!confirm('¿Borrar este test?')) return;
    await db.tests_fisicos.delete(test.id);
    navigate('/fisico');
  };

  const filas: { label: string; valor?: string }[] = [
    test.pesoCorporal !== undefined ? { label: 'Peso corporal', valor: `${test.pesoCorporal} kg` } : { label: 'Peso corporal' },
    test.altura !== undefined ? { label: 'Altura', valor: `${test.altura} cm` } : { label: 'Altura' },
    test.t40m !== undefined ? { label: '40 metros', valor: `${test.t40m} s` } : { label: '40 metros' },
    test.beepTest !== undefined ? { label: 'Beep test / Yo-Yo', valor: `nivel ${test.beepTest}` } : { label: 'Beep test / Yo-Yo' },
    test.flexiones !== undefined ? { label: 'Flexiones / min', valor: `${test.flexiones}` } : { label: 'Flexiones / min' },
    test.abdominales !== undefined ? { label: 'Abdominales / min', valor: `${test.abdominales}` } : { label: 'Abdominales / min' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">
      <div className="flex items-center gap-3">
        <Link
          to="/fisico"
          aria-label="Volver"
          className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
        >
          <IconoFlechaIzq size={22} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Test físico</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {formatoLargo(test.fecha)} · {hace(test.fecha)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <h2 className="font-semibold mb-3">Mediciones</h2>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {filas.map((f) => (
            <li key={f.label} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-slate-600 dark:text-slate-300">{f.label}</span>
              <span className={['text-sm font-bold tabular-nums', f.valor ? '' : 'text-slate-400'].join(' ')}>
                {f.valor ?? 'Sin medir'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {test.notas && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="font-semibold mb-1">Notas</h2>
          <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line">{test.notas}</p>
        </div>
      )}

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
