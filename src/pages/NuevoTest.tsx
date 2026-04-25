import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../db/schema';
import { hoyISO } from '../lib/fechas';
import type { TestFisico } from '../types';
import { Seccion } from '../components/form/Seccion';
import { CampoTexto, CampoTextarea } from '../components/form/Campo';
import { IconoFlechaIzq } from '../components/icons';
import { useToast } from '../components/Toaster';

function testInicial(): TestFisico {
  const t = Date.now();
  return {
    id: crypto.randomUUID(),
    fecha: hoyISO(),
    pesoCorporal: undefined,
    altura: undefined,
    t40m: undefined,
    beepTest: undefined,
    flexiones: undefined,
    abdominales: undefined,
    notas: '',
    creadoEn: t,
    actualizadoEn: t,
  };
}

export function NuevoTest() {
  const navigate = useNavigate();
  const { mostrar } = useToast();
  const [t, setT] = useState<TestFisico>(testInicial);
  const [guardando, setGuardando] = useState(false);

  const set = <K extends keyof TestFisico>(clave: K, v: TestFisico[K]) =>
    setT((prev) => ({ ...prev, [clave]: v, actualizadoEn: Date.now() }));

  /** Helper: parsea un número opcional (vacío -> undefined). */
  const num = (v: string): number | undefined =>
    v === '' ? undefined : Number(v);

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await db.tests_fisicos.add(t);
      mostrar({ tipo: 'exito', mensaje: 'Test físico guardado' });
      navigate('/fisico');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">
      <div className="flex items-center gap-3">
        <Link
          to="/fisico"
          aria-label="Volver"
          className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
        >
          <IconoFlechaIzq size={22} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Nuevo test físico</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Completá sólo los campos que mediste
          </p>
        </div>
      </div>

      <Seccion titulo="Fecha">
        <CampoTexto
          label="Fecha del test"
          hint="📅"
          type="date"
          value={t.fecha}
          onChange={(ev) => set('fecha', ev.target.value)}
        />
      </Seccion>

      <Seccion titulo="Antropometría">
        <CampoTexto
          label="Peso corporal (kg)"
          hint="⚖️"
          type="number"
          inputMode="decimal"
          step={0.1}
          value={t.pesoCorporal ?? ''}
          onChange={(ev) => set('pesoCorporal', num(ev.target.value))}
          placeholder="Ej: 57.8"
        />
        <CampoTexto
          label="Altura (cm)"
          hint="📏"
          type="number"
          inputMode="numeric"
          value={t.altura ?? ''}
          onChange={(ev) => set('altura', num(ev.target.value))}
          placeholder="Ej: 171"
        />
      </Seccion>

      <Seccion titulo="Velocidad y resistencia">
        <CampoTexto
          label="Tiempo 40 metros (seg)"
          hint="💨"
          type="number"
          inputMode="decimal"
          step={0.01}
          value={t.t40m ?? ''}
          onChange={(ev) => set('t40m', num(ev.target.value))}
          placeholder="Ej: 5.7"
        />
        <CampoTexto
          label="Beep test / Yo-Yo (nivel)"
          hint="🏃"
          type="number"
          inputMode="decimal"
          step={0.1}
          value={t.beepTest ?? ''}
          onChange={(ev) => set('beepTest', num(ev.target.value))}
          placeholder="Ej: 10.3"
          ayuda="Nivel alcanzado en el test"
        />
      </Seccion>

      <Seccion titulo="Fuerza de resistencia">
        <CampoTexto
          label="Flexiones en 1 min"
          hint="💪"
          type="number"
          inputMode="numeric"
          value={t.flexiones ?? ''}
          onChange={(ev) => set('flexiones', num(ev.target.value))}
          placeholder="Ej: 40"
        />
        <CampoTexto
          label="Abdominales en 1 min"
          hint="🔥"
          type="number"
          inputMode="numeric"
          value={t.abdominales ?? ''}
          onChange={(ev) => set('abdominales', num(ev.target.value))}
          placeholder="Ej: 52"
        />
      </Seccion>

      <Seccion titulo="Notas">
        <CampoTextarea
          label="Comentarios"
          hint="📝"
          rows={3}
          value={t.notas ?? ''}
          onChange={(ev) => set('notas', ev.target.value)}
          placeholder="Condiciones del test, sensaciones, lo que quieras recordar"
        />
      </Seccion>

      <div className="flex gap-3 sticky bottom-20 md:bottom-0 pt-2">
        <Link
          to="/fisico"
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
          {guardando ? 'Guardando…' : 'Guardar test'}
        </button>
      </div>
    </div>
  );
}
