import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LearnMoreBody } from "@/components/learn/LearnMoreBody";
import {
  getLearnMoreBySlug,
  getDefaultLearnMore,
} from "@/lib/learn-more";
import seedItems from "@/data/items.json";
import type { GameItem } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc =
    getLearnMoreBySlug(slug) ??
    (() => {
      const item = (seedItems as GameItem[]).find((i) => i.slug === slug);
      if (!item) return null;
      return getDefaultLearnMore(item.name, item.category, item.description);
    })();

  if (!doc) {
    return { title: "Not Found" };
  }

  const label = doc.category === "drug" ? "medication" : "Pokémon";

  return {
    title: `${doc.title} — Learn More`,
    description: `Learn about ${doc.title}: a ${label} featured in Drug or Pokémon?`,
    alternates: { canonical: `/learn/${slug}` },
  };
}

export default async function LearnMorePage({ params }: PageProps) {
  const { slug } = await params;
  const doc =
    getLearnMoreBySlug(slug) ??
    (() => {
      const item = (seedItems as GameItem[]).find((i) => i.slug === slug);
      if (!item) return null;
      return getDefaultLearnMore(item.name, item.category, item.description);
    })();

  if (!doc) notFound();

  const badge =
    doc.category === "drug" ? "💊 Medication" : "⚡ Pokémon";

  return (
    <main className="game-gradient min-h-dvh px-4 py-10">
      <article className="glass mx-auto max-w-2xl rounded-2xl p-8">
        <nav aria-label="Breadcrumb">
          <Link
            href="/"
            className="text-sm text-accent-pokemon hover:underline"
          >
            ← Back to lobby
          </Link>
        </nav>
        <span
          className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
            doc.category === "drug"
              ? "bg-accent-drug/20 text-accent-drug"
              : "bg-accent-pokemon/20 text-accent-pokemon"
          }`}
        >
          {badge}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold">{doc.title}</h1>
        <LearnMoreBody doc={doc} slug={slug} />
      </article>
    </main>
  );
}
