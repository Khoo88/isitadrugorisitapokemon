import { getSiteUrl } from "@/lib/site";

const FETCH_TIMEOUT_MS = 8_000;
const REVALIDATE_SECONDS = 86_400;

const WIKI_USER_AGENT = `IsItADrugOrAPokemon/1.0 (${getSiteUrl()}; hello@capitalisedcode.com)`;

const WIKI_FETCH_INIT: RequestInit = {
  headers: {
    "User-Agent": WIKI_USER_AGENT,
    Accept: "application/json",
  },
  next: { revalidate: REVALIDATE_SECONDS },
};

export interface WikiLiveData {
  text: string;
  imageUrl?: string;
}

function wikiTitle(name: string): string {
  return name.trim().replace(/ /g, "_");
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      ...WIKI_FETCH_INIT,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

interface MediaWikiPage {
  extract?: string;
  thumbnail?: {
    source?: string;
  };
  missing?: boolean | "";
}

interface MediaWikiQueryResponse {
  query?: {
    pages?: Record<string, MediaWikiPage>;
  };
}

function parseMediaWikiPage(data: MediaWikiQueryResponse | null): WikiLiveData | null {
  const pages = data?.query?.pages;
  if (!pages) return null;

  const page = Object.values(pages)[0];
  if (!page || page.missing) return null;

  const text = page.extract?.trim();
  if (!text) return null;

  const imageUrl = page.thumbnail?.source?.trim();
  return {
    text,
    ...(imageUrl ? { imageUrl } : {}),
  };
}

/** Live extract + thumbnail from English Wikipedia (Action API, 1200 chars). */
export async function fetchWikipediaSummary(
  name: string,
): Promise<WikiLiveData | null> {
  const title = wikiTitle(name);
  if (!title) return null;

  const params = new URLSearchParams({
    action: "query",
    prop: "extracts|pageimages",
    exchars: "1200",
    explaintext: "1",
    pithumbsize: "500",
    format: "json",
    redirects: "1",
    titles: title,
  });

  const url = `https://en.wikipedia.org/w/api.php?${params.toString()}`;
  const data = await fetchJson<MediaWikiQueryResponse>(url);
  return parseMediaWikiPage(data);
}

/** Live lore excerpt from Bulbapedia (MediaWiki extracts API). */
export async function fetchBulbapediaSummary(
  name: string,
): Promise<WikiLiveData | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const params = new URLSearchParams({
    action: "query",
    prop: "extracts",
    exchars: "1200",
    explaintext: "1",
    format: "json",
    redirects: "1",
    titles: `${trimmed}_(Pokémon)`,
  });

  const url = `https://bulbapedia.bulbagarden.net/w/api.php?${params.toString()}`;
  const data = await fetchJson<MediaWikiQueryResponse>(url);
  return parseMediaWikiPage(data);
}
