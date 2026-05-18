"use client";

import Image from "next/image";
import { useState } from "react";
import { PokeballIcon } from "@/components/ui/ThematicIcons";

interface PokemonLearnArtworkProps {
  slug: string;
  name: string;
}

export function PokemonLearnArtwork({ slug, name }: PokemonLearnArtworkProps) {
  const [failed, setFailed] = useState(false);
  const src = `https://img.pokemondb.net/artwork/large/${slug.toLowerCase()}.jpg`;

  return (
    <figure
      className="mx-auto mb-8 w-full max-w-xs sm:max-w-sm"
      aria-label={`${name} artwork`}
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-pokemon-cream/40 bg-bg-deep/90 p-3 shadow-[0_0_32px_rgba(238,21,21,0.35),inset_0_0_24px_rgba(0,0,0,0.65)]">
        <div className="relative mx-auto aspect-square w-full max-h-48 sm:max-h-56 md:max-h-64">
          {!failed ? (
            <Image
              src={src}
              alt={`${name} official artwork`}
              fill
              sizes="(max-width: 640px) 288px, 384px"
              className="object-contain object-center"
              priority
              onError={() => setFailed(true)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-pokemon-cream/80">
              <PokeballIcon className="h-16 w-16 opacity-90" aria-hidden="true" />
              <p className="text-center text-xs text-text-muted">
                Artwork unavailable for this species
              </p>
            </div>
          )}
        </div>
      </div>
    </figure>
  );
}
