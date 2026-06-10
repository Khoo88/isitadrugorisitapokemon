-- Track which play style was used for each leaderboard score
alter table leaderboard
  add column if not exists play_style text;

comment on column leaderboard.play_style is
  'Play style slug: classic, swipe, drag-drop, multiple-choice';
