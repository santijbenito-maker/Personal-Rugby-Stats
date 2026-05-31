import { db } from './schema';
import { EJERCICIOS_BASE } from '../lib/ejerciciosBase';
import { hoyISO, restarDias } from '../lib/fechas';
import type {
  GymEjercicio,
  GymSesion,
  Partido,
  Entrenamiento,
  TipoEntreno,
  TestFisico,
  Lesion,
} from '../types';

const now = () => Date.now();
const uuid = () => crypto.randomUUID();

/**
 * Primer arranque: si la tabla de ejercicios está vacía, cargar los de base.
 * Esto NO crea partidos/entrenamientos/gym — la app arranca limpia para Santi.
 * Los datos de ejemplo se cargan aparte con `cargarDatosDeEjemplo()`.
 */
export async function sembrarBibliotecaEjercicios() {
  const count = await db.gym_ejercicios.count();
  if (count > 0) return;

  const ejercicios: GymEjercicio[] = EJERCICIOS_BASE.map((e) => ({
    id: uuid(),
    nombre: e.nombre,
    grupoMuscular: e.grupoMuscular,
    esPersonalizado: false,
    frecuenciaDeUso: 0,
    creadoEn: now(),
    actualizadoEn: now(),
  }));

  await db.gym_ejercicios.bulkAdd(ejercicios);
}

/**
 * Carga un set completo de datos de ejemplo para previsualizar el Dashboard
 * y el resto de la app. Se activa con el botón "Cargar datos de ejemplo"
 * del empty state del Dashboard (y en Hito 8 también desde Perfil).
 *
 * Es idempotente: si ya hay datos, no hace nada.
 */
export async function cargarDatosDeEjemplo() {
  const partidosCount = await db.partidos.count();
  const gymCount = await db.gym_sesiones.count();
  const entrenosCount = await db.entrenamientos.count();
  const testsCount = await db.tests_fisicos.count();
  const lesionesCount = await db.lesiones.count();
  if (
    partidosCount + gymCount + entrenosCount + testsCount + lesionesCount >
    0
  )
    return;

  await sembrarBibliotecaEjercicios();
  const ejercicios = await db.gym_ejercicios.toArray();
  const ejId = (nombre: string) =>
    ejercicios.find((e) => e.nombre.toLowerCase() === nombre.toLowerCase())!.id;

  const partidos = construirPartidos();
  const entrenamientos = construirEntrenamientos();
  const gym = construirSesionesGym(ejId);
  const tests = construirTestsFisicos();
  const lesiones = construirLesiones();

  await db.transaction(
    'rw',
    [db.partidos, db.entrenamientos, db.gym_sesiones, db.tests_fisicos, db.lesiones],
    async () => {
      await db.partidos.bulkAdd(partidos);
      await db.entrenamientos.bulkAdd(entrenamientos);
      await db.gym_sesiones.bulkAdd(gym);
      await db.tests_fisicos.bulkAdd(tests);
      await db.lesiones.bulkAdd(lesiones);
    },
  );
}

// ───────────────────────────────────────────────────────────────
// Constructores de data de ejemplo
// ───────────────────────────────────────────────────────────────

