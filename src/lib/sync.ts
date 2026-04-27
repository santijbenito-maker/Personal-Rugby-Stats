import { supabase } from './supabase';
import { exportarTodo, importarBackup, validarBackup } from './export';
import type { Backup } from './export';

/**
 * Sincronización entre dispositivos vía Supabase.
 *
 * Reusa el formato Backup ya existente (lib/export.ts): subimos un blob JSON
 * con todo el estado al servidor (tabla app_state), y al bajar lo importamos
 * con modo "reemplazar". Los videos NO se sincronizan (igual que en el backup
 * a archivo) porque son grandes y locales al dispositivo.
 *
 * Conflicto: la última escritura gana. Como Santi es el único usuario y rara
 * vez edita en dos lados al mismo tiempo, esto alcanza. Si quisiéramos conflict
 * resolution más fino habría que sincronizar tabla por tabla.
 */

const TABLA = 'app_state';

export type EstadoServidor = {
  data: Backup;
  actualizadoEn: string; // ISO datetime del server
};

/** Devuelve el usuario logueado o null. */
export async function getUsuario() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Iniciar sesión por mail. Manda un "magic link" al correo: tocás el link y
 * quedás logueado en ese dispositivo.
 *
 * `redirectTo` permite volver a la app después del click (necesario porque
 * la app vive en /Personal-Rugby-Stats/ en GitHub Pages, no en el root).
 */
export async function loginConEmail(email: string, redirectTo: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw error;
}

export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Sube todo el estado local al servidor. Reemplaza la fila del usuario con
 * lo que está en IndexedDB ahora.
 */
export async function subirAlServidor(): Promise<{ actualizadoEn: string }> {
  const usuario = await getUsuario();
  if (!usuario) throw new Error('No estás logueado.');

  const backup = await exportarTodo();
  const ahora = new Date().toISOString();
  const fila = {
    user_id: usuario.id,
    data: backup,
    updated_at: ahora,
  };

  const { error } = await supabase.from(TABLA).upsert(fila, { onConflict: 'user_id' });
  if (error) throw error;
  return { actualizadoEn: ahora };
}

/**
 * Baja el estado del servidor.
 * Devuelve null si nunca hubo nada subido.
 */
export async function leerDelServidor(): Promise<EstadoServidor | null> {
  const usuario = await getUsuario();
  if (!usuario) throw new Error('No estás logueado.');

  const { data, error } = await supabase
    .from(TABLA)
    .select('data, updated_at')
    .eq('user_id', usuario.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  validarBackup(data.data);
  return { data: data.data, actualizadoEn: data.updated_at };
}

/**
 * Reemplaza el estado local con el del servidor.
 * Tira error si el servidor está vacío.
 */
export async function bajarYReemplazar(): Promise<{ actualizadoEn: string }> {
  const remoto = await leerDelServidor();
  if (!remoto) throw new Error('Todavía no subiste datos al servidor desde ningún dispositivo.');
  await importarBackup(remoto.data, 'reemplazar');
  return { actualizadoEn: remoto.actualizadoEn };
}
