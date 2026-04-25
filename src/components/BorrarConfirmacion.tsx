import { useState } from 'react';
import { borrarTodosLosDatos } from '../db/schema';
import { IconoCerrar, IconoAdvertencia } from './icons';

type Props = {
  abierto: boolean;
  onCerrar: () => void;
  onBorrado: () => void;
};

const PALABRA = 'BORRAR';

/**
 * Modal de confirmación doble para borrar todos los datos:
 * 1) Pide escribir literalmente "BORRAR".
 * 2) Pide un confirm extra antes de ejecutar.
 * Después limpia todo y vuelve a sembrar la biblioteca de ejercicios.
 */
export function BorrarConfirmacion({ abierto, onCerrar, onBorrado }: Props) {
  const [texto, setTexto] = useState('');
  const [pidiendoConfirm, setPidiendoConfirm] = useState(false);
  const [trabajando, setTrabajando] = useState(false);

  if (!abierto) return null;

  const reset = () => {
    setTexto('');
    setPidiendoConfirm(false);
  };

  const handleCerrar = () => {
    if (trabajando) return;
    reset();
    onCerrar();
  };

  const habilitado = texto.trim().toUpperCase() === PALABRA;

  const handlePrimerPaso = () => {
    if (!habilitado) return;
    setPidiendoConfirm(true);
  };

  const handleConfirmFinal = async () => {
    setTrabajando(true);
    try {
      await borrarTodosLosDatos();
      reset();
      onBorrado();
    } finally {
      setTrabajando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCerrar} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white dark:bg-slate-900 w-full md:max-w-md rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-semibold text-rojo flex items-center gap-2">
            <IconoAdvertencia size={20} />
            Borrar todos mis datos
          </h2>
          <button
            type="button"
            onClick={handleCerrar}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Cerrar"
          >
            <IconoCerrar size={20} />
          </button>
        </header>

        <div className="p-4 space-y-4">
          {!pidiendoConfirm ? (
            <>
              <div className="bg-rojo/10 border border-rojo/30 rounded-lg p-3 text-sm text-slate-800 dark:text-slate-100">
                <p className="font-semibold text-rojo mb-1">Esto no se puede deshacer.</p>
                <p>
                  Vas a perder todos los partidos, entrenamientos, sesiones de gym, tests físicos y
                  lesiones. La biblioteca de ejercicios base se mantiene.
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  💡 Si querés un respaldo, exportá tus datos primero.
                </p>
              </div>

              <label className="block">
                <span className="text-sm font-medium block mb-1.5">
                  Escribí <strong className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{PALABRA}</strong> para habilitar el botón:
                </span>
                <input
                  type="text"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder={PALABRA}
                  autoFocus
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-mono text-lg uppercase tracking-widest focus:border-rojo focus:outline-none focus:ring-2 focus:ring-rojo/20"
                />
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCerrar}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handlePrimerPaso}
                  disabled={!habilitado}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-rojo hover:brightness-95 text-white font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-rojo/10 border border-rojo/30 rounded-lg p-3 text-sm text-slate-800 dark:text-slate-100 text-center">
                <p className="text-base font-bold text-rojo">¿Estás 100% seguro?</p>
                <p className="mt-1 text-sm">Última oportunidad para volver atrás.</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPidiendoConfirm(false)}
                  disabled={trabajando}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleConfirmFinal}
                  disabled={trabajando}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-rojo hover:brightness-95 text-white font-bold transition disabled:opacity-50"
                >
                  {trabajando ? 'Borrando…' : 'Borrar todo'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
