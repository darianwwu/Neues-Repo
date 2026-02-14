-- Outfit Oracle – Supabase Schema
-- Run in Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- 1) clothing_items
create table if not exists public.clothing_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  type text not null,
  category text not null,
  image_url text,
  warmth int not null default 2 check (warmth between 0 and 5),
  waterproof boolean not null default false,
  color text,
  tags text[] not null default '{}'::text[],
  rating int check (rating between 1 and 5),
  last_worn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clothing_items_user_id_idx on public.clothing_items(user_id);

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'clothing_items_set_updated_at'
  ) then
    create trigger clothing_items_set_updated_at
    before update on public.clothing_items
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- 2) wear_history
create table if not exists public.wear_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  worn_on date not null,
  outfit_json jsonb not null,
  rating int check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique(user_id, worn_on)
);

create index if not exists wear_history_user_id_worn_on_idx on public.wear_history(user_id, worn_on desc);

-- 3) Row Level Security
alter table public.clothing_items enable row level security;
alter table public.wear_history enable row level security;

-- clothing_items policies
create policy "clothing_items_select_own" on public.clothing_items
  for select using (auth.uid() = user_id);

create policy "clothing_items_insert_own" on public.clothing_items
  for insert with check (auth.uid() = user_id);

create policy "clothing_items_update_own" on public.clothing_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "clothing_items_delete_own" on public.clothing_items
  for delete using (auth.uid() = user_id);

-- wear_history policies
create policy "wear_history_select_own" on public.wear_history
  for select using (auth.uid() = user_id);

create policy "wear_history_insert_own" on public.wear_history
  for insert with check (auth.uid() = user_id);

create policy "wear_history_update_own" on public.wear_history
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "wear_history_delete_own" on public.wear_history
  for delete using (auth.uid() = user_id);

-- NOTE: Storage bucket + policies are easier via Dashboard.
-- Bucket name: clothes
-- Public: On (simplest) OR use signed URLs + private bucket.
