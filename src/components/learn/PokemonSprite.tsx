import { getValidPokemonData } from "@/lib/pokeapi";

const FALLBACK = (
  <div className="w-12 h-12 shrink-0 rounded bg-white/5" aria-hidden />
);

export async function PokemonSprite({ name }: { name: string }) {
  const data = await getValidPokemonData(name);
  if (!data) {
    return FALLBACK;
  }

  const url =
    data.sprites?.front_default ||
    data.sprites?.other?.["official-artwork"]?.front_default;
  if (!url) {
    return FALLBACK;
  }

  return (
    <img
      src={url}
      alt={name}
      className="w-12 h-12 object-contain [image-rendering:pixelated]"
    />
  );
}
