-- Allow clients to update their own leaderboard row when beating a personal best.
-- guest_id stores the persistent browser device id (isit_device_id).

create policy "Public update leaderboard"
  on leaderboard for update
  to anon, authenticated
  using (true)
  with check (true);
