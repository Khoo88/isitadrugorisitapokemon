/** Normalized for comparison: lowercase, leetspeak digits → letters, collapsed spaces. */
function normalizeForProfanityCheck(value: string): string {
  return value
    .toLowerCase()
    .replace(/[0@]/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[4]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Blocked terms (profanity, slurs, hate). Matched on whole words / phrases only.
 * Extend this list as needed; keep in sync with moderation policy.
 */
const BLOCKED_TERMS = [
  "asshole",
  "bastard",
  "bitch",
  "bollocks",
  "bullshit",
  "cock",
  "crap",
  "cunt",
  "damn",
  "dick",
  "dumbass",
  "fag",
  "faggot",
  "fuck",
  "fucker",
  "fucking",
  "goddamn",
  "hell",
  "jackass",
  "motherfucker",
  "nazi",
  "nigga",
  "nigger",
  "penis",
  "piss",
  "pussy",
  "retard",
  "retarded",
  "shit",
  "shitty",
  "slut",
  "twat",
  "vagina",
  "wanker",
  "whore",
] as const;

const BLOCKED_PHRASES = ["kill yourself", "kys"] as const;

const BLOCKED_WORD_RE = new RegExp(
  `\\b(?:${BLOCKED_TERMS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "i",
);

export const INAPPROPRIATE_NAME_MESSAGE = "Please choose an appropriate name.";

export function containsProfanity(value: string): boolean {
  const normalized = normalizeForProfanityCheck(value);
  if (!normalized) return false;

  for (const phrase of BLOCKED_PHRASES) {
    if (normalized.includes(phrase)) return true;
  }

  return BLOCKED_WORD_RE.test(normalized);
}
