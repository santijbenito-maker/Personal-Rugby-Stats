import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../db/schema';
import { hoyISO } from '../lib/fechas';
import type {
  Partido,
  Torneo,
  Condicion,
  EstadoCampo,
  Posicion,
  ComoEntre,
} from '../types';
import { Seccion } from '../components/form/Seccion';
import { Counter } from '../components/form/Counter';
import { Segmented } from '../components/form/Segmented';
import { Slider10 } from '../components/form/Slider10';
import { Fraccion } from '../components/form/Fraccion';
import { WeatherPicker } from '../components/form/WeatherPicker';
import {
  CampoTexto,
  CampoTextarea,
  CampoSelect,
  CampoPersonalizado,
} from '../components/form/Campo';
import { ResumenPartido } from '../components/ResumenPartido';
import { ResultadoBadge } from '../components/ResultadoBadge';
import { IconoFlechaIzq } from '../components/icons';

// ───────────────────────────────────────────────────────────────
// Partido inicial (valores por defecto)
// ───────────────────────────────────────────────────────────────

function partidoInicial(): Partido {
  const t = Date.now();
  return {
    id: crypto.randomUUID(),
    fecha: hoyISO(),
    rival: '',
    torneo: 'Oficial URT',
    condicion: 'Local',
    puntosPropios: 0,
    puntosRival: 0,
    clima: undefined,
    estadoCampo: 'Seco',
    temperatura: undefined,
    posicion: '10 - Apertura',
    minutos: 60,
    comoEntre: 'Titular',
    capitan: false,
    tries: 0,
    asistencias: 0,
    pasesCompletados: 0,
    pasesIntentados: 0,
    metrosGanados: 0,
    quiebres: 0,
    offloads: 0,
    tacklesEfectivos: 0,
    tacklesFallados: 0,
    turnoversGanados: 0,
    intercepciones: 0,
    kicksPaloConvertidos: 0,
    kicksPaloIntentados: 0,
    kicksTouchEfectivos: 0,
    kicksTouchIntentados: 0,
    kicksDespeje: 0,
    drops: 0,
    velocidadRuck: 5,
    calidadPase: 5,
    lecturaJuego: 5,
    penalesCometidos: 0,
    amarillas: 0,
    rojas: 0,
    sensacionFisico: 5,
    sensacionTecnico: 5,
    rating: 5,
    notasBien: '',
    notasMejorar: '',
    notasEntrenador: '',
    creadoEn: t,
    actualizadoEn: t,
  };
}

type TabStats = 'ataque' | 'defensa' | 'kicks' | 'rol' | 'disciplina';

const TABS: { id: TabStats; label: string }[] = [
  { id: 'ataque', label: 'Ataque' },
  { id: 'defensa', label: 'Defensa' },
  { id: 'kicks', label: 'Kicks' },
  { id: 'rol', label: 'Rol 9/10' },
  { id: 'disciplina', label: 'Disciplina' },
];

// ───────────────────────────────────────────────────────────────
// Página
// ───────────────────────────────────────────────────────────────

