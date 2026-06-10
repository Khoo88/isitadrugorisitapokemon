import { getValidPokemonData } from "@/lib/pokeapi";

const FALLBACK = (
  <div
    className="w-full max-w-xs aspect-square mx-auto border border-white/5 rounded-xl bg-white/[0.02]"
    aria-hidden
  />
);

export async function PokemonArtwork({ name }: { name: string }) {
  const data = await getValidPokemonData(name);
  if (!data) {
    return FALLBACK;
  }

  const url = data.sprites?.other?.["official-artwork"]?.front_default;
  if (!url) {
    return FALLBACK;
  }

  return (
    <img
      src={url}
      alt={name}
      className="w-full h-auto max-h-64 object-contain drop-shadow-2xl"
    />
  );
}
