-- Ejecutar en Supabase > SQL Editor

create table if not exists public.partidas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  fecha timestamptz not null default now(),
  resultado text not null check (resultado in ('victoria', 'derrota')),
  puntuacion integer not null check (puntuacion >= 0),
  duracion integer not null check (duracion >= 0),
  movimientos integer not null default 0
);

create index if not exists partidas_user_fecha_idx on public.partidas (user_id, fecha desc);

alter table public.partidas enable row level security;

drop policy if exists "Ver mis partidas" on public.partidas;
create policy "Ver mis partidas" on public.partidas
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Insertar mis partidas" on public.partidas;
create policy "Insertar mis partidas" on public.partidas
  for insert to authenticated
  with check (auth.uid() = user_id);

-- Sin políticas de update/delete: nadie puede modificar ni borrar partidas.
