-- Schema de Supabase para sincronización per-record con merge inteligente.
--
-- Pegar todo este archivo en el SQL Editor de Supabase y ejecutarlo una vez.
-- Es idempotente: se puede correr varias veces sin romper nada.
--
-- Cambio respecto al diseño anterior (tabla "app_state" con el backup completo):
-- ahora cada partido / entreno / etc. es una fila propia. Eso permite que dos
-- dispositivos editen cosas distintas sin pisarse — el merge es por registro,
-- usando el timestamp updated_at_ms para resolver conflictos (gana el más nuevo).
--
-- updated_at_ms es bigint (milisegundos desde epoch) en vez de timestamptz,
-- para que matchee exacto el formato local de Dexie ("actualizadoEn: number").

-- ───────────────────────────────────────────────────────────────
-- Tabla principal
-- ───────────────────────────────────────────────────────────────

create table if not exists public.app_records (
  user_id uuid references auth.users(id) on delete cascade not null,
  -- Tipo de entidad: 'partido', 'entrenamiento', 'gym_sesion',
  -- 'gym_ejercicio', 'test_fisico', 'lesion', 'config'.
  kind text not null,
  -- Id local (uuid v4 para casi todo, "clave" para config).
  id text not null,
  -- El JSON del registro local. NULL si está borrado (tombstone).
  data jsonb,
  -- Timestamp del último cambio (ms desde epoch, mismo formato que actualizadoEn).
  updated_at_ms bigint not null,
  -- true = tombstone (borrado). data debería ser null en ese caso.
  deleted boolean not null default false,
  primary key (user_id, kind, id)
);

-- Index para que "traeme todo lo que cambió desde X" sea rápido.
create index if not exists app_records_user_updated_idx
  on public.app_records (user_id, updated_at_ms);

-- ───────────────────────────────────────────────────────────────
-- Row Level Security: cada usuario ve solo lo suyo
-- ───────────────────────────────────────────────────────────────

alter table public.app_records enable row level security;

drop policy if exists "select_own" on public.app_records;
create policy "select_own" on public.app_records
  for select using (auth.uid() = user_id);

drop policy if exists "insert_own" on public.app_records;
create policy "insert_own" on public.app_records
  for insert with check (auth.uid() = user_id);

drop policy if exists "update_own" on public.app_records;
create policy "update_own" on public.app_records
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "delete_own" on public.app_records;
create policy "delete_own" on public.app_records
  for delete using (auth.uid() = user_id);

-- ───────────────────────────────────────────────────────────────
-- Realtime: que la app reciba pushes en vivo cuando otro dispositivo escribe
-- ───────────────────────────────────────────────────────────────

-- Si la tabla ya está en la publicación, este alter falla; lo envolvemos
-- en un do-block tolerante.
do $$
begin
  alter publication supabase_realtime add table public.app_records;
exception
  when duplicate_object then null;
  when undefined_object then null;  -- si la publicación no existe (project sin realtime)
end $$;

-- ───────────────────────────────────────────────────────────────
-- (Opcional) tabla legacy app_state — la dejamos por compatibilidad,
-- pero ya no la usa la app. Se puede borrar a mano si querés.
-- ───────────────────────────────────────────────────────────────