export function NuevoPartido() {
  const navigate = useNavigate();
  const [p, setP] = useState<Partido>(partidoInicial);
  const [tab, setTab] = useState<TabStats>('ataque');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  /** Helper para actualizar un campo del partido. */
  const set = <K extends keyof Partido>(clave: K, v: Partido[K]) =>
    setP((prev) => ({ ...prev, [clave]: v, actualizadoEn: Date.now() }));

  const handleGuardar = async () => {
    if (p.rival.trim().length === 0) {
      setError('Poné el nombre del rival antes de guardar.');
      // scroll hacia arriba para que vea el mensaje
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      await db.partidos.add({ ...p, rival: p.rival.trim() });
      navigate('/partidos');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">
      {/* Cabecera con botón volver */}
      <div className="flex items-center gap-3">
        <Link
          to="/partidos"
          aria-label="Volver a partidos"
          className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
        >
          <IconoFlechaIzq size={22} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Nuevo partido</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Cargá todos los datos del partido
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rojo/10 border border-rojo/30 text-rojo px-4 py-2.5 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {/* 1. Datos del partido */}
      <Seccion titulo="Datos del partido">
        <CampoTexto
          label="Fecha"
          hint="📅"
          type="date"
          value={p.fecha}
          onChange={(e) => set('fecha', e.target.value)}
        />
        <CampoTexto
          label="Rival"
          hint="🆚"
          placeholder="Ej: Huirapuca"
          value={p.rival}
          onChange={(e) => set('rival', e.target.value)}
        />
        <CampoSelect
          label="Torneo"
          hint="🏆"
          value={p.torneo}
          onChange={(e) => set('torneo', e.target.value as Torneo)}
          opciones={[
            { valor: 'Oficial URT', label: 'Oficial URT' },
            { valor: 'Amistoso', label: 'Amistoso' },
            { valor: 'Seven', label: 'Seven' },
            { valor: 'Nacional', label: 'Nacional' },
          ]}
        />
        <CampoPersonalizado label="Condición">
          <Segmented<Condicion>
            opciones={[
              { valor: 'Local', label: 'Local' },
              { valor: 'Visitante', label: 'Visitante' },
            ]}
            valor={p.condicion}
            onChange={(v) => set('condicion', v)}
          />
        </CampoPersonalizado>
      </Seccion>

      {/* 2. Resultado */}
      <Seccion titulo="Resultado">
        <ScoreBox
          puntosPropios={p.puntosPropios}
          puntosRival={p.puntosRival}
          rival={p.rival}
          onChangePropios={(v) => set('puntosPropios', v)}
          onChangeRival={(v) => set('puntosRival', v)}
        />
        <div className="flex justify-center">
          <ResultadoBadge partido={p} />
        </div>
      </Seccion>

      {/* 3. Clima */}
      <Seccion titulo="Clima">
        <CampoPersonalizado label="Clima">
          <WeatherPicker valor={p.clima} onChange={(v) => set('clima', v)} />
        </CampoPersonalizado>
        <CampoSelect
          label="Estado del campo"
          value={p.estadoCampo ?? 'Seco'}
          onChange={(e) => set('estadoCampo', e.target.value as EstadoCampo)}
          opciones={[
            { valor: 'Seco', label: 'Seco' },
            { valor: 'Húmedo', label: 'Húmedo' },
            { valor: 'Embarrado', label: 'Embarrado' },
            { valor: 'Pelado', label: 'Pelado' },
          ]}
        />
        <CampoTexto
          label="Temperatura (°C, opcional)"
          type="number"
          inputMode="numeric"
          value={p.temperatura ?? ''}
          onChange={(e) =>
            set('temperatura', e.target.value === '' ? undefined : Number(e.target.value))
          }
          placeholder="Ej: 22"
        />
      </Seccion>

      {/* 4. Mi participación */}
      <Seccion titulo="Mi participación">
        <CampoPersonalizado label="Posición">
          <Segmented<Posicion>
            opciones={[
              { valor: '9 - Medio scrum', label: '9 - Medio scrum' },
              { valor: '10 - Apertura', label: '10 - Apertura' },
            ]}
            valor={p.posicion}
            onChange={(v) => set('posicion', v)}
          />
        </CampoPersonalizado>
        <CampoTexto
          label="Minutos jugados"
          hint="⏱️"
          type="number"
          inputMode="numeric"
          min={0}
          max={80}
          value={p.minutos}
          onChange={(e) => set('minutos', Math.min(Number(e.target.value) || 0, 80))}
        />
        <CampoPersonalizado label="Cómo entré">
          <Segmented<ComoEntre>
            opciones={[
              { valor: 'Titular', label: 'Titular' },
              { valor: 'Suplente', label: 'Suplente' },
            ]}
            valor={p.comoEntre}
            onChange={(v) => set('comoEntre', v)}
          />
        </CampoPersonalizado>
        <CampoPersonalizado label="Capitán">
          <Segmented<boolean>
            opciones={[
              { valor: true, label: 'Sí' },
              { valor: false, label: 'No' },
            ]}
            valor={p.capitan}
            onChange={(v) => set('capitan', v)}
          />
        </CampoPersonalizado>
      </Seccion>

      {/* 5. Estadísticas (pestañas) */}
      <Seccion titulo="Estadísticas" descripcion="Cargá sólo lo que te acordás — se puede editar después">
        <TabsStats tab={tab} onChange={setTab} />
        <div className="mt-4">
          {tab === 'ataque' && <PestañaAtaque p={p} set={set} />}
          {tab === 'defensa' && <PestañaDefensa p={p} set={set} />}
          {tab === 'kicks' && <PestañaKicks p={p} set={set} />}
          {tab === 'rol' && <PestañaRol p={p} set={set} />}
          {tab === 'disciplina' && <PestañaDisciplina p={p} set={set} />}
        </div>
      </Seccion>

      {/* 6. Sensaciones */}
      <Seccion titulo="Sensaciones">
        <Slider10
          label="Físico"
          hint="💪"
          descripcion="Cómo respondió tu cuerpo"
          valor={p.sensacionFisico}
          onChange={(v) => set('sensacionFisico', v)}
          etiquetaMin="destruido"
          etiquetaMax="volando"
        />
        <Slider10
          label="Técnico"
          hint="🎯"
          descripcion="Cómo te salieron las jugadas"
          valor={p.sensacionTecnico}
          onChange={(v) => set('sensacionTecnico', v)}
          etiquetaMin="nada salió"
          etiquetaMax="todo perfecto"
        />
        <Slider10
          label="Rating general"
          hint="⭐"
          descripcion="Tu nota del partido"
          valor={p.rating}
          onChange={(v) => set('rating', v)}
          colorBarra="#F5B700"
          etiquetaDinamica={(v) =>
            v <= 2 ? 'Muy mal' : v <= 4 ? 'Flojo' : v <= 6 ? 'Bien' : v <= 8 ? 'Muy bien' : 'Excelente'
          }
        />
      </Seccion>

      {/* 7. Notas */}
      <Seccion titulo="Notas">
        <CampoTextarea
          label="Qué hice bien"
          hint="✅"
          rows={2}
          value={p.notasBien ?? ''}
          onChange={(e) => set('notasBien', e.target.value)}
          placeholder="Ej: Buena lectura en ataque, kicks al palo precisos"
        />
        <CampoTextarea
          label="Qué puedo mejorar"
          hint="📈"
          rows={2}
          value={p.notasMejorar ?? ''}
          onChange={(e) => set('notasMejorar', e.target.value)}
          placeholder="Ej: Apurar el pase en el lado ciego"
        />
        <CampoTextarea
          label="Notas del entrenador"
          hint="💬"
          rows={2}
          value={p.notasEntrenador ?? ''}
          onChange={(e) => set('notasEntrenador', e.target.value)}
          placeholder="Ej: Bien el control del juego en el primer tiempo"
        />
      </Seccion>

      {/* Resumen en vivo */}
      <ResumenPartido partido={p} />

      {/* Botones */}
      <div className="flex gap-3 sticky bottom-20 md:bottom-0 pt-2">
        <Link
          to="/partidos"
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
          {guardando ? 'Guardando…' : 'Guardar partido'}
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Subcomponentes
// ───────────────────────────────────────────────────────────────

function ScoreBox({
  puntosPropios,
  puntosRival,
  rival,
  onChangePropios,
  onChangeRival,
}: {
  puntosPropios: number;
  puntosRival: number;
  rival: string;
  onChangePropios: (v: number) => void;
  onChangeRival: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
      <LadoScore
        equipo="NOSOTROS TLTC"
        valor={puntosPropios}
        onChange={onChangePropios}
        color="azul"
      />
      <div className="flex items-center justify-center text-3xl font-bold text-slate-400">
        –
      </div>
      <LadoScore
        equipo={`ELLOS ${rival || '(rival)'}`}
        valor={puntosRival}
        onChange={onChangeRival}
        color="neutro"
      />
    </div>
  );
}

function LadoScore({
  equipo,
  valor,
  onChange,
  color,
}: {
  equipo: string;
  valor: number;
  onChange: (v: number) => void;
  color: 'azul' | 'neutro';
}) {
  const fondo =
    color === 'azul'
      ? 'bg-azul-principal text-white'
      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200';
  return (
    <div className={['rounded-lg p-3 text-center', fondo].join(' ')}>
      <p className="text-[10px] uppercase tracking-wider opacity-80 truncate">{equipo}</p>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={200}
        value={valor}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="mt-1 w-full bg-transparent text-center text-4xl font-bold tabular-nums focus:outline-none"
      />
    </div>
  );
}

function TabsStats({ tab, onChange }: { tab: TabStats; onChange: (t: TabStats) => void }) {
  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <div className="flex gap-1 px-4 md:px-0 min-w-max">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={[
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              tab === t.id
                ? 'bg-azul-principal text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper type para el set
type Setter = <K extends keyof Partido>(clave: K, v: Partido[K]) => void;

function PestañaAtaque({ p, set }: { p: Partido; set: Setter }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Counter label="Tries" hint="🏉" valor={p.tries} onChange={(v) => set('tries', v)} />
        <Counter label="Asistencias" valor={p.asistencias} onChange={(v) => set('asistencias', v)} />
      </div>
      <Fraccion
        label="Pases"
        hint="👐"
        etiquetaNumerador="completados"
        etiquetaDenominador="intentados"
        numerador={p.pasesCompletados}
        denominador={p.pasesIntentados}
        onChangeNumerador={(v) => set('pasesCompletados', v)}
        onChangeDenominador={(v) => set('pasesIntentados', v)}
      />
      <div className="grid grid-cols-3 gap-3">
        <Counter label="Metros" valor={p.metrosGanados} onChange={(v) => set('metrosGanados', v)} max={500} paso={5} />
        <Counter label="Quiebres" valor={p.quiebres} onChange={(v) => set('quiebres', v)} />
        <Counter label="Offloads" valor={p.offloads} onChange={(v) => set('offloads', v)} />
      </div>
    </div>
  );
}

function PestañaDefensa({ p, set }: { p: Partido; set: Setter }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Counter label="Efectivos" hint="✅" valor={p.tacklesEfectivos} onChange={(v) => set('tacklesEfectivos', v)} />
      <Counter label="Fallados" hint="❌" valor={p.tacklesFallados} onChange={(v) => set('tacklesFallados', v)} />
      <Counter label="Turnovers ganados" valor={p.turnoversGanados} onChange={(v) => set('turnoversGanados', v)} />
      <Counter label="Intercepciones" valor={p.intercepciones} onChange={(v) => set('intercepciones', v)} />
    </div>
  );
}

function PestañaKicks({ p, set }: { p: Partido; set: Setter }) {
  return (
    <div className="space-y-3">
      <Fraccion
        label="Kicks al palo"
        hint="🏉"
        etiquetaNumerador="convertidos"
        etiquetaDenominador="intentados"
        numerador={p.kicksPaloConvertidos}
        denominador={p.kicksPaloIntentados}
        onChangeNumerador={(v) => set('kicksPaloConvertidos', v)}
        onChangeDenominador={(v) => set('kicksPaloIntentados', v)}
      />
      <Fraccion
        label="Kicks al touch"
        hint="🎯"
        etiquetaNumerador="efectivos"
        etiquetaDenominador="intentados"
        numerador={p.kicksTouchEfectivos}
        denominador={p.kicksTouchIntentados}
        onChangeNumerador={(v) => set('kicksTouchEfectivos', v)}
        onChangeDenominador={(v) => set('kicksTouchIntentados', v)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Counter label="Kicks de despeje" valor={p.kicksDespeje} onChange={(v) => set('kicksDespeje', v)} />
        <Counter label="Drops convertidos" valor={p.drops} onChange={(v) => set('drops', v)} />
      </div>
    </div>
  );
}

function PestañaRol({ p, set }: { p: Partido; set: Setter }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Sliders específicos para medios (9/10). Auto-evaluá cómo te fue en cada aspecto clave.
      </p>
      <Slider10
        label="Velocidad de distribución del ruck"
        hint="⚡"
        valor={p.velocidadRuck}
        onChange={(v) => set('velocidadRuck', v)}
        etiquetaMin="lento"
        etiquetaMax="muy rápido"
      />
      <Slider10
        label="Calidad / precisión del pase"
        hint="🎯"
        valor={p.calidadPase}
        onChange={(v) => set('calidadPase', v)}
        etiquetaMin="impreciso"
        etiquetaMax="perfecto"
      />
      <Slider10
        label="Lectura de juego y decisiones"
        hint="🧠"
        valor={p.lecturaJuego}
        onChange={(v) => set('lecturaJuego', v)}
        etiquetaMin="dudé"
        etiquetaMax="claridad total"
      />
    </div>
  );
}

function PestañaDisciplina({ p, set }: { p: Partido; set: Setter }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Counter label="Penales" valor={p.penalesCometidos} onChange={(v) => set('penalesCometidos', v)} />
      <Counter label="Amarillas" hint="🟨" valor={p.amarillas} onChange={(v) => set('amarillas', v)} max={3} />
      <Counter label="Rojas" hint="🟥" valor={p.rojas} onChange={(v) => set('rojas', v)} max={2} />
    </div>
  );
}