function construirPartidos(): Partido[] {
  const t = now();
  return [
    {
      id: uuid(),
      fecha: restarDias(hoyISO(), 7),
      rival: 'Huirapuca',
      torneo: 'Oficial URT',
      condicion: 'Local',
      puntosPropios: 24,
      puntosRival: 17,
      clima: 'Soleado',
      estadoCampo: 'Seco',
      temperatura: 22,
      posiciones: ['10 - Apertura'],
      minutos: 60,
      comoEntre: 'Titular',
      capitan: false,
      tries: 1,
      asistencias: 2,
      quiebres: 2,
      offloads: 1,
      knockOns: 1,
      usoPie: 6,
      tacklesEfectivos: 5,
      tacklesIntentados: 6,
      turnoversGanados: 1,
      intercepciones: 0,
      recepcionKicks: 5,
      coberturas: 4,
      kicksPaloConvertidos: 3,
      kicksPaloIntentados: 4,
      kicksTouchEfectivos: 5,
      kicksTouchIntentados: 6,
      kicksDespeje: 4,
      drops: 0,
      velocidadRuck: 4,
      calidadPase: 4,
      lecturaJuego: 4,
      penalesCometidos: 1,
      amarillas: 0,
      rojas: 0,
      sensacionFisico: 4,
      sensacionTecnico: 4,
      rating: 8,
      notasBien: 'Buena lectura en el ataque, convertí bien a los palos.',
      notasMejorar: 'Apurar el pase en el lado ciego.',
      creadoEn: t,
      actualizadoEn: t,
    },
    {
      id: uuid(),
      fecha: restarDias(hoyISO(), 21),
      rival: 'Tucumán Rugby',
      torneo: 'Oficial URT',
      condicion: 'Visitante',
      puntosPropios: 12,
      puntosRival: 20,
      clima: 'Lluvia',
      estadoCampo: 'Embarrado',
      temperatura: 14,
      posiciones: ['9 - Medio scrum'],
      minutos: 70,
      comoEntre: 'Titular',
      capitan: false,
      tries: 0,
      asistencias: 1,
      quiebres: 1,
      offloads: 0,
      knockOns: 3,
      usoPie: 5,
      tacklesEfectivos: 8,
      tacklesIntentados: 10,
      turnoversGanados: 0,
      intercepciones: 0,
      recepcionKicks: 8,
      coberturas: 3,
      kicksPaloConvertidos: 1,
      kicksPaloIntentados: 2,
      kicksTouchEfectivos: 3,
      kicksTouchIntentados: 5,
      kicksDespeje: 6,
      drops: 0,
      velocidadRuck: 3,
      calidadPase: 3,
      lecturaJuego: 4,
      penalesCometidos: 2,
      amarillas: 0,
      rojas: 0,
      sensacionFisico: 3,
      sensacionTecnico: 3,
      rating: 6,
      notasBien: 'Defensa sólida a pesar del barro.',
      notasMejorar: 'Precisión del pase bajo presión.',
      creadoEn: t,
      actualizadoEn: t,
    },
    {
      id: uuid(),
      fecha: restarDias(hoyISO(), 35),
      rival: 'Cardenales',
      torneo: 'Oficial URT',
      condicion: 'Local',
      puntosPropios: 31,
      puntosRival: 14,
      clima: 'Nublado',
      estadoCampo: 'Seco',
      temperatura: 18,
      // En este partido jugó las dos posiciones — empezó de 10 y movió a 9
      // en el segundo tiempo cuando se lesionó el medio scrum
      posiciones: ['9 - Medio scrum', '10 - Apertura'],
      minutos: 80,
      comoEntre: 'Titular',
      capitan: true,
      tries: 2,
      asistencias: 3,
      quiebres: 3,
      offloads: 2,
      knockOns: 0,
      usoPie: 8,
      tacklesEfectivos: 6,
      tacklesIntentados: 6,
      turnoversGanados: 2,
      intercepciones: 1,
      recepcionKicks: 4,
      coberturas: 5,
      kicksPaloConvertidos: 4,
      kicksPaloIntentados: 5,
      kicksTouchEfectivos: 7,
      kicksTouchIntentados: 7,
      kicksDespeje: 3,
      drops: 1,
      velocidadRuck: 5,
      calidadPase: 5,
      lecturaJuego: 5,
      penalesCometidos: 0,
      amarillas: 0,
      rojas: 0,
      sensacionFisico: 5,
      sensacionTecnico: 5,
      rating: 9,
      notasBien: 'Partido redondo. Drop en el segundo tiempo y dos tries propios.',
      notasMejorar: 'Comunicación con el 12 en el ataque.',
      notasEntrenador: 'Muy bien el control del juego.',
      creadoEn: t,
      actualizadoEn: t,
    },
    {
      id: uuid(),
      fecha: restarDias(hoyISO(), 50),
      rival: 'Universitario',
      torneo: 'Amistoso',
      condicion: 'Local',
      puntosPropios: 14,
      puntosRival: 14,
      clima: 'Soleado',
      estadoCampo: 'Seco',
      temperatura: 20,
      posiciones: ['9 - Medio scrum'],
      minutos: 60,
      comoEntre: 'Titular',
      capitan: false,
      tries: 0,
      asistencias: 1,
      quiebres: 0,
      offloads: 1,
      knockOns: 1,
      usoPie: 4,
      tacklesEfectivos: 7,
      tacklesIntentados: 8,
      turnoversGanados: 1,
      intercepciones: 0,
      recepcionKicks: 6,
      coberturas: 4,
      kicksPaloConvertidos: 2,
      kicksPaloIntentados: 2,
      kicksTouchEfectivos: 0,
      kicksTouchIntentados: 0,
      kicksDespeje: 5,
      drops: 0,
      velocidadRuck: 4,
      calidadPase: 4,
      lecturaJuego: 4,
      penalesCometidos: 1,
      amarillas: 0,
      rojas: 0,
      sensacionFisico: 4,
      sensacionTecnico: 4,
      rating: 7,
      notasBien: 'Buen ritmo de distribución.',
      notasMejorar: 'Tackles en velocidad.',
      creadoEn: t,
      actualizadoEn: t,
    },
  ];
}

