import type { Category, GameItem } from "./types";

export const MISSING_QUIZ_TRAIT = "MISSING DATA";

const PLACEHOLDER_DRUG_RE = /^Medication:\s*/i;
const PLACEHOLDER_POKEMON_RE = /^Pokémon species:\s*/i;

function isValidDrugTrait(trait: string, itemName: string): boolean {
  const t = trait.trim();
  if (!t || t === MISSING_QUIZ_TRAIT || PLACEHOLDER_DRUG_RE.test(t)) return false;
  if (t.toLowerCase() === itemName.toLowerCase()) return false;
  return true;
}

function isValidPokemonTrait(trait: string, itemName: string): boolean {
  const t = trait.trim();
  if (!t || t === MISSING_QUIZ_TRAIT || PLACEHOLDER_POKEMON_RE.test(t)) return false;
  if (t.toLowerCase() === itemName.toLowerCase()) return false;
  return true;
}

/** Strict: only `item.quizTrait` from seed JSON or deck API. */
export function getDrugQuizTrait(item: GameItem): string {
  const trait = item.quizTrait?.trim();
  if (trait && isValidDrugTrait(trait, item.name)) {
    return trait;
  }
  return MISSING_QUIZ_TRAIT;
}

/** Strict: only `item.quizTrait` from seed JSON or deck API. */
export function getPokemonQuizTrait(item: GameItem): string {
  const trait = item.quizTrait?.trim();
  if (trait && isValidPokemonTrait(trait, item.name)) {
    return trait;
  }
  return MISSING_QUIZ_TRAIT;
}

export function buildDrugQuizPrompt(name: string): string {
  return `What is ${name}'s primary indication or therapeutic class?`;
}

export function buildPokemonQuizPrompt(name: string): string {
  return `What is ${name}'s primary elemental type?`;
}

export interface ContextualQuizQuestion {
  prompt: string;
  entityName: string;
  options: { text: string; correct: boolean }[];
  correctIndex: number;
}

function sameAnswer(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** All unique quiz traits in the active deck for one category. */
function deckTraitPool(
  pool: GameItem[],
  category: Category,
  excludeItemId: string,
): string[] {
  const traits = new Set<string>();
  for (const entry of pool) {
    if (entry.id === excludeItemId || entry.category !== category) continue;
    const trait =
      category === "drug"
        ? getDrugQuizTrait(entry)
        : getPokemonQuizTrait(entry);
    if (trait !== MISSING_QUIZ_TRAIT) {
      traits.add(trait);
    }
  }
  return [...traits];
}

export function buildContextualMultipleChoice(
  item: GameItem,
  pool: GameItem[],
): ContextualQuizQuestion {
  const isDrug = item.category === "drug";
  const prompt = isDrug
    ? buildDrugQuizPrompt(item.name)
    : buildPokemonQuizPrompt(item.name);

  const correctText = (
    isDrug ? getDrugQuizTrait(item) : getPokemonQuizTrait(item)
  ).trim();

  const allTraits = deckTraitPool(pool, item.category, item.id);
  const shuffledDecoys = shuffle(
    allTraits.filter((trait) => !sameAnswer(trait, correctText)),
  );
  const decoys = shuffledDecoys.slice(0, 3);

  const finalOptions = shuffle([
    { text: correctText, correct: true },
    ...decoys.map((text) => ({ text, correct: false })),
  ]);

  const correctIndex = finalOptions.findIndex((o) => o.correct);

  return {
    prompt,
    entityName: item.name,
    options: finalOptions,
    correctIndex,
  };
}
