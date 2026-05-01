import { supabase } from './supabase';
import { syncCompleto, resetearCursores } from './syncEngine';

/**
 * Helpers de autenticación. La sincronización de datos en sí vive en
 * lib/syncEngine.ts (motor per-record con merge inteligente). Este módulo
 * sólo se encarga del login/logout y de exponer wrappers manuales para el
 * "modo avanzado" de la UI.
 */

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
 * Fuerza un ciclo de sincronización ahora mismo, en vez de esperar al
 * debounce/intervalo del auto-sync. Útil si el usuario quiere ver al toque
 * los cambios de otro dispositivo.
 */
export async function forzarSync() {
  await syncCompleto();
}

/**
 * Botón rojo: reinicia los cursores de pull/push y vuelve a sincronizar
 * todo desde cero. Se usa si el usuario sospecha que algo quedó desincronizado
 * o después de importar un backup local que no se reflejó.
 *
 * No es destructivo (no borra datos): simplemente fuerza al motor a comparar
 * tabla por tabla con el servidor y subir/bajar lo que corresponda.
 */
export async function resyncCompletoDesdeCero() {
  resetearCursores();
  await syncCompleto();
}
