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
import { AdvertenciaGym } from '../components/AdvertenciaGym';
import { MetricCard } from '../components/MetricCard';
import { ChartCard } from '../components/ChartCard';
import { SesionGymCard } from '../components/SesionGymCard';
import { IconoMas, IconoGym } from '../components/icons';
import {
  metricaSesionesGym,
  metricaPRs,
  buscarEjercicioPorNombre,
  progresionEjercicio,
  progresoDeEjercicio,
} from '../lib/calculos';
import { volumenTotal } from '../lib/gym';
import { formatoCorto } from '../lib/fechas';

export function Gym() {
  const sesiones = useLiveQuery(
    () => db.gym_sesiones.orderBy('fecha').reverse().toArray(),
    [],
    [],
  );
  const ejercicios = useLiveQuery(() => db.gym_ejercicios.toArray(), [], []);

  const sesionesMet = metricaSesionesGym(sesiones);
  const prsMet = metricaPRs(sesiones);
  const volumen = volumenTotal(sesiones);

  const sentadilla = buscarEjercicioPorNombre(ejercicios, 'Sentadilla');
  const pressBanca = buscarEjercicioPorNombre(ejercicios, 'Press banca');
  const progSent = sentadilla ? progresionEjercicio(sesiones, sentadilla.id) : [];
  const progBanca = pressBanca ? progresionEjercicio(sesiones, pressBanca.id) : [];
  const resSent = sentadilla ? progresoDeEjercicio(sesiones, sentadilla.id) : null;
  const resBanca = pressBanca ? progresoDeEjercicio(sesiones, pressBanca.id) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Título */}
      <div>
        <div className="flex items-center gap-3">
          <span className="inline-block w-1 h-7 bg-amarillo-acento rounded-full" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gimnasio</h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 ml-4">
          {sesiones.length > 0
            ? `${sesiones.length} sesi${sesiones.length === 1 ? 'ón' : 'ones'} cargada${sesiones.length === 1 ? '' : 's'}`
            : 'Registrá cada sesión de fuerza'}
        </p>
      </div>

      {/* Advertencia fija */}
      <AdvertenciaGym />

      {/* Métricas (sólo si hay datos) */}
      {sesiones.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label="Sesiones del mes"
            valor={sesionesMet.valor}
            color="azul"
            delta={sesionesMet.delta}
          />
          <MetricCard
            label="Volumen total"
            valor={(volumen / 1000).toFixed(1)}
            sufijo="t"
            color="amarillo"
          />
          <MetricCard
            label="PRs del mes"
            valor={prsMet.valor}
            color="verde"
            delta={prsMet.delta}
          />
        </div>
      )}

      {/* Botón cargar */}
      <Link
        to="/gym/nuevo"
        className="flex items-center justify-center gap-2 w-full bg-amarillo-acento hover:brightness-95 text-azul-oscuro font-bold rounded-xl px-4 py-3.5 shadow-tarjeta transition"
      >
        <IconoMas size={22} strokeWidth={2.5} />
        Registrar nueva sesión
      </Link>

      {/* Gráficos de progresión */}
      {sentadilla && progSent.length > 0 && resSent && (
        <ChartCard
          titulo="🦵 Progreso sentadilla"
          subtitulo="Peso máximo por sesión"
          badge={
            <span className="bg-verde-record text-white text-xs font-bold px-2.5 py-1 rounded-full">
              PR: {resSent.pesoActual} kg
            </span>
          }
        >
          <GraficoProgresion datos={progSent} />
          <StatsProg pesoInicial={resSent.pesoInicial} pesoActual={resSent.pesoActual} pct={resSent.progresoPct} />
        </ChartCard>
      )}

      {pressBanca && progBanca.length > 0 && resBanca && (
        <ChartCard
          titulo="💪 Progreso press banca"
          subtitulo="Peso máximo por sesión"
          badge={
            <span className="bg-verde-record text-white text-xs font-bold px-2.5 py-1 rounded-full">
              PR: {resBanca.pesoActual} kg
            </span>
          }
        >
          <GraficoProgresion datos={progBanca} />
          <StatsProg pesoInicial={resBanca.pesoInicial} pesoActual={resBanca.pesoActual} pct={resBanca.progresoPct} />
        </ChartCard>
      )}

      {/* Lista o empty state */}
      {sesiones.length === 0 ? (
        <EmptyStateGym />
      ) : (
        <>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 pt-2">
            Sesiones recientes
          </h2>
          <div className="space-y-3">
            {sesiones.map((s) => (
              <SesionGymCard key={s.id} sesion={s} ejercicios={ejercicios} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GraficoProgresion({ datos }: { datos: { fecha: string; peso: number }[] }) {
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={datos} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="gradAmarillo" x1="0" y1="0" x2="0" y2="1">
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
          <Area type="monotone" dataKey="peso" stroke="none" fill="url(#gradAmarillo)" />
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

function StatsProg({ pesoInicial, pesoActual, pct }: { pesoInicial: number; pesoActual: number; pct: number }) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
      <Mini label="Inicio" valor={`${pesoInicial} kg`} />
      <Mini label="Actual" valor={`${pesoActual} kg`} />
      <Mini
        label="Progreso"
        valor={`${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`}
        color={pct >= 0 ? 'verde' : 'rojo'}
      />
    </div>
  );
}

function Mini({ label, valor, color }: { label: string; valor: string; color?: 'verde' | 'rojo' }) {
  const clase =
    color === 'verde' ? 'text-verde-record' : color === 'rojo' ? 'text-rojo' : 'text-slate-900 dark:text-white';
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={['text-sm font-bold tabular-nums', clase].join(' ')}>{valor}</p>
    </div>
  );
}

function EmptyStateGym() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amarillo-claro dark:bg-amarillo-acento/10 text-azul-principal dark:text-amarillo-acento">
        <IconoGym size={28} />
      </div>
      <h2 className="mt-3 font-semibold">Todavía no cargaste sesiones de gym</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
        Empezá a registrarlas para ver tu progreso en sentadilla, press banca y todos los ejercicios.
      </p>
    </div>
  );
}
