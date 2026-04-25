import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  Line,
} from 'recharts';
import { db } from '../db/schema';
import { MetricCard } from '../components/MetricCard';
import { ChartCard } from '../components/ChartCard';
import { TestFisicoCard } from '../components/TestFisicoCard';
import { IconoMas, IconoFisico } from '../components/icons';
import { ultimoTest, deltaMetrica, seriePeso } from '../lib/fisico';
import { formatoCorto } from '../lib/fechas';

export function Fisico() {
  const tests = useLiveQuery(
    () => db.tests_fisicos.orderBy('fecha').reverse().toArray(),
    [],
    [],
  );

  const ult = ultimoTest(tests);
  const deltaPeso = deltaMetrica(tests, (t) => t.pesoCorporal, 30);
  const deltaAltura = deltaMetrica(tests, (t) => t.altura, 365);
  const deltaT40 = deltaMetrica(tests, (t) => t.t40m, 30);
  const puntosPeso = seriePeso(tests);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Título */}
      <div>
        <div className="flex items-center gap-3">
          <span className="inline-block w-1 h-7 bg-amarillo-acento rounded-full" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Físico</h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 ml-4">
          {tests.length > 0
            ? `${tests.length} test${tests.length === 1 ? '' : 's'} cargado${tests.length === 1 ? '' : 's'}`
            : 'Registrá tus tests físicos y mediciones'}
        </p>
      </div>

      {/* Métricas 2x2 (si hay un último test) */}
      {ult && (
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Peso"
            valor={ult.pesoCorporal ?? '—'}
            sufijo={ult.pesoCorporal !== undefined ? 'kg' : undefined}
            color="azul"
            delta={deltaPeso ?? undefined}
          />
          <MetricCard
            label="Altura"
            valor={ult.altura !== undefined ? (ult.altura / 100).toFixed(2) : '—'}
            sufijo={ult.altura !== undefined ? 'm' : undefined}
            color="amarillo"
            delta={deltaAltura ?? undefined}
          />
          <MetricCard
            label="40m"
            valor={ult.t40m ?? '—'}
            sufijo={ult.t40m !== undefined ? 's' : undefined}
            color="azul"
            delta={deltaT40 ?? undefined}
          />
          <MetricCard
            label="Beep test"
            valor={ult.beepTest ?? '—'}
            sufijo={ult.beepTest !== undefined ? 'nivel' : undefined}
            color="verde"
          />
        </div>
      )}

      {/* Botón cargar */}
      <Link
        to="/fisico/nuevo"
        className="flex items-center justify-center gap-2 w-full bg-amarillo-acento hover:brightness-95 text-azul-oscuro font-bold rounded-xl px-4 py-3.5 shadow-tarjeta transition"
      >
        <IconoMas size={22} strokeWidth={2.5} />
        Nuevo test físico
      </Link>

      {/* Gráfico de evolución del peso */}
      {puntosPeso.length >= 2 && (
        <ChartCard titulo="Evolución del peso corporal" subtitulo={`${puntosPeso.length} mediciones`}>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={puntosPeso} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPeso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1B3A6B" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#1B3A6B" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis
                  dataKey="fecha"
                  tickFormatter={formatoCorto}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  stroke="currentColor"
                  className="text-slate-500 dark:text-slate-400"
                />
                <YAxis
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  stroke="currentColor"
                  className="text-slate-500 dark:text-slate-400"
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }}
                  labelFormatter={(v) => formatoCorto(String(v))}
                  formatter={(v: number) => [`${v} kg`, 'Peso']}
                />
                <Area type="monotone" dataKey="peso" stroke="none" fill="url(#gradPeso)" />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#1B3A6B"
                  strokeWidth={2.5}
                  dot={{ fill: '#F5B700', stroke: '#1B3A6B', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {/* Lista o empty state */}
      {tests.length === 0 ? (
        <EmptyStateFisico />
      ) : (
        <div className="space-y-3">
          {tests.map((t) => (
            <TestFisicoCard key={t.id} test={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyStateFisico() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amarillo-claro dark:bg-amarillo-acento/10 text-azul-principal dark:text-amarillo-acento">
        <IconoFisico size={28} />
      </div>
      <h2 className="mt-3 font-semibold">Todavía no cargaste tests</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
        Los tests te permiten ver cómo evoluciona tu peso, altura, velocidad en 40m y resistencia
        en el tiempo.
      </p>
    </div>
  );
}
