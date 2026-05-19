import type { GameItem } from "./types";

/** Therapeutic classes / indications for drug multiple-choice decoys */
export const DRUG_CLASS_POOL: readonly string[] = [
  "Antibiotic — bacterial infections",
  "ACE inhibitor — hypertension",
  "Beta-blocker — heart rate and blood pressure",
  "Proton pump inhibitor — acid reflux",
  "SSRI antidepressant — depression and anxiety",
  "Statin — cholesterol lowering",
  "NSAID — pain and inflammation",
  "Opioid analgesic — moderate to severe pain",
  "Anticoagulant — blood clot prevention",
  "Insulin / antidiabetic — glucose control",
  "Bronchodilator — asthma and COPD",
  "Diuretic — fluid overload and hypertension",
  "Antiviral — viral infections",
  "Benzodiazepine — anxiety and sedation",
  "Antihistamine — allergies",
  "Immunosuppressant / biologic — autoimmune disease",
  "Anticonvulsant — seizure disorders",
  "Thyroid hormone replacement",
  "PDE5 inhibitor — erectile dysfunction",
  "GLP-1 agonist — diabetes and weight management",
  "Antipsychotic — schizophrenia and bipolar disorder",
  "H2 blocker — gastric acid reduction",
  "Calcium channel blocker — hypertension and angina",
  "Muscle relaxant — acute musculoskeletal spasm",
  "Antifungal — fungal infections",
  "Antimalarial / immunomodulator",
  "Laxative / bowel regimen",
  "Inhaled corticosteroid — asthma maintenance",
  "SNRI — depression and neuropathic pain",
  "Alpha-blocker — benign prostatic hyperplasia",
] as const;

/** Pokémon elemental types for multiple-choice options */
export const POKEMON_TYPE_POOL: readonly string[] = [
  "Normal",
  "Fire",
  "Water",
  "Grass",
  "Electric",
  "Ice",
  "Fighting",
  "Poison",
  "Ground",
  "Flying",
  "Psychic",
  "Bug",
  "Rock",
  "Ghost",
  "Dragon",
  "Dark",
  "Steel",
  "Fairy",
  "Fire / Flying",
  "Water / Ground",
  "Grass / Poison",
  "Electric / Steel",
  "Dragon / Flying",
  "Ghost / Poison",
  "Psychic / Fairy",
  "Fighting / Steel",
  "Rock / Ground",
  "Bug / Steel",
  "Ice / Psychic",
  "Dark / Dragon",
] as const;

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickFromPool<T>(slug: string, pool: readonly T[], salt = 0): T {
  return pool[(hashSlug(slug) + salt) % pool.length];
}

export const MISSING_QUIZ_TRAIT = "MISSING DATA";

const PLACEHOLDER_DRUG_RE = /^Medication:\s*/i;
const PLACEHOLDER_POKEMON_RE = /^Pokémon species:\s*/i;

/** Deck cards from the API may include `therapeutic_category` (not on base GameItem). */
type GameItemWithDrugMeta = GameItem & { therapeutic_category?: string };

function isValidDrugTrait(trait: string, itemName: string): boolean {
  const t = trait.trim();
  if (!t || PLACEHOLDER_DRUG_RE.test(t)) return false;
  if (t.toLowerCase() === itemName.toLowerCase()) return false;
  return true;
}

function isValidPokemonTrait(trait: string, itemName: string): boolean {
  const t = trait.trim();
  if (!t || PLACEHOLDER_POKEMON_RE.test(t)) return false;
  if (t.toLowerCase() === itemName.toLowerCase()) return false;
  return true;
}

/** Parse primary type from learn-more intro when present in items */
function parseTypeFromDescription(description: string): string | null {
  const match = description.match(
    /is an? ([A-Za-z]+(?:\/[A-Za-z]+)?)(?:-type)?\s+Pok[eé]mon/i,
  );
  if (!match) return null;
  let raw = match[1].trim();
  raw = raw.replace(/\s+and\s+/gi, " / ");
  if (POKEMON_TYPE_POOL.includes(raw as (typeof POKEMON_TYPE_POOL)[number])) {
    return raw;
  }
  const single = raw.split(/\s+/)[0];
  if (POKEMON_TYPE_POOL.includes(single as (typeof POKEMON_TYPE_POOL)[number])) {
    return single;
  }
  return raw;
}

