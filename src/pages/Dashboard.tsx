import { useLiveQuery } from 'dexie-react-hooks';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  ComposedChart,
} from 'recharts';
import { db } from '../db/schema';
import { MetricCard } from '../components/MetricCard';
import { ChartCard } from '../components/ChartCard';
import { DashboardVacio } from '../components/DashboardVacio';
import {
  metricaPartidos,
  metricaTries,
  metricaTackles,
  metricaPRs,
  calcularRacha,
  prReciente,
  ratingUltimos,
  progresionEjercicio,
  progresoDeEjercicio,
  buscarEjercicioPorNombre,
  ultimasActividades,
  hacen,
} from '../lib/calculos';
import { formatoCorto, hace } from '../lib/fechas';

export function Dashboard() {
  const partidos = useLiveQuery(() => db.partidos.toArray(), [], []);
  const entrenos = useLiveQuery(() => db.entrenamientos.toArray(), [], []);
  const gym = useLiveQuery(() => db.gym_sesiones.toArray(), [], []);
  const ejercicios = useLiveQuery(() => db.gym_ejercicios.toArray(), [], []);

  const hayDatos =
    (partidos?.length ?? 0) + (entrenos?.length ?? 0) + (gym?.length ?? 0) > 0;

  if (!hayDatos) return <DashboardVacio />;

  const mPartidos = metricaPartidos(partidos);
  const mTries = metricaTries(partidos);
  const mTackles = metricaTackles(partidos);
  const mPRs = metricaPRs(gym);
  const racha = calcularRacha(entrenos, gym);
  const pr = prReciente(gym, ejercicios);

  const sentadilla = buscarEjercicioPorNombre(ejercicios, 'Sentadilla');
  const pressBanca = buscarEjercicioPorNombre(ejercicios, 'Press banca');
  const rating8 = ratingUltimos(partidos, 8);
  const progSentadilla = sentadilla ? progresionEjercicio(gym, sentadilla.id) : [];
  const progBanca = pressBanca ? progresionEjercicio(gym, pressBanca.id) : [];
  const resumenSent = sentadilla ? progresoDeEjercicio(gym, sentadilla.id) : null;
  const resumenBanca = pressBanca ? progresoDeEjercicio(gym, pressBanca.id) : null;
  const actividades = ultimasActividades(partidos, entrenos, gym, 4);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Título */}
      <div>
        <div className="flex items-center gap-3">
          <span className="inline-block w-1 h-7 bg-amarillo-acento rounded-full" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Inicio</h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 ml-4">Resumen de tu progreso</p>
      </div>

      {/* PR reciente (últimos 7 días) */}
      {pr && <TarjetaPR pr={pr} />}

      {/* Métricas 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Partidos del mes" valor={mPartidos.valor} color="azul" delta={mPartidos.delta} />
        <MetricCard label="Tries totales" valor={mTries.valor} color="amarillo" delta={mTries.delta} />
        <MetricCard label="Tackles" valor={mTackles.valor} color="azul" delta={mTackles.delta} />
        <MetricCard label="PR del mes" valor={mPRs.valor} color="verde" delta={mPRs.delta} />
      </div>

      {/* Racha */}
      {racha > 0 && <BadgeRacha dias={racha} />}

      {/* Gráfico rating */}
      {rating8.length > 0 && (
        <ChartCard
          titulo="Evolución del rating"
          subtitulo={`Últimos ${rating8.length} partidos`}
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rating8} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis
                  dataKey="fecha"
                  tickFormatter={formatoCorto}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  stroke="currentColor"
                  className="text-slate-500 dark:text-slate-400"
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  stroke="currentColor"
                  className="text-slate-500 dark:text-slate-400"
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }}
                  labelFormatter={(v) => `Fecha: ${formatoCorto(String(v))}`}
                  formatter={(v: number, _n, p) => [`${v}/10`, `vs ${p.payload.rival}`]}
                />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#1B3A6B"
                  strokeWidth={2.5}
                  dot={{ fill: '#F5B700', stroke: '#1B3A6B', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {/* Gráfico sentadilla */}
      {sentadilla && progSentadilla.length > 0 && resumenSent && (
        <ChartCard
          titulo="🦵 Progreso sentadilla"
          subtitulo="Peso máximo por sesión"
          badge={
            <span className="bg-verde-record text-white text-xs font-bold px-2.5 py-1 rounded-full">
              PR: {resumenSent.pesoActual} kg
            </span>
          }
        >
          <GraficoProgresion datos={progSentadilla} />
          <StatsProgreso resumen={resumenSent} />
        </ChartCard>
      )}

      {/* Gráfico press banca */}
      {pressBanca && progBanca.length > 0 && resumenBanca && (
        <ChartCard
          titulo="💪 Progreso press banca"
          subtitulo="Peso máximo por sesión"
          badge={
            <span className="bg-verde-record text-white text-xs font-bold px-2.5 py-1 rounded-full">
              PR: {resumenBanca.pesoActual} kg
            </span>
          }
        >
          <GraficoProgresion datos={progBanca} />
          <StatsProgreso resumen={resumenBanca} />
        </ChartCard>
      )}

      {/* Últimas actividades */}
      {actividades.length > 0 && (
        <ChartCard titulo="Últimas actividades" subtitulo="Lo más reciente">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {actividades.map((a, i) => (
              <li key={i} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{a.descripcion}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatoCorto(a.fecha)} · {hace(a.fecha)}
                  </p>
                </div>
                <BadgeTipo tipo={a.tipo} />
              </li>
            ))}
          </ul>
        </ChartCard>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Subcomponentes del dashboard
// ───────────────────────────────────────────────────────────────

function TarjetaPR({ pr }: { pr: NonNullable<ReturnType<typeof prReciente>> }) {
  return (
    <div className="bg-verde-claro border border-verde-record/25 rounded-xl p-4 flex items-start gap-3">
      <span className="text-3xl leading-none" aria-hidden>
        🏆
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-verde-record">
          ¡Nuevo récord en {pr.ejercicioNombre}!
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5">
          {pr.peso} kg × {pr.reps} reps
          {pr.pesoAnterior > 0 && (
            <>
              {' '}· superaste tu PR anterior de <strong>{pr.pesoAnterior} kg</strong>
            </>
          )}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {hace(pr.fecha)}{hacen(pr.fecha) === 0 ? '' : ` · ${formatoCorto(pr.fecha)}`}
        </p>
      </div>
    </div>
  );
}

function BadgeRacha({ dias }: { dias: number }) {
  return (
    <div className="bg-azul-principal text-white rounded-xl px-4 py-3 flex items-center gap-3">
      <span className="text-2xl" aria-hidden>🔥</span>
      <div>
        <p className="font-semibold text-sm md:text-base">{dias} {dias === 1 ? 'día' : 'días'} seguidos entrenando</p>
        <p className="text-xs text-amarillo-claro/80">¡Seguí así!</p>
      </div>
    </div>
  );
}

function GraficoProgresion({ datos }: { datos: { fecha: string; peso: number }[] }) {
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={datos} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="gradienteAmarillo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5B700" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#F5B700" stopOpacity={0.02} />
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
            tick={{ fontSize: 11, fill: 'currentColor' }}
            stroke="currentColor"
            className="text-slate-500 dark:text-slate-400"
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }}
            labelFormatter={(v) => formatoCorto(String(v))}
            formatter={(v: number) => [`${v} kg`, 'Peso']}
          />
          <Area type="monotone" dataKey="peso" stroke="none" fill="url(#gradienteAmarillo)" />
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
  );
}

