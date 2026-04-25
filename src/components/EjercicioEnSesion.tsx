import { useState } from 'react';
import type { EjercicioDeSesion, GymEjercicio, Serie } from '../types';
import { IconoCerrar, IconoMas, IconoInfo } from './icons';

type EjercicioEnSesionProps = {
  ejercicio: GymEjercicio;
  enSesion: EjercicioDeSesion;
  ultimaVezTexto?: string; // "50 kg × 5 · hace 3 días"
  onChange: (nuevo: EjercicioDeSesion) => void;
  onRemover: () => void;
};

/**
 * Tarjeta de un ejercicio dentro del formulario de nueva sesión.
 * Tiene la tabla editable de series (peso/reps/RIR) + tooltip de RIR.
 */
export function EjercicioEnSesion({
  ejercicio,
  enSesion,
  ultimaVezTexto,
  onChange,
  onRemover,
}: EjercicioEnSesionProps) {
  const [mostrarInfoRIR, setMostrarInfoRIR] = useState(false);

  const setSerie = (i: number, parche: Partial<Serie>) => {
    onChange({
      ...enSesion,
      series: enSesion.series.map((s, idx) => (idx === i ? { ...s, ...parche } : s)),
    });
  };

  const agregarSerie = () => {
    const ultima = enSesion.series[enSesion.series.length - 1];
    const base: Serie = ultima ?? { peso: 0, reps: 0 };
    onChange({ ...enSesion, series: [...enSesion.series, { ...base }] });
  };

  const removerSerie = (i: number) => {
    if (enSesion.series.length <= 1) {
      // Mantener al menos una serie
      onChange({ ...enSesion, series: [{ peso: 0, reps: 0 }] });
      return;
    }
    onChange({
      ...enSesion,
      series: enSesion.series.filter((_, idx) => idx !== i),
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 relative">
      {/* Header del ejercicio */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 dark:text-white truncate">
            {ejercicio.nombre}
            {ejercicio.esPersonalizado && (
              <span className="ml-2 text-[10px] uppercase font-bold text-amarillo-acento">custom</span>
            )}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{ejercicio.grupoMuscular}</p>
        </div>
        <button
          type="button"
          onClick={onRemover}
          aria-label={`Quitar ${ejercicio.nombre}`}
          className="p-1.5 rounded-full text-slate-400 hover:text-rojo hover:bg-rojo/10 transition"
        >
          <IconoCerrar size={18} />
        </button>
      </div>

      {/* Banner de "Última vez" */}
      {ultimaVezTexto && (
        <div className="bg-azul-principal/5 dark:bg-azul-principal/20 border border-azul-principal/20 text-azul-principal dark:text-amarillo-acento text-xs font-medium rounded-md px-3 py-2 mb-3">
          Última vez: <strong>{ultimaVezTexto}</strong>
        </div>
      )}

      {/* Tabla de series */}
      <div className="space-y-2">
        {/* Cabecera */}
        <div className="grid grid-cols-[24px_1fr_1fr_1fr_28px] gap-2 px-1 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
          <span>#</span>
          <span>Peso (kg)</span>
          <span>Reps</span>
          <span className="flex items-center gap-1">
            RIR
            <button
              type="button"
              onClick={() => setMostrarInfoRIR((v) => !v)}
              aria-label="¿Qué es RIR?"
              className="text-slate-400 hover:text-azul-principal transition"
            >
              <IconoInfo size={12} />
            </button>
          </span>
          <span />
        </div>

        {mostrarInfoRIR && (
          <div className="bg-amarillo-claro dark:bg-amarillo-acento/10 border border-amarillo-acento/30 rounded-md px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
            <strong>RIR = Reps In Reserve</strong>. Cuántas reps más podrías haber hecho. Ej: RIR 2 = podrías haber hecho 2 más antes del fallo.
          </div>
        )}

        {/* Filas */}
        {enSesion.series.map((s, i) => (
          <div key={i} className="grid grid-cols-[24px_1fr_1fr_1fr_28px] gap-2 items-center">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 tabular-nums">{i + 1}</span>
            <InputSerie
              valor={s.peso}
              onChange={(v) => setSerie(i, { peso: v ?? 0 })}
              max={500}
              paso={0.5}
            />
            <InputSerie
              valor={s.reps}
              onChange={(v) => setSerie(i, { reps: v ?? 0 })}
              max={300}
              paso={1}
            />
            <InputSerie
              valor={s.rir}
              onChange={(v) => setSerie(i, { rir: v })}
              max={10}
              paso={1}
              opcional
            />
            <button
              type="button"
              onClick={() => removerSerie(i)}
              aria-label={`Quitar serie ${i + 1}`}
              className="text-slate-400 hover:text-rojo transition flex items-center justify-center"
            >
              <IconoCerrar size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Agregar serie */}
      <button
        type="button"
        onClick={agregarSerie}
        className="mt-3 w-full flex items-center justify-center gap-1.5 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-azul-principal hover:text-azul-principal text-slate-500 dark:text-slate-400 py-2 rounded-md text-xs font-medium transition"
      >
        <IconoMas size={14} />
        Agregar serie
      </button>
    </div>
  );
}

/**
 * Input numérico para series.
 * - Sin opcional: vacío equivale a 0 (devuelve `undefined` si vacío y consumer lo trata como 0).
 * - Opcional (RIR): vacío es válido y devuelve `undefined`.
 */
function InputSerie({
  valor,
  onChange,
  max,
  paso,
  opcional = false,
}: {
  valor: number | undefined;
  onChange: (v: number | undefined) => void;
  max: number;
  paso: number;
  opcional?: boolean;
}) {
  const display = valor === undefined || valor === 0 ? (opcional ? '' : valor === 0 ? '' : '') : valor;
  return (
    <input
      type="number"
      inputMode="decimal"
      min={0}
      max={max}
      step={paso}
      value={display}
      placeholder={opcional ? '—' : '0'}
      onChange={(e) => {
        const txt = e.target.value;
        if (txt === '') {
          onChange(undefined);
          return;
        }
        const n = Number(txt);
        if (Number.isFinite(n)) onChange(Math.min(Math.max(0, n), max));
      }}
      className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center text-sm font-bold tabular-nums focus:border-azul-principal focus:outline-none focus:ring-2 focus:ring-azul-principal/20"
    />
  );
}
