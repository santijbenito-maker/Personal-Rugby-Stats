import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import { db } from '../db/schema';
import { TestFisicoCard } from '../components/TestFisicoCard';
import { IconoMas, IconoFisico } from '../components/icons';
import {
  ultimoTestDeKind,
  deltaUltimo,
  serieEvolucion,
  etiquetaKind,
  formatearValor,
  menorEsMejor,
} from '../lib/fisico';
import type { KindTestFisico, TestFisico } from '../types';

const KINDS_ORDEN: KindTestFisico[] = ['sentadilla', 'press_banca', 'bronco', '40m'];

export function Fisico() {
  const tests = useLiveQuery(
    () => db.tests_fisicos.orderBy('fecha').reverse().toArray(),
    [],
    [],
  );

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
            : 'Tus benchmarks: fuerza, velocidad y resistencia'}
        </p>
      </div>

      {/* Tarjetas por tipo de test */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {KINDS_ORDEN.map((kind) => (
          <TarjetaKind key={kind} kind={kind} tests={tests} />
        ))}
      </div>

      {/* Botón cargar */}
      <Link
        to="/fisico/nuevo"
        className="flex items-center justify-center gap-2 w-full bg-amarillo-acento hover:brightness-95 text-azul-oscuro font-bold rounded-xl px-4 py-3.5 shadow-tarjeta transition"
      >
        <IconoMas size={22} strokeWidth={2.5} />
        Nuevo test físico
      </Link>

      {/* Listado completo (orden cronológico inverso) o empty state */}
      {tests.length === 0 ? (
        <EmptyStateFisico />
      ) : (
        <div>
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mt-3 mb-2">
            Todos los tests
          </h2>
          <div className="space-y-3">
            {tests.map((t) => (
              <TestFisicoCard key={t.id} test={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Tarjeta por tipo de test — último valor + delta + mini sparkline.
 * Si no hay tests del kind, muestra un estado vacío clickeable que
 * te lleva a cargar uno.
 */
function TarjetaKind({ kind, tests }: { kind: KindTestFisico; tests: TestFisico[] }) {
  const ultimo = ultimoTestDeKind(tests, kind);
  const delta = deltaUltimo(tests, kind);
  const serie = serieEvolucion(tests, kind);
  const menor = menorEsMejor(kind);

  if (!ultimo) {
    return (
      <Link
        to={`/fisico/nuevo?kind=${kind}`}
        className="block bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-4 hover:border-azul-principal transition"
      >
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {etiquetaKind(kind)}
        </p>
        <p className="mt-2 text-sm text-slate-400 italic">Sin tests todavía</p>
        <p className="mt-3 text-xs text-azul-principal dark:text-amarillo-acento font-semibold">
          + Cargar primero
        </p>
      </Link>
    );
  }

  // Símbolo de delta: ▲ subió / ▼ bajó / = sin cambio
  const flecha = delta && delta.absoluto !== 0 ? (delta.absoluto > 0 ? '▲' : '▼') : null;
  const colorDelta = !delta
    ? ''
    : delta.esMejora
      ? 'text-verde-record'
      : 'text-rojo';

  return (
    <Link
      to={`/fisico/${ultimo.id}`}
      className="block bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800 p-4 hover:border-azul-principal/30 active:scale-[0.99] transition"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {etiquetaKind(kind)}
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums">{formatearValor(ultimo)}</p>
        </div>
        {ultimo.fueRecord && (
          <span className="text-[10px] font-bold uppercase bg-verde-record text-white px-1.5 py-0.5 rounded">
            🏆 PR
          </span>
        )}
      </div>

      {delta && flecha && (
        <p className={['text-xs font-semibold mt-1', colorDelta].join(' ')}>
          {flecha} {Math.abs(delta.absoluto)}{' '}
          {kind === 'sentadilla' || kind === 'press_banca' ? 'kg 1RM' : 's'}{' '}
          vs anterior
        </p>
      )}

      {/* Mini sparkline */}
      {serie.length >= 2 && (
        <div className="h-10 mt-2 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={serie}>
              <YAxis hide domain={['auto', 'auto']} reversed={menor} />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="#1B3A6B"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Link>
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
        Anotá tu sentadilla, press de banca, Bronco o 40m para ver tu evolución y batir tus
        propios récords.
      </p>
    </div>
  );
}
