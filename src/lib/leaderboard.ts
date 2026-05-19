/** DB value for Sudden Death leaderboard rows (snake_case). */
export const SUDDEN_DEATH_LEADERBOARD_MODE = "sudden_death";

/** Legacy / mistyped mode strings still read when listing scores. */
export const SUDDEN_DEATH_LEADERBOARD_MODE_ALIASES = [
  SUDDEN_DEATH_LEADERBOARD_MODE,
  "sudden-death",
] as const;

/** App config uses kebab-case; DB uses snake_case. */
export function isSuddenDeathGameMode(mode: string): boolean {
  return (SUDDEN_DEATH_LEADERBOARD_MODE_ALIASES as readonly string[]).includes(
    mode,
  );
}

/** Normalize any Sudden Death variant to the canonical DB `game_mode`. */
export function normalizeLeaderboardGameMode(gameMode: string): string {
  return isSuddenDeathGameMode(gameMode)
    ? SUDDEN_DEATH_LEADERBOARD_MODE
    : gameMode;
}