function construirEntrenamientos(): Entrenamiento[] {
  const t = now();
  // Cinco días consecutivos desde hoy hacia atrás (racha de 5)
  const tiposPorDia: TipoEntreno[][] = [
    ['Técnico'],
    ['Físico'],
    ['Táctico'],
    ['Técnico', 'Físico'],
    ['Físico'],
  ];
  const entrenos: Entrenamiento[] = [];
  for (let i = 0; i < 5; i++) {
    entrenos.push({
      id: uuid(),
      fecha: restarDias(hoyISO(), i),
      duracion: 90,
      tipos: tiposPorDia[i],
      clima: 'Soleado',
      temperatura: 21,
      asistencia: 'Presente',
      ejerciciosTrabajados: ['Pases', 'Rucks', 'Defensa'],
      rpe: 7,
      sensacionFisico: 8,
      sensacionTecnico: 8,
      notas: 'Buena sesión.',
      creadoEn: t,
      actualizadoEn: t,
    });
  }
  // Algunos más en la historia para que haya data del mes anterior
  entrenos.push({
    id: uuid(),
    fecha: restarDias(hoyISO(), 40),
    duracion: 90,
    tipos: ['Físico'],
    asistencia: 'Presente',
    ejerciciosTrabajados: ['Físico'],
    rpe: 8,
    sensacionFisico: 7,
    sensacionTecnico: 6,
    creadoEn: t,
    actualizadoEn: t,
  });
  return entrenos;
}

function construirSesionesGym(ejId: (nombre: string) => string): GymSesion[] {
  const t = now();
  const sentadilla = ejId('Sentadilla');
  const pressBanca = ejId('Press banca');
  const pesoMuerto = ejId('Peso muerto');
  const dominadas = ejId('Dominadas');
  const plancha = ejId('Plancha');

  // Progresión sentadilla: 40 → 42.5 → 45 → 47.5 → 50 (PR a 3 días)
  const pesosSentadilla = [40, 42.5, 45, 47.5, 50];
  const diasAtras = [56, 42, 28, 14, 3];

  const sesiones: GymSesion[] = [];

  for (let i = 0; i < pesosSentadilla.length; i++) {
    const esUltima = i === pesosSentadilla.length - 1;
    sesiones.push({
      id: uuid(),
      fecha: restarDias(hoyISO(), diasAtras[i]),
      duracion: 60,
      foco: 'Tren inferior',
      ejercicios: [
        {
          ejercicioId: sentadilla,
          series: [
            { peso: pesosSentadilla[i], reps: 5, rir: 2 },
            { peso: pesosSentadilla[i], reps: 5, rir: 1 },
            { peso: pesosSentadilla[i], reps: 5, rir: 1 },
          ],
          fueRecord: i > 0, // primero no cuenta (no hay anterior), después sí
        },
        {
          ejercicioId: pesoMuerto,
          series: [
            { peso: 55 + i * 5, reps: 5, rir: 2 },
            { peso: 55 + i * 5, reps: 5, rir: 2 },
          ],
          fueRecord: esUltima,
        },
      ],
      sensacion: 8,
      notas: esUltima ? 'Subí 2.5kg en sentadilla, salió limpio.' : undefined,
      creadoEn: t,
      actualizadoEn: t,
    });
  }

  // Sesiones de tren superior con progresión press banca
  const pesosBanca = [25, 27.5, 30, 32.5];
  const diasBanca = [48, 34, 20, 6];
  for (let i = 0; i < pesosBanca.length; i++) {
    sesiones.push({
      id: uuid(),
      fecha: restarDias(hoyISO(), diasBanca[i]),
      duracion: 50,
      foco: 'Tren superior',
      ejercicios: [
        {
          ejercicioId: pressBanca,
          series: [
            { peso: pesosBanca[i], reps: 6, rir: 2 },
            { peso: pesosBanca[i], reps: 6, rir: 1 },
            { peso: pesosBanca[i], reps: 5, rir: 1 },
          ],
          fueRecord: i > 0,
        },
        {
          ejercicioId: dominadas,
          series: [
            { peso: 0, reps: 6 },
            { peso: 0, reps: 5 },
          ],
        },
        {
          ejercicioId: plancha,
          series: [{ peso: 0, reps: 60 }],
        },
      ],
      sensacion: 7,
      creadoEn: t,
      actualizadoEn: t,
    });
  }

  return sesiones;
}

