"use server";

import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase";
import {
  computeClampedSplit,
  computeSplitForQuizCategory,
  DRUG_DB_LIMIT,
  POKEMON_DB_LIMIT,
} from "@/lib/deck-split";
import type { Category, QuizCategory } from "@/lib/types";
import { getDrugQuizTrait, getPokemonQuizTrait } from "@/lib/quiz-metadata";
import seedItems from "@/data/items.json";
import {
  normalizeLeaderboardGameMode,
  SUDDEN_DEATH_LEADERBOARD_MODE,
  SUDDEN_DEATH_LEADERBOARD_MODE_ALIASES,
} from "@/lib/leaderboard";
import type { GameItem } from "@/lib/types";

export interface DeckCard {
  id: string;
  name: string;
  category: Category;
  description: string;
  slug: string;
  therapeutic_category?: string;
  quizTrait?: string;
}

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  accuracy_percentage: number;
  game_mode: string;
}

export interface SubmitScorePayload {
  playerName: string;
  score: number;
  accuracy: number;
  gameMode: string;
  guestId: string;
}

const GUEST_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function resolveServerGuestId(guestId: string): string {
  const trimmed = guestId.trim();
  if (trimmed && GUEST_UUID_RE.test(trimmed)) {
    return trimmed;
  }
  return crypto.randomUUID();
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function pokemonTraitFromLearnMore(slug: string): string | undefined {
  const filePath = join(process.cwd(), "content", "learnMore", `${slug}.md`);
  if (!existsSync(filePath)) return undefined;
  const raw = readFileSync(filePath, "utf8");
  if (!raw.includes('category: "pokemon"')) return undefined;
  const match = raw.match(
    /is an? ([A-Za-z]+(?:\/[A-Za-z]+)?)(?:-type)?\s+Pok[eé]mon/i,
  );
  if (!match) return undefined;
  return match[1].trim();
}

type MedicineRow = {
  id: number;
  name: string;
  therapeutic_category: string;
};

type PokemonRow = {
  id: number;
  name: string;
};

function mapMedicineRow(row: MedicineRow): DeckCard {
  const raw = row.therapeutic_category?.trim() ?? "";
  const placeholder = /^Medication:\s*/i.test(raw);
  const base: GameItem = {
    id: String(row.id),
    name: row.name,
    category: "drug",
    description: placeholder ? `Medication: ${row.name}` : raw,
    slug: slugify(row.name),
    quizTrait: placeholder ? undefined : raw || undefined,
  };
  const quizTrait = getDrugQuizTrait(base);
  return {
    ...base,
    description: quizTrait,
    therapeutic_category: quizTrait,
    quizTrait,
  };
}

function mapPokemonRow(row: PokemonRow): DeckCard {
  const slug = slugify(row.name);
  const learnTrait = pokemonTraitFromLearnMore(slug);
  const base: GameItem = {
    id: String(row.id),
    name: row.name,
    category: "pokemon",
    description: learnTrait
      ? `${row.name} is a ${learnTrait} Pokémon`
      : `Pokémon species: ${row.name}`,
    slug,
    quizTrait: learnTrait,
  };
  const quizTrait = getPokemonQuizTrait(base);
  return {
    ...base,
    description: learnTrait
      ? `${row.name} is a ${learnTrait} Pokémon`
      : base.description,
    quizTrait,
  };
}

function deckFromSeed(drugCount: number, pokemonCount: number): DeckCard[] {
  const pool = seedItems as GameItem[];
  const drugs = shuffleArray(pool.filter((i) => i.category === "drug")).slice(
    0,
    drugCount,
  );
  const pokemon = shuffleArray(
    pool.filter((i) => i.category === "pokemon"),
  ).slice(0, pokemonCount);

  if (drugs.length < drugCount || pokemon.length < pokemonCount) {
    throw new Error("Seed data does not contain enough items for this game size");
  }

  return shuffleArray([
    ...drugs.map((item) => {
      const base: GameItem = {
        id: item.id,
        name: item.name,
        category: "drug",
        description: item.description,
        slug: item.slug,
      };
      const quizTrait = item.quizTrait ?? getDrugQuizTrait(item);
      return {
        ...item,
        description: quizTrait,
        therapeutic_category: quizTrait,
        quizTrait,
      };
    }),
    ...pokemon.map((item) => {
      const learnTrait = pokemonTraitFromLearnMore(item.slug);
      const quizTrait = item.quizTrait ?? learnTrait ?? getPokemonQuizTrait(item);
      return {
        ...item,
        description: learnTrait
          ? `${item.name} is a ${learnTrait} Pokémon`
          : item.description,
        quizTrait,
      };
    }),
  ]);
}

/**
 * Builds a randomized game deck from `medicine` and `pokemon` tables
 * with a 30–70% split, clamped to 150 items per category.
 * Falls back to `items.json` if the database is empty or under-seeded.
 */
export async function generateGameDeck(
  totalQuestions: number,
  quizCategory: QuizCategory = "both",
): Promise<DeckCard[]> {
  const { drugCount, pokemonCount } = computeSplitForQuizCategory(
    totalQuestions,
    quizCategory,
  );

  const supabase = getSupabaseServer();

  try {
    const [drugsResponse, pokemonResponse] = await Promise.all([
      supabase
        .from("medicine")
        .select("id, name, therapeutic_category")
        .limit(DRUG_DB_LIMIT),
      supabase.from("pokemon").select("id, name").limit(POKEMON_DB_LIMIT),
    ]);

    if (drugsResponse.error) throw drugsResponse.error;
    if (pokemonResponse.error) throw pokemonResponse.error;

    const medicines = (drugsResponse.data ?? []) as MedicineRow[];
    const pokemons = (pokemonResponse.data ?? []) as PokemonRow[];

    if (medicines.length < drugCount || pokemons.length < pokemonCount) {
      console.warn(
        `Database under-seeded (${medicines.length} drugs, ${pokemons.length} Pokémon); using local seed data. Run npm run seed to populate Supabase.`,
      );
      return deckFromSeed(drugCount, pokemonCount);
    }

    const selectedDrugs = shuffleArray(medicines)
      .slice(0, drugCount)
      .map(mapMedicineRow);

    const selectedPokemon = shuffleArray(pokemons)
      .slice(0, pokemonCount)
      .map(mapPokemonRow);

    return shuffleArray([...selectedDrugs, ...selectedPokemon]);
  } catch (error) {
    console.error("Error fetching game deck from Supabase:", error);
    return deckFromSeed(drugCount, pokemonCount);
  }
}

/** Top 50 scores for a game mode, highest score first. */
export async function getLeaderboard(
  gameMode: string,
): Promise<LeaderboardEntry[]> {
  if (!gameMode.trim()) {
    throw new Error("gameMode is required");
  }

  const supabase = getSupabaseServer();
  const canonicalMode = normalizeLeaderboardGameMode(gameMode);

  let query = supabase
    .from("leaderboard")
    .select("id, player_name, score, accuracy_percentage, game_mode");

  if (canonicalMode === SUDDEN_DEATH_LEADERBOARD_MODE) {
    query = query.in("game_mode", [...SUDDEN_DEATH_LEADERBOARD_MODE_ALIASES]);
  } else {
    query = query.eq("game_mode", canonicalMode);
  }

  const { data, error } = await query
    .order("score", { ascending: false })
    .order("accuracy_percentage", { ascending: false })
    .limit(50);

  if (error) {
    console.error(
      "[getLeaderboard] Supabase fetch failed:",
      error.message,
      error,
    );
    throw new Error(`Failed to fetch leaderboard: ${error.message}`);
  }

  return (data ?? []) as LeaderboardEntry[];
}

/** Persists a completed run to the leaderboard. */
export async function submitScore(
  payload: SubmitScorePayload,
): Promise<boolean> {
  const { playerName, score, accuracy, gameMode, guestId } = payload;

  const trimmedName = playerName.trim().slice(0, 15);
  if (!trimmedName) {
    throw new Error("playerName is required");
  }
  if (!gameMode.trim()) {
    throw new Error("gameMode is required");
  }
  if (score < 0 || !Number.isFinite(score)) {
    throw new Error("score must be a non-negative number");
  }
  if (accuracy < 0 || accuracy > 100 || !Number.isFinite(accuracy)) {
    throw new Error("accuracy must be between 0 and 100");
  }

  const resolvedGuestId = resolveServerGuestId(guestId ?? "");
  const canonicalMode = normalizeLeaderboardGameMode(gameMode);

  const supabase = getSupabaseServer();

  try {
    const { error } = await supabase.from("leaderboard").insert({
      player_name: trimmedName,
      score,
      accuracy_percentage: accuracy,
      game_mode: canonicalMode,
      guest_id: resolvedGuestId,
    });

    if (error) {
      console.error(
        "[submitScore] Supabase insert failed:",
        error.message,
        error,
      );
      throw new Error(`Failed to submit score: ${error.message}`);
    }

    revalidatePath("/leaderboard");
    revalidatePath("/");

    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to submit score");
  }
}
