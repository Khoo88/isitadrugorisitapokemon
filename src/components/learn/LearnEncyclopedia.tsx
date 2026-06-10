import Link from "next/link";
import { DrugLearnVisual } from "@/components/learn/DrugLearnVisual";
import { LearnBackButton } from "@/components/learn/LearnBackButton";
import { PokemonArtwork } from "@/components/learn/PokemonArtwork";
import { PokemonSprite } from "@/components/learn/PokemonSprite";
import { StructuredWikiText } from "@/components/learn/StructuredWikiText";
import { MedicalCross } from "@/components/ui/ThematicIcons";
import {
  getAnalysisReadout,
  getDataErrorReportMailto,
  getSuggestedItems,
  getWikiArticleUrl,
} from "@/lib/items-encyclopedia";
import type { WikiLiveData } from "@/lib/api-fetchers";
import { getLearnMoreBySlug } from "@/lib/learn-more";
import type { GameItem } from "@/lib/types";

interface LearnEncyclopediaProps {
  item: GameItem;
  liveData?: WikiLiveData | null;
}

export async function LearnEncyclopedia({
  item,
  liveData = null,
}: LearnEncyclopediaProps) {
  const isDrug = item.category === "drug";
  const analysis = liveData?.text?.trim() || getAnalysisReadout(item);
  const wikiUrl = getWikiArticleUrl(item);
  const reportMailto = getDataErrorReportMailto(item);
  const extendedMd = getLearnMoreBySlug(item.slug);
  const relatedEntries = getSuggestedItems(item, 3);

  return (
    <main className="min-h-dvh bg-bg-deep text-text-primary">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <header>
          <LearnBackButton />
        </header>

        <div
          className={`text-sm font-bold mt-8 mb-2 ${
            isDrug ? "text-drug-glow" : "text-pokemon-cream"
          }`}
        >
          {isDrug ? "💊 Medication" : "⚡ Pokémon"}
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-8 break-words">
          {item.name}
        </h1>

        <div className="flex justify-center mb-12">
          <div className="rounded-2xl border border-white/10 bg-bg-card/50 p-6 sm:p-8">
            {isDrug ? (
              <DrugLearnVisual
                name={item.name}
                imageUrl={liveData?.imageUrl}
              />
            ) : (
              <PokemonArtwork name={item.name} />
            )}
          </div>
        </div>

        <StructuredWikiText
          text={analysis}
          category={item.category}
          itemName={item.name}
        />

        {extendedMd && (
          <p className="mt-6 text-sm text-text-muted leading-relaxed">
            Extended editorial notes are available in the full dossier archive
            for this entry.
          </p>
        )}

        <a
          href={wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-8 inline-flex text-sm font-medium underline-offset-4 transition hover:underline ${
            isDrug ? "text-drug-glow/90 hover:text-drug-glow" : "text-pokemon-cream/90 hover:text-pokemon-cream"
          }`}
        >
          Read full Wiki article ↗
        </a>

        <hr className="border-white/10 my-12" />

        {relatedEntries.length > 0 && (
          <section aria-label="Related entries">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-text-muted">
              Related Entries
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {relatedEntries.map((suggested) => {
                const suggestedTrait =
                  suggested.quizTrait?.trim() ||
                  suggested.description?.trim() ||
                  "—";
                return (
                  <Link
                    key={suggested.id}
                    href={`/learn/${suggested.slug}`}
                    className={`flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:-translate-y-1 hover:bg-white/[0.06] ${
                      suggested.category === "drug"
                        ? "hover:border-drug-glow/40"
                        : "hover:border-pokemon-red/40"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{suggested.name}</p>
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {suggestedTrait}
                      </p>
                    </div>
                    {suggested.category === "pokemon" ? (
                      <PokemonSprite name={suggested.name} />
                    ) : (
                      <MedicalCross
                        className="h-8 w-8 shrink-0 opacity-20 text-drug-glow"
                        aria-hidden
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <p className="mt-12 text-center">
          <a
            href={reportMailto}
            className="text-xs text-text-muted transition-colors hover:text-white"
          >
            Spot an error with this data? Let us know.
          </a>
        </p>
      </div>
    </main>
  );
}
