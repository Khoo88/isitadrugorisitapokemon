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

const PLACEHOLDER_DRUG_RE = /^Medication:\s*/i;
const PLACEHOLDER_POKEMON_RE = /^Pokémon species:\s*/i;

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
  if (item.quizTrait?.trim() && isValidDrugTrait(item.quizTrait, item.name)) {
    return item.quizTrait.trim();
  }
  if (
    item.description &&
    isValidDrugTrait(item.description, item.name)
  ) {
    return item.description.trim();
  }
  return pickFromPool(item.slug, DRUG_CLASS_POOL);
}

export function getPokemonQuizTrait(item: GameItem): string {
  if (item.quizTrait?.trim() && isValidPokemonTrait(item.quizTrait, item.name)) {
    return item.quizTrait.trim();
  }

  const fromDesc = parseTypeFromDescription(item.description);
  if (fromDesc && isValidPokemonTrait(fromDesc, item.name)) return fromDesc;

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

function uniqueDecoys(
  correct: string,
  pool: readonly string[],
  slug: string,
  count: number,
): string[] {
  const decoys: string[] = [];
  let salt = 1;
  while (decoys.length < count && salt < pool.length * 2) {
    const candidate = pickFromPool(slug, pool, salt);
    salt += 1;
    if (candidate !== correct && !decoys.includes(candidate)) {
      decoys.push(candidate);
    }
  }
  return decoys;
}

export function buildContextualMultipleChoice(
  item: GameItem,
  pool: GameItem[],
): ContextualQuizQuestion {
  const isDrug = item.category === "drug";
  const correctText = isDrug
    ? getDrugQuizTrait(item)
    : getPokemonQuizTrait(item);
  const optionPool = isDrug ? DRUG_CLASS_POOL : POKEMON_TYPE_POOL;
  const prompt = isDrug
    ? buildDrugQuizPrompt(item.name)
    : buildPokemonQuizPrompt(item.name);

  const sameCategory = pool.filter(
    (p) => p.id !== item.id && p.category === item.category,
  );

  const decoyTexts = new Set<string>();
  for (const other of sameCategory) {
    const trait = isDrug
      ? getDrugQuizTrait(other)
      : getPokemonQuizTrait(other);
    if (trait !== correctText) decoyTexts.add(trait);
  }

  for (const d of uniqueDecoys(correctText, optionPool, item.slug, 3)) {
    if (d !== correctText) decoyTexts.add(d);
  }

  const decoys = [...decoyTexts].slice(0, 3);
  while (decoys.length < 3) {
    const extra = pickFromPool(`${item.slug}-${decoys.length}`, optionPool);
    if (extra !== correctText && !decoys.includes(extra)) decoys.push(extra);
  }

  const options = shuffle([
    { text: correctText, correct: true },
    ...decoys.map((text) => ({ text, correct: false })),
  ]);

  const correctIndex = options.findIndex((o) => o.correct);
  return { prompt, entityName: item.name, options, correctIndex };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
