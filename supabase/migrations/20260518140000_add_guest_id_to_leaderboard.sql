-- Anonymous guest tracking for leaderboard submissions
-- Run in Supabase SQL Editor or via: supabase db push

create extension if not exists "uuid-ossp";

alter table leaderboard
  add column if not exists guest_id uuid default uuid_generate_v4();

comment on column leaderboard.guest_id is
  'Anonymous browser guest id from localStorage (game_guest_id).';

create index if not exists leaderboard_guest_id_idx
  on leaderboard (guest_id);

create index if not exists leaderboard_guest_mode_score_idx
  on leaderboard (guest_id, game_mode, score desc);

-- Existing RLS policies (Public insert leaderboard) remain unchanged.
