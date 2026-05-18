/** Transparent official artwork from the PokeAPI sprites repository. */
export function officialArtworkUrl(nationalDexId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${nationalDexId}.png`;
}

/** Resolves a species slug to its national Pokédex id via PokeAPI. */
export async function fetchDexIdBySlug(slug: string): Promise<number | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;

  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(normalized)}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { id?: number };
    return typeof data.id === "number" ? data.id : null;
  } catch {
    return null;
  }
}
