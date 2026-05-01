import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { hoyISO } from '../lib/fechas';
import { detectarPRs, ultimaVezEjercicio } from '../lib/gym';
import { mejorPesoHistorico } from '../lib/calculos';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import type {
  GymSesion,
  GymEjercicio,
  EjercicioDeSesion,
  FocoSesion,
  Serie,
} from '../types';
import { Seccion } from '../components/form/Seccion';
import { Segmented } from '../components/form/Segmented';
import { Slider10 } from '../components/form/Slider10';
import { CampoTexto, CampoTextarea, CampoPersonalizado } from '../components/form/Campo';
import { ResumenSesionGym } from '../components/ResumenSesionGym';
import { SelectorEjercicio } from '../components/SelectorEjercicio';
import { EjercicioEnSesion } from '../components/EjercicioEnSesion';
import { AdvertenciaGym } from '../components/AdvertenciaGym';
import { IconoFlechaIzq, IconoMas } from '../components/icons';
import { useToast } from '../components/Toaster';

function sesionInicial(): GymSesion {
  const t = Date.now();
  return {
    id: crypto.randomUUID(),
    fecha: hoyISO(),
    duracion: 60,
    foco: 'Tren inferior',
    ejercicios: [],
    sensacion: 7,
    notas: '',
    creadoEn: t,
    actualizadoEn: t,
  };
}

