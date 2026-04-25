import { Link } from 'react-router-dom';
import type { TestFisico } from '../types';
import { formatoCorto, hace } from '../lib/fechas';

type Props = {
  test: TestFisico;
};

/** Tarjeta de test físico: fecha + grid con las 4 métricas principales. */
export function TestFisicoCard({ test: t }: Props) {
  return (
    <Link
      to={`/fisico/${t.id}`}
      className="block bg-white dark:bg-slate-900 rounded-xl shadow-tarjeta border border-slate-200 dark:border-slate-800 p-4 hover:border-azul-principal/30 active:scale-[0.99] transition"
    >
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {formatoCorto(t.fecha)} · {hace(t.fecha)}
      </p>

      <div className="mt-3 grid grid-cols-4 gap-2">
        <Mini label="Peso" valor={t.pesoCorporal !== undefined ? `${t.pesoCorporal}` : '—'} sufijo="kg" />
        <Mini label="Altura" valor={t.altura !== undefined ? `${t.altura}` : '—'} sufijo="cm" />
        <Mini label="40m" valor={t.t40m !== undefined ? `${t.t40m}` : '—'} sufijo="s" />
        <Mini label="Beep" valor={t.beepTest !== undefined ? `${t.beepTest}` : '—'} />
      </div>

      {(t.flexiones !== undefined || t.abdominales !== undefined) && (
        <div className="mt-2 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Mini label="Flexiones/min" valor={t.flexiones !== undefined ? `${t.flexiones}` : '—'} />
          <Mini label="Abdominales/min" valor={t.abdominales !== undefined ? `${t.abdominales}` : '—'} />
        </div>
      )}
    </Link>
  );
}

function Mini({ label, valor, sufijo }: { label: string; valor: string; sufijo?: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
        {valor}
        {sufijo && valor !== '—' && <span className="text-[10px] ml-0.5 opacity-70">{sufijo}</span>}
      </p>
    </div>
  );
}
