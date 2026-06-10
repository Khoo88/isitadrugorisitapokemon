const REVALIDATE_SECONDS = 86_400;

const FETCH_INIT: RequestInit = {
  next: { revalidate: REVALIDATE_SECONDS },
};

/** Pokémon resource from PokéAPI `/pokemon/{name}` (subset used by our UI). */
export interface PokeApiPokemonData {
  name?: string;
  sprites?: {
    front_default?: string | null;
    other?: {
      "official-artwork"?: { front_default?: string | null };
    };
  };
}

interface PokemonSpeciesVariety {
  is_default: boolean;
  pokemon: { name: string; url?: string };
}

interface PokemonSpeciesResponse {
  varieties?: PokemonSpeciesVariety[];
}

function sanitizePokemonName(name: string): string {
  return name
    .toLowerCase()
    .replace(/['.]/g, "")
    .replace(/é/g, "e")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function fetchPokemonJson(
  slug: string,
): Promise<PokeApiPokemonData | null> {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(slug)}`,
    FETCH_INIT,
  );
  if (!res.ok) return null;
  try {
    return (await res.json()) as PokeApiPokemonData;
  } catch {
    return null;
  }
}

/**
 * Resolves a display name to a valid `/pokemon/` payload.
 * Tries direct slug first, then species → default variety form name.
 */
export async function getValidPokemonData(
  name: string,
): Promise<PokeApiPokemonData | null> {
  const safeName = sanitizePokemonName(name);
  if (!safeName) return null;

  const direct = await fetchPokemonJson(safeName);
  if (direct) return direct;

  const speciesRes = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${encodeURIComponent(safeName)}`,
    FETCH_INIT,
  );
  if (!speciesRes.ok) return null;

  let speciesData: PokemonSpeciesResponse;
  try {
    speciesData = (await speciesRes.json()) as PokemonSpeciesResponse;
  } catch {
    return null;
  }

  const defaultVariety = speciesData.varieties?.find((v) => v.is_default);
  const formName = defaultVariety?.pokemon?.name?.trim();
  if (!formName) return null;

  return fetchPokemonJson(formName);
}
