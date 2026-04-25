import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import type { GymEjercicio, GymSesion, GrupoMuscular } from '../types';
import { ejerciciosFrecuentes, ultimaVezEjercicio } from '../lib/gym';
import { IconoBusqueda, IconoCerrar, IconoMas } from './icons';

const GRUPOS_ORDEN: GrupoMuscular[] = ['Tren inferior', 'Tren superior', 'Core', 'Rugby específico'];

type SelectorEjercicioProps = {
  abierto: boolean;
  /** IDs ya agregados a la sesión actual (para deshabilitarlos en el listado). */
  yaAgregados: Set<string>;
  onCerrar: () => void;
  onSeleccionar: (ejercicio: GymEjercicio) => void;
};

/**
 * Modal full-screen (mobile) / centrado (desktop) para elegir un ejercicio
 * de la biblioteca. Incluye búsqueda, sección "Frecuentes" y la opción
 * de crear un ejercicio personalizado en el momento.
 */
export function SelectorEjercicio({
  abierto,
  yaAgregados,
  onCerrar,
  onSeleccionar,
}: SelectorEjercicioProps) {
  const [busqueda, setBusqueda] = useState('');
  const [creando, setCreando] = useState(false);

  const ejercicios = useLiveQuery(() => db.gym_ejercicios.toArray(), [], []);
  const sesiones = useLiveQuery(() => db.gym_sesiones.toArray(), [], []);

  // Cerrar con tecla Escape
  useEffect(() => {
    if (!abierto) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [abierto, onCerrar]);

  const ejFiltrados = useMemo(() => {
    const norm = busqueda.toLowerCase().trim();
    if (!norm) return ejercicios;
    return ejercicios.filter((e) => e.nombre.toLowerCase().includes(norm));
  }, [ejercicios, busqueda]);

  const frecuentes = useMemo(
    () => ejerciciosFrecuentes(ejercicios, 6).filter((e) => !busqueda.trim() || e.nombre.toLowerCase().includes(busqueda.toLowerCase())),
    [ejercicios, busqueda],
  );

  if (!abierto) return null;

  // Si está creando uno nuevo, mostramos el sub-form
  if (creando) {
    return (
      <Modal onCerrar={onCerrar} titulo="Crear ejercicio personalizado">
        <FormCustom
          onCancelar={() => setCreando(false)}
          onCrear={async (nombre, grupo) => {
            const nuevo: GymEjercicio = {
              id: crypto.randomUUID(),
              nombre,
              grupoMuscular: grupo,
              esPersonalizado: true,
              frecuenciaDeUso: 0,
              creadoEn: Date.now(),
            };
            await db.gym_ejercicios.add(nuevo);
            setCreando(false);
            onSeleccionar(nuevo);
          }}
        />
      </Modal>
    );
  }

  return (
    <Modal onCerrar={onCerrar} titulo="Elegir ejercicio">
      {/* Búsqueda */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <IconoBusqueda size={18} />
        </span>
        <input
          type="search"
          autoFocus
          placeholder="Buscar ejercicio…"
          value={busqueda}
          onChange={(ev) => setBusqueda(ev.target.value)}
          className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-azul-principal focus:outline-none focus:ring-2 focus:ring-azul-principal/20"
        />
      </div>

      {/* Frecuentes */}
      {frecuentes.length > 0 && !busqueda.trim() && (
        <SeccionLista titulo="Frecuentes">
          {frecuentes.map((ej) => (
            <ItemEjercicio
              key={ej.id}
              ejercicio={ej}
              ultimaVez={ultimaVezEjercicio(sesiones, ej.id)}
              deshabilitado={yaAgregados.has(ej.id)}
              onClick={() => onSeleccionar(ej)}
            />
          ))}
        </SeccionLista>
      )}

      {/* Por grupo muscular */}
      {GRUPOS_ORDEN.map((grupo) => {
        const items = ejFiltrados.filter((e) => e.grupoMuscular === grupo);
        if (items.length === 0) return null;
        return (
          <SeccionLista key={grupo} titulo={grupo}>
            {items.map((ej) => (
              <ItemEjercicio
                key={ej.id}
                ejercicio={ej}
                ultimaVez={ultimaVezEjercicio(sesiones, ej.id)}
                deshabilitado={yaAgregados.has(ej.id)}
                onClick={() => onSeleccionar(ej)}
              />
            ))}
          </SeccionLista>
        );
      })}

      {ejFiltrados.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-6">
          No encontramos "{busqueda}". Lo podés crear como personalizado.
        </p>
      )}

      {/* Crear personalizado */}
      <button
        type="button"
        onClick={() => setCreando(true)}
        className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-azul-principal text-azul-principal dark:text-amarillo-acento py-3 rounded-lg text-sm font-medium transition"
      >
        <IconoMas size={18} />
        Crear ejercicio personalizado
      </button>
    </Modal>
  );
}

// ───────────────────────────────────────────────────────────────
// Sub-componentes
// ───────────────────────────────────────────────────────────────

function Modal({
  titulo,
  onCerrar,
  children,
}: {
  titulo: string;
  onCerrar: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCerrar}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white dark:bg-slate-900 w-full md:max-w-lg max-h-[90vh] rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Cerrar"
          >
            <IconoCerrar size={20} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

function SeccionLista({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mb-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-1">
        {titulo}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function ItemEjercicio({
  ejercicio,
  ultimaVez,
  deshabilitado,
  onClick,
}: {
  ejercicio: GymEjercicio;
  ultimaVez: ReturnType<typeof ultimaVezEjercicio>;
  deshabilitado: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={deshabilitado}
      onClick={onClick}
      className={[
        'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition text-left',
        deshabilitado
          ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-azul-principal/50 hover:bg-slate-50 dark:hover:bg-slate-800',
      ].join(' ')}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
          {ejercicio.nombre}
          {ejercicio.esPersonalizado && (
            <span className="ml-2 text-[10px] uppercase font-bold text-amarillo-acento">custom</span>
          )}
        </p>
        {deshabilitado && (
          <p className="text-[11px] text-slate-500">ya está en la sesión</p>
        )}
      </div>
      <div className="text-right shrink-0">
        {ultimaVez ? (
          <>
            <p className="text-sm font-bold text-azul-principal dark:text-amarillo-acento tabular-nums">
              {ultimaVez.textoBreve}
            </p>
            <p className="text-[10px] text-slate-500">{ultimaVez.hace}</p>
          </>
        ) : (
          <span className="text-[10px] uppercase font-bold tracking-wide bg-amarillo-acento text-azul-oscuro px-2 py-0.5 rounded-full">
            Nuevo
          </span>
        )}
      </div>
    </button>
  );
}

function FormCustom({
  onCancelar,
  onCrear,
}: {
  onCancelar: () => void;
  onCrear: (nombre: string, grupo: GrupoMuscular) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState<GrupoMuscular>('Tren inferior');

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium block mb-1.5">Nombre del ejercicio</label>
        <input
          type="text"
          autoFocus
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Sentadilla búlgara"
          className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-azul-principal focus:outline-none focus:ring-2 focus:ring-azul-principal/20"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">Grupo muscular</label>
        <select
          value={grupo}
          onChange={(e) => setGrupo(e.target.value as GrupoMuscular)}
          className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-azul-principal focus:outline-none focus:ring-2 focus:ring-azul-principal/20"
        >
          {GRUPOS_ORDEN.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancelar}
          className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onCrear(nombre.trim(), grupo)}
          disabled={nombre.trim().length === 0}
          className="flex-1 px-4 py-2.5 rounded-lg bg-amarillo-acento text-azul-oscuro font-bold hover:brightness-95 transition disabled:opacity-50"
        >
          Crear y agregar
        </button>
      </div>
    </div>
  );
}

// Re-export para evitar warning de variable no usada en types
export type { GymSesion };
