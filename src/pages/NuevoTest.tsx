import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { hoyISO } from '../lib/fechas';
import { esRecord, etiquetaKind, epley1RM, formatearMmSs } from '../lib/fisico';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import type { TestFisico, KindTestFisico } from '../types';
import { Seccion } from '../components/form/Seccion';
import { Slider10 } from '../components/form/Slider10';
import {
  CampoTexto,
  CampoTextarea,
  CampoPersonalizado,
} from '../components/form/Campo';
import { IconoFlechaIzq } from '../components/icons';
import { useToast } from '../components/Toaster';

const KINDS: { valor: KindTestFisico; label: string; emoji: string }[] = [
  { valor: 'sentadilla', label: 'Sentadilla', emoji: '🦵' },
  { valor: 'press_banca', label: 'Press banca', emoji: '💪' },
  { valor: 'bronco', label: 'Bronco', emoji: '🏃' },
  { valor: '40m', label: '40 m', emoji: '💨' },
];

function testInicial(kind: KindTestFisico = 'sentadilla'): TestFisico {
  const t = Date.now();
  return {
    id: crypto.randomUUID(),
    fecha: hoyISO(),
    kind,
    pesoKg: undefined,
    reps: undefined,
    segundos: undefined,
    sensacionFisico: 7,
    rpe: 7,
    notas: '',
    creadoEn: t,
    actualizadoEn: t,
  };
}

