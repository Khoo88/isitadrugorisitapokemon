import type { Metadata } from "next";
import { LearnEncyclopedia } from "@/components/learn/LearnEncyclopedia";
import { LearnNotFound } from "@/components/learn/LearnNotFound";
import {
  fetchBulbapediaSummary,
  fetchWikipediaSummary,
} from "@/lib/api-fetchers";
import { getItemBySlug } from "@/lib/items-encyclopedia";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
import type { GameItem } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function learnPageTitle(item: GameItem): string {
  const suffix =
    item.category === "pokemon" ? "Game Encyclopedia" : "Clinical Dossier";
  return `Is ${item.name} a Drug or a Pokémon? | ${suffix}`;
}

function learnPageDescription(item: GameItem): string {
  const source =
    item.category === "pokemon"
      ? "Bulbapedia lore"
      : "clinical Wikipedia summary";
  return `Find out if ${item.name} is a real life pharmaceutical medication or a pocket monster. Read the official ${source} and test your knowledge.`;
}

function buildLearnJsonLd(item: GameItem, slug: string): Record<string, unknown> {
  const pageUrl = `${getSiteUrl()}/learn/${slug}`;
  const description =
    item.description?.trim() ||
    item.quizTrait?.trim() ||
    learnPageDescription(item);

  if (item.category === "pokemon") {
    return {
      "@context": "https://schema.org",
      "@type": "ItemPage",
      name: learnPageTitle(item),
      description,
      url: pageUrl,
      inLanguage: "en",
      isPartOf: {
        "@type": "VideoGame",
        name: SITE_NAME,
        url: getSiteUrl(),
      },
      mainEntity: {
        "@type": "Thing",
        name: item.name,
        description,
      },
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: learnPageTitle(item),
    description,
    url: pageUrl,
    inLanguage: "en",
    about: {
      "@type": "Drug",
      name: item.name,
      description,
    },
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: getSiteUrl(),
    },
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getItemBySlug(slug);

  if (!item) {
    return { title: "Data Not Found | Drug or Pokémon?" };
  }

  const title = learnPageTitle(item);
  const description = learnPageDescription(item);
  const canonical = `/learn/${slug}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_US",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function LearnPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getItemBySlug(slug);

  if (!item) {
    return <LearnNotFound slug={slug} />;
  }

  const liveData =
    item.category === "drug"
      ? await fetchWikipediaSummary(item.name)
      : await fetchBulbapediaSummary(item.name);

  const jsonLd = buildLearnJsonLd(item, slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LearnEncyclopedia item={item} liveData={liveData} />
    </>
  );
}
