import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Hook que devuelve el usuario logueado actual y se actualiza solo cuando
 * cambia (login / logout / link mágico aceptado / token refrescado).
 *
 * `cargando` es true mientras Supabase resuelve la sesión inicial al abrir
 * la app — para que la UI no parpadee del estado "no logueado" al "logueado".
 */
export function useSesion() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    // Sesión inicial al montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!activo) return;
      setUsuario(session?.user ?? null);
      setCargando(false);
    });

    // Suscribirse a cambios futuros
    const { data: subscription } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (!activo) return;
      setUsuario(session?.user ?? null);
    });

    return () => {
      activo = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { usuario, cargando };
}