export function NuevaSesionGym() {
  const navigate = useNavigate();
  const { mostrar } = useToast();
  // Modo edición cuando la ruta es /gym/:id/editar.
  const { id } = useParams<{ id?: string }>();
  const esEdicion = Boolean(id);
  const sesionExistente = useLiveQuery(
    () => (id ? db.gym_sesiones.get(id) : undefined),
    [id],
  );
  const [s, setS] = useState<GymSesion>(sesionInicial);
  const [cargado, setCargado] = useState(!esEdicion);
  const [error, setError] = useState<string | null>(null);
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const ejerciciosDB = useLiveQuery(() => db.gym_ejercicios.toArray(), [], []);
  const sesionesPrevias = useLiveQuery(() => db.gym_sesiones.toArray(), [], []);

  useEffect(() => {
    if (esEdicion && sesionExistente && !cargado) {
      // Spread defaults primero por si vienen campos undefined.
      setS({ ...sesionInicial(), ...sesionExistente });
      setCargado(true);
    }
  }, [esEdicion, sesionExistente, cargado]);

  // Mapa de mejores pesos previos por ejercicioId — usado por el resumen
  // para mostrar 🏆 PR en vivo mientras se carga.
  const mejoresPrevios = useMemo(() => {
    const m = new Map<string, number>();
    for (const ej of s.ejercicios) {
      m.set(ej.ejercicioId, mejorPesoHistorico(sesionesPrevias, ej.ejercicioId, s.fecha));
    }
    return m;
  }, [s.ejercicios, s.fecha, sesionesPrevias]);

  const yaAgregados = useMemo(
    () => new Set(s.ejercicios.map((e) => e.ejercicioId)),
    [s.ejercicios],
  );

  // Early return DESPUÉS de todos los hooks: en modo edición y mientras Dexie
  // todavía no resolvió la query del registro a editar, mostramos un skeleton.
  // (Si lo hiciéramos antes de los useMemo, el orden de hooks cambiaría entre
  // renders y React tiraría un error de "rendered fewer hooks than expected").
  if (esEdicion && sesionExistente === undefined) {
    return <LoadingSkeleton />;
  }

  const set = <K extends keyof GymSesion>(clave: K, v: GymSesion[K]) =>
    setS((prev) => ({ ...prev, [clave]: v, actualizadoEn: Date.now() }));

  /** Agregar un ejercicio a la sesión, precargando series si tiene histórico. */
  const handleAgregarEjercicio = (ej: GymEjercicio) => {
    const ultima = ultimaVezEjercicio(sesionesPrevias, ej.id);
    const series: Serie[] = ultima
      ? ultima.series.map((sr) => ({ peso: sr.peso, reps: sr.reps, rir: sr.rir }))
      : [{ peso: 0, reps: 0 }];
    const nuevo: EjercicioDeSesion = {
      ejercicioId: ej.id,
      series,
      fueRecord: false,
    };
    setS((prev) => ({
      ...prev,
      ejercicios: [...prev.ejercicios, nuevo],
      actualizadoEn: Date.now(),
    }));
    setSelectorAbierto(false);
  };

  const handleCambiarEjercicio = (idx: number, nuevo: EjercicioDeSesion) => {
    setS((prev) => ({
      ...prev,
      ejercicios: prev.ejercicios.map((e, i) => (i === idx ? nuevo : e)),
      actualizadoEn: Date.now(),
    }));
  };

  const handleRemoverEjercicio = (idx: number) => {
    setS((prev) => ({
      ...prev,
      ejercicios: prev.ejercicios.filter((_, i) => i !== idx),
      actualizadoEn: Date.now(),
    }));
  };

  const handleGuardar = async () => {
    if (s.ejercicios.length === 0) {
      setError('Tenés que agregar al menos un ejercicio antes de guardar.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      // Para PRs, comparamos contra las sesiones previas EXCLUYENDO esta misma
      // sesión (en modo edición, sino se compararía contra sí misma).
      const sesionesParaPR = esEdicion
        ? sesionesPrevias.filter((ses) => ses.id !== s.id)
        : sesionesPrevias;

      // Detección de PRs (muta sesionFinal.ejercicios[i].fueRecord)
      const sesionFinal: GymSesion = {
        ...s,
        ejercicios: s.ejercicios.map((e) => ({ ...e, series: e.series.map((sr) => ({ ...sr })) })),
      };
      const prs = detectarPRs(sesionFinal, sesionesParaPR, ejerciciosDB);

      // En edición usamos put (upsert) y NO incrementamos frecuenciaDeUso para
      // no doblar el contador. Solo se incrementa al crear.
      await db.transaction('rw', db.gym_sesiones, db.gym_ejercicios, async () => {
        if (esEdicion) {
          await db.gym_sesiones.put(sesionFinal);
        } else {
          await db.gym_sesiones.add(sesionFinal);
          for (const ej of sesionFinal.ejercicios) {
            const def = await db.gym_ejercicios.get(ej.ejercicioId);
            if (def) {
              await db.gym_ejercicios.update(ej.ejercicioId, {
                frecuenciaDeUso: (def.frecuenciaDeUso ?? 0) + 1,
              });
            }
          }
        }
      });

      // Mostrar toasts de PRs (solo en creación; al editar evitamos confusión)
      if (!esEdicion) {
        for (const pr of prs) {
          mostrar({
            tipo: 'pr',
            mensaje: `¡Nuevo PR en ${pr.nombre}! ${pr.pesoNuevo} kg × ${pr.repsNuevo}`,
            duracion: 6000,
          });
        }
        if (prs.length === 0) {
          mostrar({ tipo: 'exito', mensaje: 'Sesión guardada' });
        }
      } else {
        mostrar({ tipo: 'exito', mensaje: 'Cambios guardados' });
      }

      navigate(esEdicion ? `/gym/${s.id}` : '/gym');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">
      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <Link
          to={esEdicion ? `/gym/${s.id}` : '/gym'}
          aria-label="Volver"
          className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
        >
          <IconoFlechaIzq size={22} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {esEdicion ? 'Editar sesión de gym' : 'Nueva sesión de gym'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {esEdicion
              ? 'Modificá los datos y guardá los cambios'
              : 'Registrá los ejercicios y series que hiciste'}
          </p>
        </div>
      </div>

      <AdvertenciaGym />

      {error && (
        <div className="bg-rojo/10 border border-rojo/30 text-rojo px-4 py-2.5 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {/* Datos */}
      <Seccion titulo="Datos">
        <CampoTexto
          label="Fecha"
          hint="📅"
          type="date"
          value={s.fecha}
          onChange={(ev) => set('fecha', ev.target.value)}
        />
        <CampoTexto
          label="Duración (min)"
          hint="⏱️"
          type="number"
          inputMode="numeric"
          min={0}
          max={300}
          value={s.duracion}
          onChange={(ev) => set('duracion', Math.max(0, Number(ev.target.value) || 0))}
        />
        <CampoPersonalizado label="Foco de la sesión">
          <Segmented<FocoSesion>
            opciones={[
              { valor: 'Tren inferior', label: 'Inferior' },
              { valor: 'Tren superior', label: 'Superior' },
              { valor: 'Full body', label: 'Full body' },
              { valor: 'Core', label: 'Core' },
            ]}
            valor={s.foco}
            onChange={(v) => set('foco', v)}
          />
        </CampoPersonalizado>
      </Seccion>

      {/* Ejercicios */}
      <Seccion
        titulo="Ejercicios"
        descripcion="Agregá los ejercicios que hiciste, cargá las series con peso, reps y RIR"
      >
        {s.ejercicios.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-4">
            Todavía no agregaste ejercicios.
          </p>
        ) : (
          <div className="space-y-3">
            {s.ejercicios.map((ej, idx) => {
              const def = ejerciciosDB.find((e) => e.id === ej.ejercicioId);
              if (!def) return null;
              const ultima = ultimaVezEjercicio(
                sesionesPrevias.filter((ses) => ses.id !== s.id),
                def.id,
              );
              return (
                <EjercicioEnSesion
                  key={`${ej.ejercicioId}-${idx}`}
                  ejercicio={def}
                  enSesion={ej}
                  ultimaVezTexto={
                    ultima ? `${ultima.textoBreve} · ${ultima.hace}` : undefined
                  }
                  onChange={(nuevo) => handleCambiarEjercicio(idx, nuevo)}
                  onRemover={() => handleRemoverEjercicio(idx)}
                />
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => setSelectorAbierto(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-azul-principal text-azul-principal dark:text-amarillo-acento py-3 rounded-lg text-sm font-semibold transition"
        >
          <IconoMas size={18} />
          Agregar ejercicio
        </button>
      </Seccion>

      {/* Sensación */}
      <Seccion titulo="Sensación de la sesión">
        <Slider10
          label="¿Cómo te sentiste?"
          valor={s.sensacion}
          onChange={(v) => set('sensacion', v)}
          etiquetaMin="muy mal"
          etiquetaMax="excelente"
          etiquetaDinamica={(v) =>
            v <= 2 ? 'Muy mal' : v <= 4 ? 'Regular' : v <= 6 ? 'Bien' : v <= 8 ? 'Muy bien' : 'Excelente / Top'
          }
        />
      </Seccion>

      {/* Notas */}
      <Seccion titulo="Notas">
        <CampoTextarea
          label="Comentarios"
          hint="📝"
          rows={3}
          value={s.notas ?? ''}
          onChange={(ev) => set('notas', ev.target.value)}
          placeholder="Algo destacado, sensaciones, técnica, lo que quieras recordar"
        />
      </Seccion>

      {/* Resumen en vivo */}
      <ResumenSesionGym sesion={s} ejercicios={ejerciciosDB} mejoresPrevios={mejoresPrevios} />

      {/* Botones */}
      <div className="flex gap-3 sticky bottom-20 md:bottom-0 pt-2">
        <Link
          to={esEdicion ? `/gym/${s.id}` : '/gym'}
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
          {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Guardar sesión'}
        </button>
      </div>

      {/* Modal del selector */}
      <SelectorEjercicio
        abierto={selectorAbierto}
        yaAgregados={yaAgregados}
        onCerrar={() => setSelectorAbierto(false)}
        onSeleccionar={handleAgregarEjercicio}
      />
    </div>
  );
}
