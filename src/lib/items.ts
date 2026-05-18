import type { GameItem, QuestionCount } from "./types";
import { generateGameDeck } from "@/app/actions/gameActions";
import { sampleItems } from "./game";
import seedItems from "@/data/items.json";

/** Generates a deck via Supabase Server Action, with JSON seed fallback. */
export async function generateGameDeckItems(
  count: QuestionCount,
): Promise<GameItem[]> {
  try {
    const deck = await generateGameDeck(count);
    return deck as GameItem[];
  } catch {
    const pool = seedItems as GameItem[];
    return sampleItems(pool, count);
  }
}