export function getDrugQuizTrait(item: GameItem): string {
  const extended = item as GameItemWithDrugMeta;
  const candidates = [
    item.quizTrait,
    extended.therapeutic_category,
    item.description,
  ];

  for (const raw of candidates) {
    const trait = raw?.trim();
    if (trait && isValidDrugTrait(trait, item.name)) {
      return trait;
    }
  }

  return MISSING_QUIZ_TRAIT;
}

export function getPokemonQuizTrait(item: GameItem): string {
  if (item.quizTrait?.trim() && isValidPokemonTrait(item.quizTrait, item.name)) {
    return item.quizTrait.trim();
  }

  const fromDesc = parseTypeFromDescription(item.description ?? "");
  if (fromDesc && isValidPokemonTrait(fromDesc, item.name)) {
    return fromDesc;
  }

  if (
    item.description?.trim() &&
    isValidPokemonTrait(item.description, item.name)
  ) {
    return item.description.trim();
  }

  return MISSING_QUIZ_TRAIT;
}

/**
 * Deck assembly only (server/seed): assigns a stable class when JSON/DB has no trait.
 * Stored on `item.quizTrait` so `getDrugQuizTrait` resolves the same value in-game.
 */
export function drugTraitForDeckAssembly(item: GameItem): string {
  const resolved = getDrugQuizTrait(item);
  if (resolved !== MISSING_QUIZ_TRAIT) return resolved;
  return pickFromPool(item.slug, DRUG_CLASS_POOL);
}

export function pokemonTraitForDeckAssembly(item: GameItem): string {
  const resolved = getPokemonQuizTrait(item);
  if (resolved !== MISSING_QUIZ_TRAIT) return resolved;
  return pickFromPool(item.slug, POKEMON_TYPE_POOL);
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

function pickRandomPoolDecoys(
  correctText: string,
  optionPool: readonly string[],
  existing: string[],
  count: number,
): string[] {
  const picked: string[] = [];
  for (const candidate of shuffle([...optionPool])) {
    if (picked.length >= count) break;
    if (
      sameAnswer(candidate, correctText) ||
      existing.some((d) => sameAnswer(d, candidate)) ||
      picked.some((d) => sameAnswer(d, candidate))
    ) {
      continue;
    }
    picked.push(candidate);
  }
  return picked;
}

export function buildContextualMultipleChoice(
  item: GameItem,
  pool: GameItem[],
): ContextualQuizQuestion {
  const isDrug = item.category === "drug";
  const optionPool = isDrug ? DRUG_CLASS_POOL : POKEMON_TYPE_POOL;
  const prompt = isDrug
    ? buildDrugQuizPrompt(item.name)
    : buildPokemonQuizPrompt(item.name);

  const correctText = (
    isDrug ? getDrugQuizTrait(item) : getPokemonQuizTrait(item)
  ).trim();

  // Shuffle deck pool before scanning so decoys vary every question.
  const shuffledPool = shuffle([...pool]);
  const decoyTraits: string[] = [];

  for (const other of shuffledPool) {
    if (decoyTraits.length >= 3) break;
    if (other.id === item.id || other.category !== item.category) continue;

    const trait = (
      isDrug ? getDrugQuizTrait(other) : getPokemonQuizTrait(other)
    ).trim();
    if (
      trait === MISSING_QUIZ_TRAIT ||
      sameAnswer(trait, correctText) ||
      decoyTraits.some((d) => sameAnswer(d, trait))
    ) {
      continue;
    }
    decoyTraits.push(trait);
  }

  if (decoyTraits.length < 3) {
    const needed = 3 - decoyTraits.length;
    decoyTraits.push(
      ...pickRandomPoolDecoys(correctText, optionPool, decoyTraits, needed),
    );
  }

  const decoys = decoyTraits.slice(0, 3);
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
