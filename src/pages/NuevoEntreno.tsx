import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { hoyISO } from '../lib/fechas';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import type {
  Asistencia,
  EjercicioTrabajado,
  Entrenamiento,
  EstadoCampo as _EstadoCampo,
  TipoEntreno,
} from '../types';
import { Seccion } from '../components/form/Seccion';
import { Slider10 } from '../components/form/Slider10';
import { Chip } from '../components/form/Chip';
import { WeatherPicker } from '../components/form/WeatherPicker';
import {
  CampoTexto,
  CampoTextarea,
  CampoPersonalizado,
} from '../components/form/Campo';
import { ResumenEntreno, etiquetaRPE } from '../components/ResumenEntreno';
import { IconoFlechaIzq } from '../components/icons';

const EJERCICIOS_OPCIONES: EjercicioTrabajado[] = [
  'Pases',
  'Patadas',
  'Tackles',
  'Rucks',
  'Lineout',
  'Scrum',
  'Defensa',
  'Ataque',
  'Físico',
];

const TIPOS_OPCIONES: TipoEntreno[] = ['Técnico', 'Físico', 'Táctico', 'Partido práctica'];

function entrenoInicial(): Entrenamiento {
  const t = Date.now();
  return {
    id: crypto.randomUUID(),
    fecha: hoyISO(),
    duracion: 90,
    tipos: ['Técnico'],
    minutosReales: undefined,
    clima: undefined,
    temperatura: undefined,
    asistencia: 'Presente',
    ejerciciosTrabajados: [],
    otrosEjercicios: '',
    rpe: 6,
    sensacionFisico: 7,
    sensacionTecnico: 7,
    notas: '',
    creadoEn: t,
    actualizadoEn: t,
  };
}