function StatsProgreso({ resumen }: { resumen: { pesoInicial: number; pesoActual: number; progresoPct: number } }) {
  const { pesoInicial, pesoActual, progresoPct } = resumen;
  return (
    <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
      <Stat label="Inicio" valor={`${pesoInicial} kg`} />
      <Stat label="Actual" valor={`${pesoActual} kg`} />
      <Stat
        label="Progreso"
        valor={`${progresoPct >= 0 ? '+' : ''}${progresoPct.toFixed(0)}%`}
        color={progresoPct >= 0 ? 'verde' : 'rojo'}
      />
    </div>
  );
}

function Stat({ label, valor, color }: { label: string; valor: string; color?: 'verde' | 'rojo' }) {
  const clase =
    color === 'verde'
      ? 'text-verde-record'
      : color === 'rojo'
        ? 'text-rojo'
        : 'text-slate-900 dark:text-white';
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={['text-sm font-bold', clase].join(' ')}>{valor}</p>
    </div>
  );
}

function BadgeTipo({ tipo }: { tipo: 'Partido' | 'Entreno' | 'Gym' }) {
  const map = {
    Partido: 'bg-azul-principal text-white',
    Entreno: 'bg-amarillo-acento text-azul-oscuro',
    Gym: 'bg-verde-record text-white',
  };
  return (
    <span className={['text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide', map[tipo]].join(' ')}>
      {tipo}
    </span>
  );
}
