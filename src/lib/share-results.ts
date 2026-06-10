import type { AnswerRecord, GameConfig, GameResults } from "@/lib/types";
import { formatTime } from "@/lib/game";
import { isSuddenDeathGameMode } from "@/lib/leaderboard";
import { formatPlayStyleLabel } from "@/lib/play-style";

export const SHARE_SITE_URL = "https://isitadrugorisitapokemon.com.au";

/** Wordle-style emoji grid, 8 icons per line. */
export function formatShareEmojiGrid(answers: AnswerRecord[]): string {
  const icons = answers.map((a) => (a.correct ? "🟩" : "🟥"));
  const lines: string[] = [];
  for (let i = 0; i < icons.length; i += 8) {
    lines.push(icons.slice(i, i + 8).join(""));
  }
  return lines.join("\n");
}

function formatGameModeLabel(mode: string): string {
  return isSuddenDeathGameMode(mode) ? "Sudden Death" : "Standard";
}

function buildScoreLine(results: GameResults): string {
  const { config, answers, startedAt, endedAt, suddenDeathScore } = results;
  const correct = answers.filter((a) => a.correct).length;
  const total = answers.length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const totalSec = Math.max(0, Math.floor((endedAt - startedAt) / 1000));
  const timePart = `Time: ${formatTime(totalSec)}`;

  if (config.gameMode === "sudden-death" && suddenDeathScore !== undefined) {
    return `${correct}/${total} correct (${pct}%) • Sudden Death: ${suddenDeathScore} • ${timePart}`;
  }

  return `${correct}/${total} correct (${pct}%) • ${timePart}`;
}

export function buildShareText(results: GameResults): string {
  const { config, answers } = results;
  const playStyle = formatPlayStyleLabel(config.playStyle);
  const gameMode = formatGameModeLabel(config.gameMode);
  const grid = formatShareEmojiGrid(answers);
  const scoreLine = buildScoreLine(results);

  return [
    "Drug or Pokémon? 💊/👾",
    `${playStyle} • ${gameMode}`,
    scoreLine,
    grid,
    "",
    `Play at ${SHARE_SITE_URL}`,
  ].join("\n");
}

export function buildShareTextFromParts(
  config: GameConfig,
  answers: AnswerRecord[],
  suddenDeathScore?: number,
  startedAt = 0,
  endedAt = 0,
): string {
  return buildShareText({
    config,
    answers,
    suddenDeathScore,
    startedAt,
    endedAt,
  });
}
