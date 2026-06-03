import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import type {
  Rival,
  JugadorRival,
  CategoriaRival,
} from '../types';
import { TAGS_RIVAL_PRESET } from '../types';
import { Seccion } from '../components/form/Seccion';
import { Chip } from '../components/form/Chip';
import {
  CampoTexto,
  CampoTextarea,
  CampoSelect,
  CampoPersonalizado,
} from '../components/form/Campo';
import { IconoFlechaIzq, IconoMas, IconoCerrar } from '../components/icons';
import { useToast } from '../components/Toaster';

const CATEGORIAS: { valor: CategoriaRival; label: string }[] = [
  { valor: 'M14', label: 'M14' },
  { valor: 'M15', label: 'M15' },
  { valor: 'M16', label: 'M16' },
  { valor: 'M17', label: 'M17' },
  { valor: 'M18', label: 'M18' },
  { valor: 'M19', label: 'M19' },
  { valor: 'Senior', label: 'Senior' },
  { valor: 'Otro', label: 'Otro' },
];

function rivalInicial(): Rival {
  const t = Date.now();
  return {
    id: crypto.randomUUID(),
    nombre: '',
    categoria: 'M15',
    tags: [],
    notasGenerales: '',
    notasProximoPartido: '',
    jugadores: [],
    creadoEn: t,
    actualizadoEn: t,
  };
}

