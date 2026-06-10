import seedItems from "@/data/items.json";
import { shuffle } from "@/lib/game";
import type { GameItem } from "@/lib/types";

const items = seedItems as GameItem[];

export function getAllGameItems(): GameItem[] {
  return items;
}

export function getItemBySlug(slug: string): GameItem | null {
  return items.find((item) => item.slug === slug) ?? null;
}

/** Random same-category entries for the learn-page discovery grid. */
export function getSuggestedItems(
  currentItem: GameItem,
  count: number = 3,
): GameItem[] {
  const pool = items.filter(
    (candidate) =>
      candidate.category === currentItem.category &&
      candidate.id !== currentItem.id,
  );
  if (pool.length === 0) return [];
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

export function getWikiArticleUrl(item: GameItem): string {
  if (item.category === "drug") {
    const title = item.name.trim().replace(/ /g, "_");
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
  }
  const title = `${item.name.trim()}_(Pokémon)`;
  return `https://bulbapedia.bulbagarden.net/wiki/${encodeURIComponent(title)}`;
}

export function getDataErrorReportMailto(item: GameItem): string {
  const subject = `Data Error Report: ${item.name}`;
  return `mailto:hello@capitalisedcode.com?subject=${encodeURIComponent(subject)}`;
}

export function getAnalysisReadout(item: GameItem): string {
  const description = item.description?.trim();
  if (description) return description;

  const trait = item.quizTrait?.trim();
  if (trait) {
    return item.category === "drug"
      ? `Clinical profile: ${trait}. Full dossier pending editorial review.`
      : `Species profile: ${trait}. Extended field notes pending.`;
  }

  return item.category === "drug"
    ? "No clinical analysis on file. This compound is catalogued in the game database awaiting expanded pharmacology notes."
    : "No field analysis on file. This species is catalogued in the Pokédex awaiting expanded encounter data.";
}
