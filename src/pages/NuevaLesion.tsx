import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { hoyISO, sumarDias } from '../lib/fechas';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import type {
  Lesion,
  ZonaLesion,
  LadoLesion,
  TipoLesion,
  Gravedad,
} from '../types';
import { Seccion } from '../components/form/Seccion';
import { Segmented } from '../components/form/Segmented';
import {
  CampoTexto,
  CampoTextarea,
  CampoSelect,
  CampoPersonalizado,
} from '../components/form/Campo';
import { IconoFlechaIzq } from '../components/icons';
import { useToast } from '../components/Toaster';

const ZONAS: { valor: ZonaLesion; label: string }[] = [
  { valor: 'Cabeza/cuello', label: 'Cabeza / cuello' },
  { valor: 'Hombro', label: 'Hombro' },
  { valor: 'Brazo', label: 'Brazo' },
  { valor: 'Mano/muñeca', label: 'Mano / muñeca' },
  { valor: 'Pecho/espalda', label: 'Pecho / espalda' },
  { valor: 'Cadera', label: 'Cadera' },
  { valor: 'Muslo', label: 'Muslo' },
  { valor: 'Rodilla', label: 'Rodilla' },
  { valor: 'Pierna', label: 'Pierna' },
  { valor: 'Tobillo', label: 'Tobillo' },
  { valor: 'Pie', label: 'Pie' },
];

function lesionInicial(): Lesion {
  const t = Date.now();
  // Pre-llenamos fechaAlta con hoy + 7 días (default de diasEstimados) para
  // que arranque "Activa" con una fecha estimada plausible. El usuario la
  // ajusta a la fecha real (pasada/presente/futura) antes de guardar.
  return {
    id: crypto.randomUUID(),
    fecha: hoyISO(),
    zona: 'Muslo',
    lado: 'Derecho',
    tipo: 'Muscular',
    gravedad: 'Leve',
    diasEstimados: 7,
    fechaAlta: sumarDias(hoyISO(), 7),
    tratamiento: '',
    notas: '',
    creadoEn: t,
    actualizadoEn: t,
  };
}

