import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
} from 'recharts';
import { db } from '../db/schema';
import { formatoLargo, hace, formatoCorto } from '../lib/fechas';
import {
  epley1RM,
  etiquetaKind,
  formatearMmSs,
  formatearValor,
  serieEvolucion,
  menorEsMejor,
} from '../lib/fisico';
import { ChartCard } from '../components/ChartCard';
import { IconoFlechaIzq } from '../components/icons';

export function VerTest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const test = useLiveQuery(() => (id ? db.tests_fisicos.get(id) : undefined), [id]);
  const todos = useLiveQuery(() => db.tests_fisicos.toArray(), [], []);

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

  const serie = serieEvolucion(todos, test.kind);
  const menor = menorEsMejor(test.kind);

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
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {etiquetaKind(test.kind)}
            {test.fueRecord && (
              <span className="ml-2 text-[11px] font-bold uppercase bg-verde-record text-white px-1.5 py-0.5 rounded align-middle">
                🏆 PR
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {formatoLargo(test.fecha)} · {hace(test.fecha)}
          </p>
        </div>
      </div>

      {/* Detalles */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <h2 className="font-semibold mb-3">Resultado</h2>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          <Fila label="Valor" valor={formatearValor(test)} />
          {(test.kind === 'sentadilla' || test.kind === 'press_banca') &&
            test.pesoKg !== undefined &&
            test.reps !== undefined && (
              <Fila
                label="1RM estimado"
                valor={`${Math.round(epley1RM(test.pesoKg, test.reps))} kg`}
              />
            )}
          {test.kind === 'bronco' && test.segundos !== undefined && (
            <Fila label="Total" valor={formatearMmSs(test.segundos)} />
          )}
          <Fila label="Sensación física" valor={`${test.sensacionFisico}/5`} />
          <Fila label="RPE (esfuerzo)" valor={`${test.rpe}/5`} />
        </ul>
      </div>

      {/* Gráfica de evolución del kind */}
      {serie.length >= 2 && (
        <ChartCard
          titulo={`Evolución · ${etiquetaKind(test.kind)}`}
          subtitulo={`${serie.length} tests · ${menor ? 'menor es mejor' : 'mayor es mejor'}`}
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={serie} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis
                  dataKey="fecha"
                  tickFormatter={formatoCorto}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  stroke="currentColor"
                  className="text-slate-500 dark:text-slate-400"
                />
                <YAxis
                  domain={['auto', 'auto']}
                  reversed={menor}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  stroke="currentColor"
                  className="text-slate-500 dark:text-slate-400"
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }}
                  labelFormatter={(v) => formatoCorto(String(v))}
                  formatter={(_v: number, _k, item) => {
                    const e = (item?.payload as { etiqueta?: string })?.etiqueta;
                    return [e ?? '', etiquetaKind(test.kind)];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="#1B3A6B"
                  strokeWidth={2.5}
                  dot={(props: {
                    cx?: number;
                    cy?: number;
                    payload?: { esRecord?: boolean };
                    index?: number;
                  }) => {
                    const cx = props.cx ?? 0;
                    const cy = props.cy ?? 0;
                    const pr = props.payload?.esRecord;
                    return (
                      <circle
                        key={props.index}
                        cx={cx}
                        cy={cy}
                        r={pr ? 6 : 4}
                        fill={pr ? '#5AB05B' : '#F5B700'}
                        stroke="#1B3A6B"
                        strokeWidth={2}
                      />
                    );
                  }}
                  activeDot={{ r: 7 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Los puntos verdes 🟢 son récords (PR) — cada vez que batiste tu marca.
          </p>
        </ChartCard>
      )}

      {test.notas && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="font-semibold mb-1">Notas</h2>
          <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line">{test.notas}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          to={`/fisico/${test.id}/editar`}
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
      <span className="text-sm font-bold tabular-nums">{valor}</span>
    </li>
  );
}
