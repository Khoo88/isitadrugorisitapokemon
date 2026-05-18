-- Drug or Pokémon? — Supabase schema

-- Medications (150 rows)
create table if not exists medicine (
  id bigint generated always as identity primary key,
  name text not null unique,
  therapeutic_category text not null
);

-- Pokémon (150 rows)
create table if not exists pokemon (
  id bigint generated always as identity primary key,
  name text not null unique
);

-- Leaderboard
create extension if not exists "uuid-ossp";

create table if not exists leaderboard (
  id bigint generated always as identity primary key,
  player_name text not null,
  score integer not null check (score >= 0),
  accuracy_percentage numeric(5, 2) not null check (
    accuracy_percentage >= 0
    and accuracy_percentage <= 100
  ),
  game_mode text not null,
  guest_id uuid default uuid_generate_v4(),
  created_at timestamptz default now()
);

create index if not exists leaderboard_mode_score_idx
  on leaderboard (game_mode, score desc, accuracy_percentage desc);

create index if not exists leaderboard_guest_id_idx
  on leaderboard (guest_id);

create index if not exists leaderboard_guest_mode_score_idx
  on leaderboard (guest_id, game_mode, score desc);

alter table medicine enable row level security;
alter table pokemon enable row level security;
alter table leaderboard enable row level security;

create policy "Public read medicine"
  on medicine for select to anon, authenticated using (true);

create policy "Public read pokemon"
  on pokemon for select to anon, authenticated using (true);

create policy "Public insert medicine"
  on medicine for insert to anon, authenticated with check (true);

create policy "Public insert pokemon"
  on pokemon for insert to anon, authenticated with check (true);

create policy "Public read leaderboard"
  on leaderboard for select to anon, authenticated using (true);

create policy "Public insert leaderboard"
  on leaderboard for insert to anon, authenticated with check (true);