export function NuevaLesion() {
  const navigate = useNavigate();
  const { mostrar } = useToast();
  // Modo edición cuando la ruta es /lesiones/:id/editar.
  const { id } = useParams<{ id?: string }>();
  const esEdicion = Boolean(id);
  const lesionExistente = useLiveQuery(
    () => (id ? db.lesiones.get(id) : undefined),
    [id],
  );
  const [l, setL] = useState<Lesion>(lesionInicial);
  const [cargado, setCargado] = useState(!esEdicion);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (esEdicion && lesionExistente && !cargado) {
      // Spread defaults primero para que campos viejos undefined tengan
      // un valor sensato en el form (ej. fechaAlta para registros pre-v...).
      setL({ ...lesionInicial(), ...lesionExistente });
      setCargado(true);
    }
  }, [esEdicion, lesionExistente, cargado]);

  const set = <K extends keyof Lesion>(clave: K, v: Lesion[K]) =>
    setL((prev) => ({ ...prev, [clave]: v, actualizadoEn: Date.now() }));

  // El "estado" se deriva comparando la fecha de alta con hoy:
  //   - Si fechaAlta está en el futuro (o vacío) -> Activa (estimada)
  //   - Si fechaAlta es hoy o pasado            -> Recuperada
  // Esto permite usar el mismo campo "Fecha de alta" en los dos casos:
  // como fecha estimada de regreso (lesión activa) o como fecha real de
  // recuperación (lesión cerrada / pasada).
  const hoy = hoyISO();
  const estado: 'activa' | 'recuperada' =
    l.fechaAlta && l.fechaAlta <= hoy ? 'recuperada' : 'activa';

  const cambiarEstado = (nuevo: 'activa' | 'recuperada') => {
    if (nuevo === estado) return;
    if (nuevo === 'recuperada') {
      // Recuperada -> fecha de alta hoy (o ajustar a una pasada).
      set('fechaAlta', hoy);
    } else {
      // Activa -> fecha estimada en el futuro (hoy + diasEstimados, o
      // mañana mínimo). El usuario después la afina a mano.
      const dias = Math.max(1, l.diasEstimados || 7);
      const futura = sumarDias(hoy, dias);
      set('fechaAlta', futura);
    }
  };

  const handleGuardar = async () => {
    if (!l.fechaAlta) {
      setError(
        estado === 'recuperada'
          ? 'Cargá la fecha de alta (cuándo te recuperaste).'
          : 'Cargá la fecha estimada de alta (cuándo pensás volver).',
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (l.fechaAlta < l.fecha) {
      setError('La fecha de alta no puede ser anterior a la fecha de la lesión.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (l.tipo === 'Otro' && !(l.tipoOtro ?? '').trim()) {
      setError('Si elegiste "Otro" como tipo, especificá cuál fue la lesión.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      // Limpiamos tipoOtro si el tipo no es "Otro" (para que cambiar de
      // "Otro" → "Muscular" no deje el detalle viejo huérfano en la base).
      const limpio: Lesion = {
        ...l,
        tipoOtro: l.tipo === 'Otro' ? l.tipoOtro?.trim() : undefined,
      };
      // put = upsert: vale para crear y para editar.
      await db.lesiones.put(limpio);
      mostrar({
        tipo: 'exito',
        mensaje: esEdicion ? 'Cambios guardados' : 'Lesión registrada',
      });
      navigate(esEdicion ? `/lesiones/${l.id}` : '/lesiones');
    } finally {
      setGuardando(false);
    }
  };

  // Early return después de los hooks (ver la regla de hooks de React).
  if (esEdicion && lesionExistente === undefined) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">
      <div className="flex items-center gap-3">
        <Link
          to={esEdicion ? `/lesiones/${l.id}` : '/lesiones'}
          aria-label="Volver"
          className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
        >
          <IconoFlechaIzq size={22} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {esEdicion ? 'Editar lesión' : 'Nueva lesión'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {esEdicion
              ? 'Modificá los datos y guardá los cambios'
              : 'Registrá la lesión y su tratamiento. Podés cargar lesiones del pasado ya recuperadas.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rojo/10 border border-rojo/30 text-rojo px-4 py-2.5 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <Seccion titulo="Estado">
        <CampoPersonalizado label="¿En qué situación está esta lesión?">
          <Segmented<'activa' | 'recuperada'>
            opciones={[
              { valor: 'activa', label: '🩹 Activa' },
              { valor: 'recuperada', label: '✅ Recuperada' },
            ]}
            valor={estado}
            onChange={cambiarEstado}
          />
        </CampoPersonalizado>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
          Elegí <strong>Recuperada</strong> para registrar una lesión vieja que ya está cerrada
          (te va a pedir la fecha de alta).
        </p>
      </Seccion>

      <Seccion titulo="Datos básicos">
        <CampoTexto
          label="Fecha de la lesión"
          hint="📅"
          type="date"
          value={l.fecha}
          onChange={(ev) => set('fecha', ev.target.value)}
          ayuda="Cuándo te lesionaste (cualquier fecha, presente o pasado)"
        />
        <CampoSelect
          label="Zona del cuerpo"
          hint="📍"
          value={l.zona}
          onChange={(ev) => set('zona', ev.target.value as ZonaLesion)}
          opciones={ZONAS}
        />
        <CampoPersonalizado label="Lado">
          <Segmented<LadoLesion>
            opciones={[
              { valor: 'Izquierdo', label: 'Izq.' },
              { valor: 'Derecho', label: 'Der.' },
              { valor: 'Ambos', label: 'Ambos' },
              { valor: 'No aplica', label: 'N/A' },
            ]}
            valor={l.lado}
            onChange={(v) => set('lado', v)}
          />
        </CampoPersonalizado>
      </Seccion>

      <Seccion titulo="Detalle">
        <CampoSelect
          label="Tipo"
          value={l.tipo}
          onChange={(ev) => set('tipo', ev.target.value as TipoLesion)}
          opciones={[
            { valor: 'Muscular', label: 'Muscular' },
            { valor: 'Articular', label: 'Articular' },
            { valor: 'Golpe', label: 'Golpe' },
            { valor: 'Esguince', label: 'Esguince' },
            { valor: 'Fractura', label: 'Fractura' },
            { valor: 'Otro', label: 'Otro (especificar)' },
          ]}
        />
        {l.tipo === 'Otro' && (
          <CampoTexto
            label="¿Qué tipo de lesión fue?"
            hint="✏️"
            type="text"
            value={l.tipoOtro ?? ''}
            onChange={(ev) => set('tipoOtro', ev.target.value)}
            placeholder="Ej: tendinitis, contusión ósea, latigazo cervical…"
            ayuda="Describí en pocas palabras la lesión específica"
          />
        )}
        <CampoPersonalizado label="Gravedad">
          <Segmented<Gravedad>
            opciones={[
              { valor: 'Leve', label: 'Leve' },
              { valor: 'Moderada', label: 'Moderada' },
              { valor: 'Grave', label: 'Grave' },
            ]}
            valor={l.gravedad}
            onChange={(v) => set('gravedad', v)}
          />
        </CampoPersonalizado>
        <CampoTexto
          label="Días estimados sin jugar"
          hint="⏳"
          type="number"
          inputMode="numeric"
          min={0}
          max={365}
          value={l.diasEstimados}
          onChange={(ev) => set('diasEstimados', Math.max(0, Number(ev.target.value) || 0))}
        />
        <CampoTexto
          label={estado === 'recuperada' ? 'Fecha de alta' : 'Fecha estimada de alta'}
          hint="✅"
          type="date"
          value={l.fechaAlta ?? ''}
          onChange={(ev) => set('fechaAlta', ev.target.value || undefined)}
          ayuda={
            estado === 'recuperada'
              ? 'Cuándo volviste a estar bien'
              : 'Cuándo pensás volver a jugar (podés afinarla cuando te recuperes)'
          }
        />
      </Seccion>

      <Seccion titulo="Tratamiento y notas">
        <CampoTextarea
          label="Tratamiento / Kinesiología"
          hint="🩹"
          rows={3}
          value={l.tratamiento ?? ''}
          onChange={(ev) => set('tratamiento', ev.target.value)}
          placeholder="Ej: kinesiología 3 veces por semana, hielo y compresión los primeros días"
        />
        <CampoTextarea
          label="Notas"
          hint="📝"
          rows={2}
          value={l.notas ?? ''}
          onChange={(ev) => set('notas', ev.target.value)}
          placeholder="Cómo pasó, sensaciones, recomendaciones del médico"
        />
      </Seccion>

      <div className="flex gap-3 sticky bottom-20 md:bottom-0 pt-2">
        <Link
          to={esEdicion ? `/lesiones/${l.id}` : '/lesiones'}
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
          {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Guardar lesión'}
        </button>
      </div>
    </div>
  );
}
