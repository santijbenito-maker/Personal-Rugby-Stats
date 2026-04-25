import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../db/schema';
import { hoyISO } from '../lib/fechas';
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
  return {
    id: crypto.randomUUID(),
    fecha: hoyISO(),
    zona: 'Muslo',
    lado: 'Derecho',
    tipo: 'Muscular',
    gravedad: 'Leve',
    diasEstimados: 7,
    fechaAlta: undefined,
    tratamiento: '',
    notas: '',
    creadoEn: t,
    actualizadoEn: t,
  };
}

export function NuevaLesion() {
  const navigate = useNavigate();
  const { mostrar } = useToast();
  const [l, setL] = useState<Lesion>(lesionInicial);
  const [guardando, setGuardando] = useState(false);

  const set = <K extends keyof Lesion>(clave: K, v: Lesion[K]) =>
    setL((prev) => ({ ...prev, [clave]: v, actualizadoEn: Date.now() }));

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await db.lesiones.add(l);
      mostrar({ tipo: 'exito', mensaje: 'Lesión registrada' });
      navigate('/lesiones');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">
      <div className="flex items-center gap-3">
        <Link
          to="/lesiones"
          aria-label="Volver"
          className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
        >
          <IconoFlechaIzq size={22} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Nueva lesión</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Registrá la lesión y su tratamiento</p>
        </div>
      </div>

      <Seccion titulo="Datos básicos">
        <CampoTexto
          label="Fecha de la lesión"
          hint="📅"
          type="date"
          value={l.fecha}
          onChange={(ev) => set('fecha', ev.target.value)}
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
            { valor: 'Otro', label: 'Otro' },
          ]}
        />
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
          label="Fecha de alta (opcional)"
          hint="✅"
          type="date"
          value={l.fechaAlta ?? ''}
          onChange={(ev) => set('fechaAlta', ev.target.value || undefined)}
          ayuda="Cargala cuando estés recuperado"
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
          to="/lesiones"
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
          {guardando ? 'Guardando…' : 'Guardar lesión'}
        </button>
      </div>
    </div>
  );
}
