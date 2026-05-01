/**
 * Helpers de fecha centrados en es-AR (América/Argentina/Buenos_Aires).
 * Todas las fechas se guardan en strings ISO "YYYY-MM-DD" (sin hora)
 * para evitar problemas de huso horario y para facilitar comparaciones.
 */

/** Devuelve la fecha de hoy como "YYYY-MM-DD" en hora local. */
export function hoyISO(): string {
  const d = new Date();
  return formatearISO(d);
}

/** Convierte un Date a "YYYY-MM-DD" tomando la hora local. */
export function formatearISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** "YYYY-MM-DD" → Date (a medianoche local). */
export function parsearISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Devuelve "YYYY-MM-DD" de la fecha indicada menos N días. */
export function restarDias(iso: string, dias: number): string {
  const d = parsearISO(iso);
  d.setDate(d.getDate() - dias);
  return formatearISO(d);
}

export function sumarDias(iso: string, dias: number): string {
  return restarDias(iso, -dias);
}

/** Diferencia en días entre dos fechas ISO (b - a). */
export function diferenciaDias(a: string, b: string): number {
  const msDia = 86_400_000;
  return Math.round((parsearISO(b).getTime() - parsearISO(a).getTime()) / msDia);
}

/** Texto "hace X días" / "hoy" / "ayer". */
export function hace(iso: string, desde: string = hoyISO()): string {
  const dias = diferenciaDias(iso, desde);
  if (dias === 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 7) return `hace ${dias} días`;
  if (dias < 30) return `hace ${Math.round(dias / 7)} sem`;
  if (dias < 365) return `hace ${Math.round(dias / 30)} meses`;
  return `hace ${Math.round(dias / 365)} años`;
}

/** Formato corto: "23 abr". */
export function formatoCorto(iso: string): string {
  const d = parsearISO(iso);
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }).replace('.', '');
}

/** Formato largo: "miércoles 23 de abril de 2026". */
export function formatoLargo(iso: string): string {
  const d = parsearISO(iso);
  return d.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Primer día del mes actual como ISO. */
export function inicioMes(iso: string = hoyISO()): string {
  const d = parsearISO(iso);
  return formatearISO(new Date(d.getFullYear(), d.getMonth(), 1));
}

/** Primer día del mes anterior como ISO. */
export function inicioMesAnterior(iso: string = hoyISO()): string {
  const d = parsearISO(iso);
  return formatearISO(new Date(d.getFullYear(), d.getMonth() - 1, 1));
}

/** Último día del mes anterior como ISO (día antes del inicio del actual). */
export function finMesAnterior(iso: string = hoyISO()): string {
  return restarDias(inicioMes(iso), 1);
}

/**
 * Lista los últimos N días como ISO (incluye hoy).
 * Orden: del más viejo al más nuevo.
 */
export function ultimosDias(n: number): string[] {
  const hoy = hoyISO();
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(restarDias(hoy, i));
  return out;
}