export function NuevoTest() {
  const navigate = useNavigate();
  const { mostrar } = useToast();
  // Modo edición cuando la ruta es /fisico/:id/editar.
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const kindInicial = (() => {
    const k = searchParams.get('kind') as KindTestFisico | null;
    return k && KINDS.some((op) => op.valor === k) ? k : 'sentadilla';
  })();
  const esEdicion = Boolean(id);
  const testExistente = useLiveQuery(
    () => (id ? db.tests_fisicos.get(id) : undefined),
    [id],
  );
  // Para detección de PR al guardar.
  const todosLosTests = useLiveQuery(
    () => db.tests_fisicos.toArray(),
    [],
    [],
  );

  const [t, setT] = useState<TestFisico>(() => testInicial(kindInicial));
  const [cargado, setCargado] = useState(!esEdicion);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Para el Bronco usamos dos inputs separados (mm + ss) y los combinamos
  // en `segundos` al setear. Cuando viene un test existente, partimos los
  // segundos en sus componentes.
  const [broncoMin, setBroncoMin] = useState(0);
  const [broncoSeg, setBroncoSeg] = useState(0);

  useEffect(() => {
    if (esEdicion && testExistente && !cargado) {
      setT({ ...testInicial(testExistente.kind ?? 'sentadilla'), ...testExistente });
      if (testExistente.kind === 'bronco' && typeof testExistente.segundos === 'number') {
        setBroncoMin(Math.floor(testExistente.segundos / 60));
        setBroncoSeg(testExistente.segundos % 60);
      }
      setCargado(true);
    }
  }, [esEdicion, testExistente, cargado]);

  // Para nuevos: cuando cambia el kind manualmente, limpiar campos específicos
  // para que no queden datos del kind anterior.
  const cambiarKind = (nuevo: KindTestFisico) => {
    if (nuevo === t.kind) return;
    setT((prev) => ({
      ...prev,
      kind: nuevo,
      pesoKg: undefined,
      reps: undefined,
      segundos: undefined,
      actualizadoEn: Date.now(),
    }));
    setBroncoMin(0);
    setBroncoSeg(0);
  };

  const set = <K extends keyof TestFisico>(clave: K, v: TestFisico[K]) =>
    setT((prev) => ({ ...prev, [clave]: v, actualizadoEn: Date.now() }));

  const handleGuardar = async () => {
    const validacion = validar(t);
    if (validacion) {
      setError(validacion);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      // Detectar PR comparando contra los OTROS tests del mismo kind.
      const fueRecord = esRecord(t, todosLosTests);
      const final: TestFisico = { ...t, fueRecord };
      await db.tests_fisicos.put(final);
      if (fueRecord && !esEdicion) {
        mostrar({
          tipo: 'pr',
          mensaje: `🏆 ¡PR en ${etiquetaKind(final.kind)}!`,
          duracion: 6000,
        });
      } else {
        mostrar({
          tipo: 'exito',
          mensaje: esEdicion ? 'Cambios guardados' : 'Test guardado',
        });
      }
      navigate(esEdicion ? `/fisico/${t.id}` : '/fisico');
    } finally {
      setGuardando(false);
    }
  };

  // 1RM estimado en vivo para sentadilla / press banca (sólo display).
  const oneRMEstimado = useMemo(() => {
    if (t.kind !== 'sentadilla' && t.kind !== 'press_banca') return null;
    if (!t.pesoKg || !t.reps) return null;
    return Math.round(epley1RM(t.pesoKg, t.reps));
  }, [t.kind, t.pesoKg, t.reps]);

  // Early return después de los hooks.
  if (esEdicion && testExistente === undefined) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">
      <div className="flex items-center gap-3">
        <Link
          to={esEdicion ? `/fisico/${t.id}` : '/fisico'}
          aria-label="Volver"
          className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
        >
          <IconoFlechaIzq size={22} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {esEdicion ? 'Editar test' : 'Nuevo test físico'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {esEdicion
              ? 'Modificá los datos y guardá los cambios'
              : 'Elegí qué test fue y cargá los datos'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rojo/10 border border-rojo/30 text-rojo px-4 py-2.5 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <Seccion titulo="Tipo de test">
        <CampoPersonalizado label="¿Qué test fue?">
          <div className="grid grid-cols-2 gap-2">
            {KINDS.map((op) => {
              const activo = op.valor === t.kind;
              return (
                <button
                  key={op.valor}
                  type="button"
                  onClick={() => cambiarKind(op.valor)}
                  aria-pressed={activo}
                  className={[
                    'flex flex-col items-center justify-center gap-1 rounded-lg p-3 border transition',
                    activo
                      ? 'bg-azul-principal text-white border-azul-principal shadow'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-azul-principal/50',
                  ].join(' ')}
                >
                  <span className="text-2xl" aria-hidden>{op.emoji}</span>
                  <span className="text-sm font-semibold">{op.label}</span>
                </button>
              );
            })}
          </div>
        </CampoPersonalizado>
      </Seccion>

      <Seccion titulo="Fecha">
        <CampoTexto
          label="Fecha del test"
          hint="📅"
          type="date"
          value={t.fecha}
          onChange={(ev) => set('fecha', ev.target.value)}
        />
      </Seccion>

      {(t.kind === 'sentadilla' || t.kind === 'press_banca') && (
        <Seccion
          titulo={`Datos del ${etiquetaKind(t.kind).toLowerCase()}`}
          descripcion="Cargá el set tope (la serie más exigente)"
        >
          <CampoTexto
            label="Peso (kg)"
            hint="🏋️"
            type="number"
            inputMode="decimal"
            step={0.5}
            min={0}
            max={500}
            value={t.pesoKg ?? ''}
            onChange={(ev) =>
              set('pesoKg', ev.target.value === '' ? undefined : Number(ev.target.value))
            }
            placeholder="Ej: 80"
          />
          <CampoTexto
            label="Repeticiones"
            hint="🔢"
            type="number"
            inputMode="numeric"
            min={1}
            max={30}
            value={t.reps ?? ''}
            onChange={(ev) =>
              set('reps', ev.target.value === '' ? undefined : Number(ev.target.value))
            }
            placeholder="Ej: 3"
          />
          {oneRMEstimado !== null && (
            <div className="bg-amarillo-claro dark:bg-amarillo-acento/10 border border-amarillo-acento/30 rounded-md px-3 py-2 text-sm">
              <strong>1RM estimado: {oneRMEstimado} kg</strong>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Fórmula Epley · útil para comparar levantamientos con distinta carga / reps.
              </p>
            </div>
          )}
        </Seccion>
      )}

      {t.kind === '40m' && (
        <Seccion titulo="Tiempo">
          <CampoTexto
            label="Tiempo en segundos"
            hint="💨"
            type="number"
            inputMode="decimal"
            step={0.01}
            min={0}
            max={20}
            value={t.segundos ?? ''}
            onChange={(ev) =>
              set('segundos', ev.target.value === '' ? undefined : Number(ev.target.value))
            }
            placeholder="Ej: 5.42"
            ayuda="Menor es mejor — la app detecta el PR sola"
          />
        </Seccion>
      )}

      {t.kind === 'bronco' && (
        <Seccion
          titulo="Tiempo"
          descripcion="Tiempo total que tardaste en completar el Bronco"
        >
          <div className="grid grid-cols-2 gap-3">
            <CampoTexto
              label="Minutos"
              hint="⏱️"
              type="number"
              inputMode="numeric"
              min={0}
              max={20}
              value={broncoMin || ''}
              onChange={(ev) => {
                const m = Math.max(0, Number(ev.target.value) || 0);
                setBroncoMin(m);
                set('segundos', m * 60 + broncoSeg);
              }}
              placeholder="4"
            />
            <CampoTexto
              label="Segundos"
              type="number"
              inputMode="numeric"
              min={0}
              max={59}
              value={broncoSeg || ''}
              onChange={(ev) => {
                const s = Math.min(59, Math.max(0, Number(ev.target.value) || 0));
                setBroncoSeg(s);
                set('segundos', broncoMin * 60 + s);
              }}
              placeholder="45"
            />
          </div>
          {t.segundos !== undefined && t.segundos > 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Total: <strong>{formatearMmSs(t.segundos)}</strong>
            </p>
          )}
        </Seccion>
      )}

      <Seccion titulo="Sensaciones y esfuerzo">
        <Slider10
          label="Sensación física"
          hint="💪"
          descripcion="Cómo te sentiste durante el test"
          valor={t.sensacionFisico}
          onChange={(v) => set('sensacionFisico', v)}
          etiquetaMin="muy mal"
          etiquetaMax="excelente"
        />
        <Slider10
          label="Esfuerzo (RPE)"
          hint="🔥"
          descripcion="Qué tan exigente fue (1 = suave, 10 = al límite)"
          valor={t.rpe}
          onChange={(v) => set('rpe', v)}
          etiquetaMin="muy suave"
          etiquetaMax="al límite"
          colorBarra="#F5B700"
        />
      </Seccion>

      <Seccion titulo="Notas">
        <CampoTextarea
          label="Comentarios"
          hint="📝"
          rows={3}
          value={t.notas ?? ''}
          onChange={(ev) => set('notas', ev.target.value)}
          placeholder="Condiciones del test, calzado, calentamiento, sensaciones"
        />
      </Seccion>

      <div className="flex gap-3 sticky bottom-20 md:bottom-0 pt-2">
        <Link
          to={esEdicion ? `/fisico/${t.id}` : '/fisico'}
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
          {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Guardar test'}
        </button>
      </div>
    </div>
  );
}

/** Devuelve un string de error si el test no es válido para guardar, o null. */
function validar(t: TestFisico): string | null {
  if (t.kind === 'sentadilla' || t.kind === 'press_banca') {
    if (!t.pesoKg || t.pesoKg <= 0) return 'Cargá el peso levantado.';
    if (!t.reps || t.reps <= 0) return 'Cargá la cantidad de repeticiones.';
  }
  if (t.kind === '40m') {
    if (!t.segundos || t.segundos <= 0) return 'Cargá el tiempo en segundos.';
  }
  if (t.kind === 'bronco') {
    if (!t.segundos || t.segundos <= 0) return 'Cargá el tiempo del Bronco.';
  }
  return null;
}

// Slider10 vive en form/Slider10 — el form de entreno ya lo usa así que reutilizamos.
