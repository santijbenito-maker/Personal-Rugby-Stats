import { useState } from 'react';
import { contar, importarBackup, leerArchivoComoBackup } from '../lib/export';
import type { Backup, ModoImport } from '../lib/export';
import { IconoCerrar } from './icons';

type Props = {
  abierto: boolean;
  onCerrar: () => void;
  onImportado: (backup: Backup, modo: ModoImport) => void;
};

/**
 * Modal de importar:
 * 1) Pide un archivo JSON.
 * 2) Lo valida y muestra cuántos registros tiene de cada tipo.
 * 3) Pide elegir entre "Reemplazar todo" o "Sumar a lo existente".
 */
export function ImportarModal({ abierto, onCerrar, onImportado }: Props) {
  const [archivoBackup, setArchivoBackup] = useState<Backup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false);
  const [modo, setModo] = useState<ModoImport>('reemplazar');

  const reset = () => {
    setArchivoBackup(null);
    setError(null);
    setModo('reemplazar');
  };

  if (!abierto) return null;

  const handleArchivo = async (file: File) => {
    setError(null);
    try {
      const b = await leerArchivoComoBackup(file);
      setArchivoBackup(b);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pude leer el archivo.');
    }
  };

  const handleImportar = async () => {
    if (!archivoBackup) return;
    setTrabajando(true);
    try {
      await importarBackup(archivoBackup, modo);
      onImportado(archivoBackup, modo);
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pude importar.');
    } finally {
      setTrabajando(false);
    }
  };

  const handleCerrar = () => {
    if (trabajando) return;
    reset();
    onCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCerrar} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white dark:bg-slate-900 w-full md:max-w-md max-h-[90vh] rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-semibold">Importar datos</h2>
          <button
            type="button"
            onClick={handleCerrar}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Cerrar"
          >
            <IconoCerrar size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Paso 1: subir archivo */}
          {!archivoBackup && (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Subí un archivo JSON exportado previamente desde Stats SB.
              </p>

              <label className="block">
                <input
                  type="file"
                  accept="application/json,.json"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleArchivo(f);
                  }}
                />
                <span className="block w-full px-4 py-3 rounded-lg bg-azul-principal hover:bg-azul-oscuro text-white font-semibold text-center cursor-pointer transition">
                  📂 Elegir archivo JSON
                </span>
              </label>

              {error && (
                <p className="text-sm text-rojo bg-rojo/10 border border-rojo/30 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}
            </>
          )}

          {/* Paso 2: confirmar */}
          {archivoBackup && (
            <>
              <div className="bg-amarillo-claro dark:bg-amarillo-acento/10 border border-amarillo-acento/40 rounded-lg p-3">
                <p className="text-sm font-semibold mb-2">Archivo válido. Contiene:</p>
                <ul className="text-sm space-y-0.5">
                  {(() => {
                    const c = contar(archivoBackup);
                    const items: { label: string; n: number }[] = [
                      { label: 'Partidos', n: c.partidos },
                      { label: 'Entrenamientos', n: c.entrenamientos },
                      { label: 'Sesiones de gym', n: c.gym_sesiones },
                      { label: 'Ejercicios', n: c.gym_ejercicios },
                      { label: 'Tests físicos', n: c.tests_fisicos },
                      { label: 'Lesiones', n: c.lesiones },
                    ];
                    return items.map((i) => (
                      <li key={i.label} className="flex items-center justify-between">
                        <span className="text-slate-700 dark:text-slate-300">{i.label}</span>
                        <strong className="tabular-nums">{i.n}</strong>
                      </li>
                    ));
                  })()}
                </ul>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">¿Cómo lo querés importar?</p>
                <div className="space-y-2">
                  <OpcionRadio
                    activo={modo === 'reemplazar'}
                    onClick={() => setModo('reemplazar')}
                    titulo="Reemplazar todo"
                    descripcion="Borra los datos actuales y deja sólo los del archivo. Útil para restaurar un backup."
                  />
                  <OpcionRadio
                    activo={modo === 'sumar'}
                    onClick={() => setModo('sumar')}
                    titulo="Sumar a lo existente"
                    descripcion="Agrega los registros del archivo. Si hay un id repetido lo sobrescribe."
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-rojo bg-rojo/10 border border-rojo/30 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => reset()}
                  disabled={trabajando}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
                >
                  Cambiar archivo
                </button>
                <button
                  type="button"
                  onClick={handleImportar}
                  disabled={trabajando}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-amarillo-acento hover:brightness-95 text-azul-oscuro font-bold transition disabled:opacity-50"
                >
                  {trabajando ? 'Importando…' : 'Importar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function OpcionRadio({
  activo,
  onClick,
  titulo,
  descripcion,
}: {
  activo: boolean;
  onClick: () => void;
  titulo: string;
  descripcion: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full flex items-start gap-3 px-3 py-3 rounded-lg border text-left transition',
        activo
          ? 'bg-azul-principal/5 dark:bg-azul-principal/20 border-azul-principal'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-azul-principal/50',
      ].join(' ')}
    >
      <span
        className={[
          'mt-0.5 w-4 h-4 rounded-full shrink-0 border-2 transition',
          activo ? 'border-azul-principal bg-azul-principal' : 'border-slate-300',
        ].join(' ')}
        aria-hidden
      >
        {activo && <span className="block w-1.5 h-1.5 bg-white rounded-full mx-auto mt-[3px]" />}
      </span>
      <div>
        <p className="text-sm font-semibold">{titulo}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{descripcion}</p>
      </div>
    </button>
  );
}
