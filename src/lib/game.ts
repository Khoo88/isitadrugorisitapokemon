import type { Category, GameItem, QuestionCount } from "./types";
import { computeClampedDrugCount } from "./deck-split";

/** Min/max drug count for N questions (30%–70% of each category). */
export function getSplitBounds(count: number) {
  const minDrugs = Math.ceil(count * 0.3);
  const maxDrugs = Math.floor(count * 0.7);
  return { minDrugs, maxDrugs };
}

/** @deprecated Use computeClampedDrugCount from deck-split for DB-aware games. */
export function pickDrugCount(count: number): number {
  return computeClampedDrugCount(count);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sampleItems(
  pool: GameItem[],
  count: QuestionCount,
): GameItem[] {
  const drugs = pool.filter((i) => i.category === "drug");
  const pokemon = pool.filter((i) => i.category === "pokemon");

  const drugCount = pickDrugCount(count);
  const pokemonCount = count - drugCount;

  if (drugs.length < drugCount || pokemon.length < pokemonCount) {
    throw new Error("Not enough items in pool for requested split");
  }

  const selected = [
    ...shuffle(drugs).slice(0, drugCount),
    ...shuffle(pokemon).slice(0, pokemonCount),
  ];

  return shuffle(selected);
}

export function buildMultipleChoice(
  item: GameItem,
  pool: GameItem[],
): { options: { text: string; correct: boolean }[]; correctIndex: number } {
  const decoys = shuffle(
    pool.filter((p) => p.id !== item.id && p.category === item.category),
  ).slice(0, 3);

  while (decoys.length < 3) {
    const extra = pool.find(
      (p) =>
        p.id !== item.id &&
        !decoys.some((d) => d.id === p.id) &&
        p.category !== item.category,
    );
    if (!extra) break;
    decoys.push(extra);
  }

  const options = shuffle([
    { text: item.description, correct: true },
    ...decoys.map((d) => ({ text: d.description, correct: false })),
  ]);

  const correctIndex = options.findIndex((o) => o.correct);
  return { options, correctIndex };
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function timerSeconds(timer: import("./types").TimerOption): number | null {
  if (timer === "zen") return null;
  return timer * 60;
}

export const STORAGE_KEYS = {
  config: "dop-game-config",
  session: "dop-game-session",
  results: "dop-game-results",
  highScore: "dop-sudden-death-high",
} as const;

export function categoryLabel(c: Category): string {
  return c === "drug" ? "Drug" : "Pokémon";
}
