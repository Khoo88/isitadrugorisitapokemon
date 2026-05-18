import type { AnswerRecord, GameConfig, GameResults } from "@/lib/types";

export const SHARE_PLAY_URL = "isitadrugorisitapokemon.com.au";

/** Wordle-style emoji grid, 8 icons per line. */
export function formatShareEmojiGrid(answers: AnswerRecord[]): string {
  const icons = answers.map((a) => (a.correct ? "🟩" : "🟥"));
  const lines: string[] = [];
  for (let i = 0; i < icons.length; i += 8) {
    lines.push(icons.slice(i, i + 8).join(""));
  }
  return lines.join("\n");
}

function scoreLine(results: GameResults): string {
  const { config, answers, suddenDeathScore } = results;
  const correct = answers.filter((a) => a.correct).length;

  if (config.gameMode === "sudden-death" && suddenDeathScore !== undefined) {
    return `Sudden Death Score: ${suddenDeathScore}`;
  }

  const pct =
    answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0;
  return `${correct}/${answers.length} correct (${pct}%)`;
}

export function buildShareText(results: GameResults): string {
  const grid = formatShareEmojiGrid(results.answers);
  const score = scoreLine(results);

  return [
    "Drug or Pokémon? 💊/👾",
    score,
    grid,
    "",
    `play at ${SHARE_PLAY_URL}`,
  ].join("\n");
}

export function buildShareTextFromParts(
  config: GameConfig,
  answers: AnswerRecord[],
  suddenDeathScore?: number,
): string {
  return buildShareText({
    config,
    answers,
    suddenDeathScore,
    startedAt: 0,
    endedAt: 0,
  });
}
