/**
 * Tipos compartidos de dominio rugby.
 * Todas las entidades tienen id (UUID), fecha (string "YYYY-MM-DD")
 * y timestamps de creado/actualizado (ms desde epoch).
 */

// ───────────────────────────────────────────────────────────────
// Partidos
// ───────────────────────────────────────────────────────────────

export type Torneo = 'Oficial URT' | 'Amistoso' | 'Seven' | 'Nacional';
export type Condicion = 'Local' | 'Visitante';
export type Clima = 'Soleado' | 'Nublado' | 'Lluvia' | 'Frío';
export type EstadoCampo = 'Seco' | 'Húmedo' | 'Embarrado' | 'Pelado';
export type Posicion = '9 - Medio scrum' | '10 - Apertura';
export type ComoEntre = 'Titular' | 'Suplente';
export type ResultadoTipo = 'ganamos' | 'perdimos' | 'empate';

export type Partido = {
  id: string;
  fecha: string;
  rival: string;
  torneo: Torneo;
  condicion: Condicion;
  puntosPropios: number;
  puntosRival: number;
  clima?: Clima;
  estadoCampo?: EstadoCampo;
  temperatura?: number;
  posicion: Posicion;
  minutos: number;
  comoEntre: ComoEntre;
  capitan: boolean;
  // Ataque
  tries: number;
  asistencias: number;
  pasesCompletados: number;
  pasesIntentados: number;
  metrosGanados: number;
  quiebres: number;
  offloads: number;
  // Defensa
  tacklesEfectivos: number;
  tacklesFallados: number;
  turnoversGanados: number;
  intercepciones: number;
  // Kicks
  kicksPaloConvertidos: number;
  kicksPaloIntentados: number;
  kicksTouchEfectivos: number;
  kicksTouchIntentados: number;
  kicksDespeje: number;
  drops: number;
  // Rol 9/10
  velocidadRuck: number; // 1-10
  calidadPase: number; // 1-10
  lecturaJuego: number; // 1-10
  // Disciplina
  penalesCometidos: number;
  amarillas: number;
  rojas: number;
  // Sensaciones
  sensacionFisico: number; // 1-10
  sensacionTecnico: number; // 1-10
  rating: number; // 1-10
  // Notas
  notasBien?: string;
  notasMejorar?: string;
  notasEntrenador?: string;
  // Timestamps
  creadoEn: number;
  actualizadoEn: number;
};

// ───────────────────────────────────────────────────────────────
// Entrenamientos
// ───────────────────────────────────────────────────────────────

export type TipoEntreno = 'Técnico' | 'Físico' | 'Táctico' | 'Partido práctica';
export type Asistencia = 'Presente' | 'Llegué tarde' | 'Ausente';
export type EjercicioTrabajado =
  | 'Pases'
  | 'Patadas'
  | 'Tackles'
  | 'Rucks'
  | 'Lineout'
  | 'Scrum'
  | 'Defensa'
  | 'Ataque'
  | 'Físico';

export type Entrenamiento = {
  id: string;
  fecha: string;
  duracion: number; // minutos
  tipo: TipoEntreno;
  minutosReales?: number; // sólo si tipo = "Partido práctica"
  clima?: Clima;
  temperatura?: number;
  asistencia: Asistencia;
  ejerciciosTrabajados: EjercicioTrabajado[];
  otrosEjercicios?: string;
  rpe: number; // 1-10
  sensacionFisico: number; // 1-10
  sensacionTecnico: number; // 1-10
  notas?: string;
  creadoEn: number;
  actualizadoEn: number;
};

// ───────────────────────────────────────────────────────────────
// Gym
// ───────────────────────────────────────────────────────────────

export type GrupoMuscular =
  | 'Tren inferior'
  | 'Tren superior'
  | 'Core'
  | 'Rugby específico';

export type FocoSesion = 'Tren inferior' | 'Tren superior' | 'Full body' | 'Core';

export type GymEjercicio = {
  id: string;
  nombre: string;
  grupoMuscular: GrupoMuscular;
  esPersonalizado: boolean;
  frecuenciaDeUso: number;
  creadoEn: number;
};

export type Serie = {
  peso: number; // kg
  reps: number;
  rir?: number; // reps in reserve (opcional)
};

export type EjercicioDeSesion = {
  ejercicioId: string;
  series: Serie[];
  fueRecord?: boolean; // true si en esta sesión se hizo un PR
};

export type GymSesion = {
  id: string;
  fecha: string;
  duracion: number; // minutos
  foco: FocoSesion;
  ejercicios: EjercicioDeSesion[];
  sensacion: number; // 1-10
  notas?: string;
  creadoEn: number;
  actualizadoEn: number;
};

// ───────────────────────────────────────────────────────────────
// Tests físicos
// ───────────────────────────────────────────────────────────────

export type TestFisico = {
  id: string;
  fecha: string;
  pesoCorporal?: number; // kg
  altura?: number; // cm
  t40m?: number; // segundos
  beepTest?: number; // nivel
  flexiones?: number;
  abdominales?: number;
  notas?: string;
  creadoEn: number;
  actualizadoEn: number;
};

// ───────────────────────────────────────────────────────────────
// Lesiones
// ───────────────────────────────────────────────────────────────

export type ZonaLesion =
  | 'Cabeza/cuello'
  | 'Hombro'
  | 'Brazo'
  | 'Mano/muñeca'
  | 'Pecho/espalda'
  | 'Cadera'
  | 'Muslo'
  | 'Rodilla'
  | 'Pierna'
  | 'Tobillo'
  | 'Pie';

export type LadoLesion = 'Izquierdo' | 'Derecho' | 'Ambos' | 'No aplica';
export type TipoLesion = 'Muscular' | 'Articular' | 'Golpe' | 'Esguince' | 'Fractura' | 'Otro';
export type Gravedad = 'Leve' | 'Moderada' | 'Grave';

export type Lesion = {
  id: string;
  fecha: string;
  zona: ZonaLesion;
  lado: LadoLesion;
  tipo: TipoLesion;
  gravedad: Gravedad;
  diasEstimados: number;
  fechaAlta?: string;
  tratamiento?: string;
  notas?: string;
  creadoEn: number;
  actualizadoEn: number;
};

// ───────────────────────────────────────────────────────────────
// Config (clave-valor)
// ───────────────────────────────────────────────────────────────

export type Config = {
  clave: string;
  valor: unknown;
  actualizadoEn: number;
};