export function NuevoEntreno() {
  const navigate = useNavigate();
  // Modo edición cuando la ruta es /entrenos/:id/editar.
  const { id } = useParams<{ id?: string }>();
  const esEdicion = Boolean(id);
  const entrenoExistente = useLiveQuery(
    () => (id ? db.entrenamientos.get(id) : undefined),
    [id],
  );

  const [e, setE] = useState<Entrenamiento>(entrenoInicial);
  const [cargado, setCargado] = useState(!esEdicion);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Cuando llega el entreno existente, lo cargamos en el state. Normalizamos
  // el campo "tipos" porque registros viejos pueden tener "tipo" (string).
  useEffect(() => {
    if (esEdicion && entrenoExistente && !cargado) {
      const conTipoViejo = entrenoExistente as Entrenamiento & { tipo?: TipoEntreno };
      const tiposNormalizados: TipoEntreno[] = Array.isArray(entrenoExistente.tipos)
        ? entrenoExistente.tipos
        : conTipoViejo.tipo
          ? [conTipoViejo.tipo]
          : ['Técnico'];
      setE({ ...entrenoInicial(), ...entrenoExistente, tipos: tiposNormalizados });
      setCargado(true);
    }
  }, [esEdicion, entrenoExistente, cargado]);

  if (esEdicion && entrenoExistente === undefined) {
    return <LoadingSkeleton />;
  }

  const set = <K extends keyof Entrenamiento>(clave: K, v: Entrenamiento[K]) =>
    setE((prev) => ({ ...prev, [clave]: v, actualizadoEn: Date.now() }));

  const toggleTipo = (tipo: TipoEntreno) => {
    setE((prev) => {
      const ya = prev.tipos.includes(tipo);
      const nuevos = ya ? prev.tipos.filter((t) => t !== tipo) : [...prev.tipos, tipo];
      return { ...prev, tipos: nuevos, actualizadoEn: Date.now() };
    });
  };

  const toggleEjercicio = (ex: EjercicioTrabajado) => {
    setE((prev) => {
      const ya = prev.ejerciciosTrabajados.includes(ex);
      return {
        ...prev,
        ejerciciosTrabajados: ya
          ? prev.ejerciciosTrabajados.filter((x) => x !== ex)
          : [...prev.ejerciciosTrabajados, ex],
        actualizadoEn: Date.now(),
      };
    });
  };

  const handleGuardar = async () => {
    if (e.tipos.length === 0) {
      setError('Elegí al menos un tipo de entrenamiento.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (e.asistencia === 'Ausente') {
      const ok = confirm(
        'Marcaste el entrenamiento como Ausente. ¿Igual querés guardarlo? (sirve para llevar el registro)',
      );
      if (!ok) return;
    }
    setError(null);
    setGuardando(true);
    try {
      // put = upsert: vale para crear y para editar.
      await db.entrenamientos.put(e);
      navigate(esEdicion ? `/entrenos/${e.id}` : '/entrenos');
    } finally {
      setGuardando(false);
    }
  };

  const incluyePartidoPractica = e.tipos.includes('Partido práctica');

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">
      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <Link
          to={esEdicion ? `/entrenos/${e.id}` : '/entrenos'}
          aria-label="Volver"
          className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
        >
          <IconoFlechaIzq size={22} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {esEdicion ? 'Editar entrenamiento' : 'Nuevo entrenamiento'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {esEdicion
              ? 'Modificá los datos y guardá los cambios'
              : 'Registrá la sesión que acabás de hacer'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rojo/10 border border-rojo/30 text-rojo px-4 py-2.5 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {/* 1. Datos básicos */}
      <Seccion titulo="Datos básicos">
        <CampoTexto
          label="Fecha"
          hint="📅"
          type="date"
          value={e.fecha}
          onChange={(ev) => set('fecha', ev.target.value)}
        />
        <CampoTexto
          label="Duración total (min)"
          hint="⏱️"
          type="number"
          inputMode="numeric"
          min={0}
          max={300}
          value={e.duracion}
          onChange={(ev) => set('duracion', Math.max(0, Number(ev.target.value) || 0))}
        />
      </Seccion>

      {/* 2. Tipo (multi-selección) */}
      <Seccion
        titulo="Tipo"
        descripcion="Tocá los tipos que se trabajaron (podés elegir varios)"
      >
        <CampoPersonalizado label="Tipo de entrenamiento">
          <div className="flex flex-wrap gap-2">
            {TIPOS_OPCIONES.map((tipo) => (
              <Chip
                key={tipo}
                label={tipo === 'Partido práctica' ? 'Práctica' : tipo}
                activo={e.tipos.includes(tipo)}
                onToggle={() => toggleTipo(tipo)}
              />
            ))}
          </div>
        </CampoPersonalizado>
        {incluyePartidoPractica && (
          <CampoTexto
            label="Minutos reales jugados"
            hint="🏉"
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            value={e.minutosReales ?? ''}
            onChange={(ev) =>
              set(
                'minutosReales',
                ev.target.value === '' ? undefined : Math.max(0, Number(ev.target.value) || 0),
              )
            }
            placeholder="Ej: 40"
            ayuda="Cuántos minutos jugaste vos (no la duración total de la sesión)"
          />
        )}
      </Seccion>

      {/* 3. Clima */}
      <Seccion titulo="Clima">
        <CampoPersonalizado label="Clima">
          <WeatherPicker valor={e.clima} onChange={(v) => set('clima', v)} />
        </CampoPersonalizado>
        <CampoTexto
          label="Temperatura (°C, opcional)"
          type="number"
          inputMode="numeric"
          value={e.temperatura ?? ''}
          onChange={(ev) =>
            set('temperatura', ev.target.value === '' ? undefined : Number(ev.target.value))
          }
          placeholder="Ej: 20"
        />
      </Seccion>

      {/* 4. Asistencia */}
      <Seccion titulo="Asistencia">
        <CampoPersonalizado label="¿Cómo estuviste?">
          <SegmentedAsistencia valor={e.asistencia} onChange={(v) => set('asistencia', v)} />
        </CampoPersonalizado>
      </Seccion>

      {/* 5. Ejercicios trabajados */}
      <Seccion
        titulo="Ejercicios trabajados"
        descripcion="Tocá los que se trabajaron en la sesión (podés elegir varios)"
      >
        <div className="flex flex-wrap gap-2">
          {EJERCICIOS_OPCIONES.map((ex) => (
            <Chip
              key={ex}
              label={ex}
              activo={e.ejerciciosTrabajados.includes(ex)}
              onToggle={() => toggleEjercicio(ex)}
            />
          ))}
        </div>
        <CampoTextarea
          label="Otros ejercicios o detalles"
          rows={2}
          value={e.otrosEjercicios ?? ''}
          onChange={(ev) => set('otrosEjercicios', ev.target.value)}
          placeholder="Ej: Trabajamos pases largos al lado abierto, situaciones 4 vs 3"
        />
      </Seccion>

      {/* 6. Esfuerzo (RPE) */}
      <Seccion titulo="Esfuerzo (RPE)" descripcion="1 muy suave · 10 máximo">
        <Slider10
          label="¿Qué tan exigente fue?"
          hint="🔥"
          valor={e.rpe}
          onChange={(v) => set('rpe', v)}
          etiquetaMin="muy suave"
          etiquetaMax="máximo"
          etiquetaDinamica={etiquetaRPE}
          colorBarra="#F5B700"
        />
      </Seccion>

      {/* 7. Sensación */}
      <Seccion titulo="Sensación">
        <Slider10
          label="Físico"
          hint="💪"
          descripcion="Cómo respondió tu cuerpo (energía, piernas, cansancio)"
          valor={e.sensacionFisico}
          onChange={(v) => set('sensacionFisico', v)}
          etiquetaMin="destruido"
          etiquetaMax="volando"
        />
        <Slider10
          label="Técnico"
          hint="🎯"
          descripcion="Cómo te salieron las cosas (pases, decisiones, timing)"
          valor={e.sensacionTecnico}
          onChange={(v) => set('sensacionTecnico', v)}
          etiquetaMin="nada salió"
          etiquetaMax="todo perfecto"
        />
      </Seccion>

      {/* 8. Notas */}
      <Seccion titulo="Notas">
        <CampoTextarea
          label="Comentarios"
          hint="📝"
          rows={3}
          value={e.notas ?? ''}
          onChange={(ev) => set('notas', ev.target.value)}
          placeholder="Algo destacado del día, sensaciones, lesiones puntuales, etc."
        />
      </Seccion>

      {/* Resumen en vivo */}
      <ResumenEntreno entreno={e} />

      {/* Botones */}
      <div className="flex gap-3 sticky bottom-20 md:bottom-0 pt-2">
        <Link
          to={esEdicion ? `/entrenos/${e.id}` : '/entrenos'}
          className="flex-1 text-center px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          Cancelar
        </Link>
        <button
          type="button"
          onClick={handleGuardar}
          disabled={guardando}
          className="flex-1 px-4 py-3 rounded-lg bg-amarillo-acento hover:brightness-95 text-azul-oscuro font-bold shadow transition disabled:opacity-50"
        >
          {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Guardar entrenamiento'}
        </button>
      </div>
    </div>
  );
}

/**
 * Variante de Segmented específica para asistencia con colores propios.
 */
function SegmentedAsistencia({
  valor,
  onChange,
}: {
  valor: Asistencia;
  onChange: (v: Asistencia) => void;
}) {
  const opciones: { valor: Asistencia; label: string; clase: string }[] = [
    { valor: 'Presente', label: '✓ Presente', clase: 'bg-verde-record text-white' },
    { valor: 'Llegué tarde', label: 'Llegué tarde', clase: 'bg-amarillo-acento text-azul-oscuro' },
    { valor: 'Ausente', label: '✗ Ausente', clase: 'bg-rojo text-white' },
  ];

  return (
    <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
      {opciones.map((op) => {
        const activo = op.valor === valor;
        return (
          <button
            key={op.valor}
            type="button"
            onClick={() => onChange(op.valor)}
            aria-selected={activo}
            className={[
              'px-2 py-2 rounded-md text-sm font-medium transition-colors text-center',
              activo
                ? `${op.clase} shadow font-bold`
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/50',
            ].join(' ')}
          >
            {op.label}
          </button>
        );
      })}
    </div>
  );
}
