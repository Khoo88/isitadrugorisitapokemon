"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PokeballIcon } from "@/components/ui/ThematicIcons";
import {
  fetchDexIdBySlug,
  officialArtworkUrl,
} from "@/lib/pokemon-artwork";

interface PokemonLearnArtworkProps {
  slug: string;
  name: string;
  /** Pre-resolved on the server when available */
  dexId?: number | null;
}

export function PokemonLearnArtwork({
  slug,
  name,
  dexId: dexIdProp,
}: PokemonLearnArtworkProps) {
  const [dexId, setDexId] = useState<number | null>(dexIdProp ?? null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (dexIdProp != null) {
      setDexId(dexIdProp);
      setFailed(false);
      return;
    }

    let cancelled = false;
    setFailed(false);

    fetchDexIdBySlug(slug).then((id) => {
      if (!cancelled) setDexId(id);
    });

    return () => {
      cancelled = true;
    };
  }, [slug, dexIdProp]);

  const src = dexId != null ? officialArtworkUrl(dexId) : null;
  const loading = dexIdProp === undefined && dexId == null && !failed;

  return (
    <figure
      className="mx-auto mb-8 w-full max-w-xs sm:max-w-sm"
      aria-label={`${name} artwork`}
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-pokemon-cream/40 bg-bg-deep/90 p-3 shadow-[0_0_32px_rgba(238,21,21,0.35),inset_0_0_24px_rgba(0,0,0,0.65)]">
        <div className="relative mx-auto aspect-square w-full max-h-48 sm:max-h-56 md:max-h-64">
          {src && !failed ? (
            <Image
              src={src}
              alt={`${name} official artwork`}
              fill
              sizes="(max-width: 640px) 288px, 384px"
              className="object-contain object-center drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
              priority
              onError={() => setFailed(true)}
            />
          ) : loading ? (
            <div
              className="flex h-full items-center justify-center"
              aria-busy="true"
              aria-label="Loading artwork"
            >
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-pokemon-cream/40 border-t-pokemon-cream" />
            </div>
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
