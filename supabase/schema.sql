-- ============================================================
-- English Learning App — Skema Database Supabase (PostgreSQL)
-- Cara pakai: Supabase Dashboard > SQL Editor > paste > Run
-- ============================================================

create extension if not exists "pgcrypto";

-- Profil pengguna (1 baris per akun, terhubung ke auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  total_xp integer not null default 0,
  streak_days integer not null default 0,
  last_study_date date,
  created_at timestamptz not null default now()
);

-- Progres per bahasa (siap multi-bahasa: en, ko, ja, ...)
create table if not exists public.user_language_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  language_code text not null default 'en',
  current_level text not null default 'A0',
  total_xp integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, language_code)
);

-- Hasil per pelajaran
create table if not exists public.lesson_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  language_code text not null default 'en',
  lesson_id text not null,
  level_code text not null,
  score integer not null default 0,
  xp_earned integer not null default 0,
  completed boolean not null default false,
  completed_at timestamptz not null default now(),
  unique (user_id, language_code, lesson_id)
);

-- Log XP (riwayat, untuk grafik & audit)
create table if not exists public.xp_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  language_code text not null default 'en',
  source text not null,
  xp integer not null,
  created_at timestamptz not null default now()
);

-- Konten (opsional: pindahkan data.js ke database bila ingin edit tanpa deploy ulang)
create table if not exists public.lessons (
  id text primary key,
  language_code text not null default 'en',
  level_code text not null,
  title text not null,
  description_id text,
  xp integer not null default 20,
  sort_order integer not null default 0
);
create table if not exists public.vocabulary (
  id uuid primary key default gen_random_uuid(),
  lesson_id text references public.lessons(id) on delete cascade,
  language_code text not null default 'en',
  word text not null,
  meaning_id text not null,
  example_en text,
  example_id text
);

-- Row Level Security: pengguna hanya bisa mengakses datanya sendiri
alter table public.profiles enable row level security;
alter table public.user_language_progress enable row level security;
alter table public.lesson_results enable row level security;
alter table public.xp_log enable row level security;
alter table public.lessons enable row level security;
alter table public.vocabulary enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own language progress" on public.user_language_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own lesson results" on public.lesson_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own xp log" on public.xp_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lessons readable" on public.lessons for select using (true);
create policy "vocabulary readable" on public.vocabulary for select using (true);

-- Buat profil otomatis saat pengguna mendaftar
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email));
  insert into public.user_language_progress (user_id, language_code)
  values (new.id, 'en');
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
