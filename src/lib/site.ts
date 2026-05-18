/** Canonical site URL for metadata, sitemap, and OG tags. */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3001";
}

export const SITE_NAME = "Drug or Pokémon?";

export const DEFAULT_TITLE =
  "Drug or Pokémon? — The Ultimate Pharmaceutical vs Pocket Monster Quiz";

export const DEFAULT_DESCRIPTION =
  "Can you tell a prescription medication brand name apart from a pocket monster? Put your knowledge to the test in this fast-paced, highly addictive web game challenge.";

export const DEFAULT_KEYWORDS = [
  "drug or pokemon",
  "pokemon or medicine",
  "pharmaceutical game",
  "brand name quiz",
  "web developer portfolio",
  "capitalised code",
  "guess the pokemon",
];