function construirTestsFisicos(): TestFisico[] {
  const t = now();
  // Set de tests de ejemplo cubriendo los 4 kinds, con progresión visible
  // para que la gráfica de evolución muestre algo interesante.
  return [
    // Sentadilla: 60 → 70 → 80 kg, siempre 3 reps (1RM Epley sube de 66 → 88)
    {
      id: uuid(),
      fecha: restarDias(hoyISO(), 90),
      kind: 'sentadilla',
      pesoKg: 60,
      reps: 3,
      sensacionFisico: 7,
      rpe: 8,
      creadoEn: t,
      actualizadoEn: t,
    },
    {
      id: uuid(),
      fecha: restarDias(hoyISO(), 45),
      kind: 'sentadilla',
      pesoKg: 70,
      reps: 3,
      sensacionFisico: 8,
      rpe: 8,
      notas: 'Salió limpio.',
      creadoEn: t,
      actualizadoEn: t,
    },
    {
      id: uuid(),
      fecha: restarDias(hoyISO(), 5),
      kind: 'sentadilla',
      pesoKg: 80,
      reps: 3,
      sensacionFisico: 8,
      rpe: 9,
      fueRecord: true,
      notas: 'PR. Subí 10 kg en 6 semanas.',
      creadoEn: t,
      actualizadoEn: t,
    },
    // Press banca: progresión similar
    {
      id: uuid(),
      fecha: restarDias(hoyISO(), 75),
      kind: 'press_banca',
      pesoKg: 40,
      reps: 5,
      sensacionFisico: 7,
      rpe: 7,
      creadoEn: t,
      actualizadoEn: t,
    },
    {
      id: uuid(),
      fecha: restarDias(hoyISO(), 10),
      kind: 'press_banca',
      pesoKg: 50,
      reps: 5,
      sensacionFisico: 8,
      rpe: 8,
      fueRecord: true,
      creadoEn: t,
      actualizadoEn: t,
    },
    // 40m: 6.1 → 5.7 (menor es mejor)
    {
      id: uuid(),
      fecha: restarDias(hoyISO(), 180),
      kind: '40m',
      segundos: 6.1,
      sensacionFisico: 7,
      rpe: 9,
      creadoEn: t,
      actualizadoEn: t,
    },
    {
      id: uuid(),
      fecha: restarDias(hoyISO(), 7),
      kind: '40m',
      segundos: 5.7,
      sensacionFisico: 9,
      rpe: 10,
      fueRecord: true,
      notas: 'Buena pisada, salí con muelle.',
      creadoEn: t,
      actualizadoEn: t,
    },
    // Bronco: 5:20 (320s) → 4:55 (295s)
    {
      id: uuid(),
      fecha: restarDias(hoyISO(), 120),
      kind: 'bronco',
      segundos: 320,
      sensacionFisico: 5,
      rpe: 10,
      notas: 'Cansadísimo en el último bloque.',
      creadoEn: t,
      actualizadoEn: t,
    },
    {
      id: uuid(),
      fecha: restarDias(hoyISO(), 21),
      kind: 'bronco',
      segundos: 295,
      sensacionFisico: 7,
      rpe: 10,
      fueRecord: true,
      creadoEn: t,
      actualizadoEn: t,
    },
  ];
}

function construirLesiones(): Lesion[] {
  const t = now();
  // Una sola lesión leve recuperada para mostrar el estado "Recuperado"
  // y que la métrica "Lesiones activas" arranque en 0 → "Todo sano".
  return [
    {
      id: uuid(),
      fecha: restarDias(hoyISO(), 60),
      zona: 'Muslo',
      lado: 'Derecho',
      tipo: 'Muscular',
      gravedad: 'Leve',
      diasEstimados: 7,
      fechaAlta: restarDias(hoyISO(), 52),
      tratamiento: 'Kinesiología + hielo + estiramientos leves.',
      notas: 'Contractura después de entrenamiento intenso.',
      creadoEn: t,
      actualizadoEn: t,
    },
  ];
}
