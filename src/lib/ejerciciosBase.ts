import type { GrupoMuscular } from '../types';

/**
 * Biblioteca de ejercicios precargada (se vuelca en la tabla gym_ejercicios
 * la primera vez que se abre la app). Los ejercicios personalizados se suman
 * en caliente desde el formulario de gym.
 */
export type EjercicioBase = {
  nombre: string;
  grupoMuscular: GrupoMuscular;
};

export const EJERCICIOS_BASE: EjercicioBase[] = [
  // Tren inferior
  { nombre: 'Sentadilla', grupoMuscular: 'Tren inferior' },
  { nombre: 'Peso muerto', grupoMuscular: 'Tren inferior' },
  { nombre: 'Hip thrust', grupoMuscular: 'Tren inferior' },
  { nombre: 'Zancadas', grupoMuscular: 'Tren inferior' },
  { nombre: 'Prensa', grupoMuscular: 'Tren inferior' },
  { nombre: 'Elevación de gemelos', grupoMuscular: 'Tren inferior' },

  // Tren superior
  { nombre: 'Press banca', grupoMuscular: 'Tren superior' },
  { nombre: 'Press militar', grupoMuscular: 'Tren superior' },
  { nombre: 'Dominadas', grupoMuscular: 'Tren superior' },
  { nombre: 'Remo con barra', grupoMuscular: 'Tren superior' },
  { nombre: 'Remo con mancuerna', grupoMuscular: 'Tren superior' },
  { nombre: 'Press mancuernas', grupoMuscular: 'Tren superior' },
  { nombre: 'Curl bíceps', grupoMuscular: 'Tren superior' },
  { nombre: 'Extensión tríceps', grupoMuscular: 'Tren superior' },
  { nombre: 'Face pull', grupoMuscular: 'Tren superior' },

  // Core
  { nombre: 'Plancha', grupoMuscular: 'Core' },
  { nombre: 'Abdominales', grupoMuscular: 'Core' },
  { nombre: 'Pallof press', grupoMuscular: 'Core' },
  { nombre: 'Russian twists', grupoMuscular: 'Core' },

  // Rugby específico
  { nombre: 'Sprint 20m', grupoMuscular: 'Rugby específico' },
  { nombre: 'Cambios de dirección', grupoMuscular: 'Rugby específico' },
  { nombre: 'Cuello isométrico', grupoMuscular: 'Rugby específico' },
];
