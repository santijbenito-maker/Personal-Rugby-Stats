import { createClient } from '@supabase/supabase-js';

/**
 * Cliente único de Supabase para toda la app.
 *
 * IMPORTANTE: la "publishable" key es segura para vivir en código de cliente
 * (igual que la antigua "anon" key) — está pensada para eso. Lo que protege
 * los datos es la Row Level Security (RLS) configurada en Supabase: sin
 * loguearse no se puede leer ni escribir nada, y logueado solo se ve la fila
 * propia.
 *
 * Si Santi resetea el proyecto de Supabase y crea uno nuevo, hay que
 * actualizar estas dos constantes.
 */
const SUPABASE_URL = 'https://ednnowkktdoxpgkvpsmx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YX94nh7PaL6-Bt5fGyx7bg_uIh8TvLz';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