export function NuevoRival() {
  const navigate = useNavigate();
  const { mostrar } = useToast();
  const { id } = useParams<{ id?: string }>();
  const esEdicion = Boolean(id);
  const [searchParams] = useSearchParams();
  const nombreInicial = searchParams.get('nombre') ?? '';
  const rivalExistente = useLiveQuery(
    () => (id ? db.rivales.get(id) : undefined),
    [id],
  );

  const [r, setR] = useState<Rival>(() => {
    const base = rivalInicial();
    if (nombreInicial) base.nombre = nombreInicial;
    return base;
  });
  const [cargado, setCargado] = useState(!esEdicion);
  const [tagCustom, setTagCustom] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (esEdicion && rivalExistente && !cargado) {
      setR({ ...rivalInicial(), ...rivalExistente });
      setCargado(true);
    }
  }, [esEdicion, rivalExistente, cargado]);

  const set = <K extends keyof Rival>(clave: K, v: Rival[K]) =>
    setR((prev) => ({ ...prev, [clave]: v, actualizadoEn: Date.now() }));

  const toggleTag = (tag: string) => {
    setR((prev) => {
      const ya = prev.tags.includes(tag);
      return {
        ...prev,
        tags: ya ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
        actualizadoEn: Date.now(),
      };
    });
  };

  const agregarTagCustom = () => {
    const v = tagCustom.trim();
    if (!v) return;
    if (r.tags.includes(v)) {
      setTagCustom('');
      return;
    }
    set('tags', [...r.tags, v]);
    setTagCustom('');
  };

  const agregarJugador = () => {
    const nuevo: JugadorRival = {
      id: crypto.randomUUID(),
      nombre: '',
      numero: undefined,
      posicion: '',
      notas: '',
    };
    set('jugadores', [...r.jugadores, nuevo]);
  };

  const actualizarJugador = (idx: number, parche: Partial<JugadorRival>) => {
    set(
      'jugadores',
      r.jugadores.map((j, i) => (i === idx ? { ...j, ...parche } : j)),
    );
  };

  const removerJugador = (idx: number) => {
    set(
      'jugadores',
      r.jugadores.filter((_, i) => i !== idx),
    );
  };

  const handleGuardar = async () => {
    if (!r.nombre.trim()) {
      setError('Cargá el nombre del rival.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      await db.rivales.put({ ...r, nombre: r.nombre.trim() });
      mostrar({
        tipo: 'exito',
        mensaje: esEdicion ? 'Cambios guardados' : 'Rival cargado',
      });
      navigate(esEdicion ? `/rivales/${r.id}` : '/rivales');
    } finally {
      setGuardando(false);
    }
  };

  if (esEdicion && rivalExistente === undefined) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">
      <div className="flex items-center gap-3">
        <Link
          to={esEdicion ? `/rivales/${r.id}` : '/rivales'}
          aria-label="Volver"
          className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
        >
          <IconoFlechaIzq size={22} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {esEdicion ? 'Editar rival' : 'Nuevo rival'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Cargá la ficha de scouting de este equipo
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rojo/10 border border-rojo/30 text-rojo px-4 py-2.5 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <Seccion titulo="Datos básicos">
        <CampoTexto
          label="Nombre del equipo"
          hint="🏉"
          value={r.nombre}
          onChange={(e) => set('nombre', e.target.value)}
          placeholder="Ej: Huirapuca"
          ayuda="Mismo nombre que ponés en los partidos, así el récord lo calcula solo"
        />
        <CampoSelect
          label="Categoría"
          value={r.categoria ?? 'Otro'}
          onChange={(e) => set('categoria', e.target.value as CategoriaRival)}
          opciones={CATEGORIAS}
        />
      </Seccion>

      <Seccion
        titulo="Estilo de juego (tags)"
        descripcion="Tocá los que aplican. Podés agregar tuyos abajo."
      >
        <div className="flex flex-wrap gap-2">
          {TAGS_RIVAL_PRESET.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              activo={r.tags.includes(tag)}
              onToggle={() => toggleTag(tag)}
            />
          ))}
          {r.tags.filter((t) => !TAGS_RIVAL_PRESET.includes(t as never)).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              activo
              onToggle={() => toggleTag(tag)}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagCustom}
            onChange={(e) => setTagCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                agregarTagCustom();
              }
            }}
            placeholder="Agregar tag personalizado"
            className="flex-1 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:border-azul-principal focus:outline-none focus:ring-2 focus:ring-azul-principal/20"
          />
          <button
            type="button"
            onClick={agregarTagCustom}
            disabled={!tagCustom.trim()}
            className="px-3 py-2 rounded-md bg-azul-principal hover:bg-azul-oscuro text-white text-sm font-semibold disabled:opacity-50 transition"
          >
            Agregar
          </button>
        </div>
      </Seccion>

      <Seccion titulo="Notas">
        <CampoTextarea
          label="Notas para el próximo partido"
          hint="📌"
          rows={3}
          value={r.notasProximoPartido ?? ''}
          onChange={(e) => set('notasProximoPartido', e.target.value)}
          placeholder="Ej: patear corto al wing izquierdo, presionar el lineout del lado abierto"
          ayuda="Lo que querés recordar la próxima vez que los enfrentes (aparece arriba en la ficha)"
        />
        <CampoTextarea
          label="Cómo juegan (generales)"
          hint="📝"
          rows={4}
          value={r.notasGenerales ?? ''}
          onChange={(e) => set('notasGenerales', e.target.value)}
          placeholder="Sistema de juego, ritmo, patrones que repiten, dónde son débiles, etc."
        />
      </Seccion>

      <Seccion
        titulo="Jugadores a marcar"
        descripcion="Cargá los del rival que más impactan (10, 9, full back, kicker, etc.)"
      >
        {r.jugadores.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-2">
            Todavía no agregaste jugadores.
          </p>
        ) : (
          <div className="space-y-3">
            {r.jugadores.map((j, idx) => (
              <CampoPersonalizado key={j.id} label={`Jugador ${idx + 1}`}>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      <input
                        type="text"
                        value={j.nombre}
                        onChange={(e) => actualizarJugador(idx, { nombre: e.target.value })}
                        placeholder="Nombre"
                        className="col-span-2 px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:border-azul-principal focus:outline-none"
                      />
                      <input
                        type="number"
                        value={j.numero ?? ''}
                        onChange={(e) =>
                          actualizarJugador(idx, {
                            numero: e.target.value === '' ? undefined : Number(e.target.value),
                          })
                        }
                        min={1}
                        max={99}
                        placeholder="N°"
                        className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-center focus:border-azul-principal focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removerJugador(idx)}
                      aria-label={`Quitar jugador ${idx + 1}`}
                      className="p-1.5 rounded-full text-slate-400 hover:text-rojo hover:bg-rojo/10 transition"
                    >
                      <IconoCerrar size={18} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={j.posicion ?? ''}
                    onChange={(e) => actualizarJugador(idx, { posicion: e.target.value })}
                    placeholder="Posición (ej: 10, Wing, Hooker)"
                    className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:border-azul-principal focus:outline-none"
                  />
                  <textarea
                    value={j.notas ?? ''}
                    onChange={(e) => actualizarJugador(idx, { notas: e.target.value })}
                    rows={2}
                    placeholder="Lo que hace bien, lo que hace mal, debilidad explotable"
                    className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm resize-none focus:border-azul-principal focus:outline-none"
                  />
                </div>
              </CampoPersonalizado>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={agregarJugador}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-azul-principal text-azul-principal dark:text-amarillo-acento py-3 rounded-lg text-sm font-semibold transition"
        >
          <IconoMas size={18} />
          Agregar jugador
        </button>
      </Seccion>

      <div className="flex gap-3 sticky bottom-20 md:bottom-0 pt-2">
        <Link
          to={esEdicion ? `/rivales/${r.id}` : '/rivales'}
          className="flex-1 text-center px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
        >
          Cancelar
        </Link>
        <button
          type="button"
          onClick={handleGuardar}
          disabled={guardando}
          className="flex-1 px-4 py-3 rounded-lg bg-amarillo-acento hover:brightness-95 text-azul-oscuro font-bold shadow transition disabled:opacity-50"
        >
          {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Guardar rival'}
        </button>
      </div>
    </div>
  );
}
