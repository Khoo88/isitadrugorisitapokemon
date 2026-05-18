/**
 * Generates TinaCMS learn-more Markdown files via Gemini.
 * Run: npm run generate-content
 */
import { GoogleGenAI } from "@google/genai";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, join } from "path";

interface Item {
  name: string;
  category: "drug" | "pokemon";
  description?: string;
  slug?: string;
}

const CONTENT_DIR = resolve(process.cwd(), "content", "learnMore");
const ITEMS_PATH = resolve(process.cwd(), "src", "data", "items.json");
const MODEL = "gemini-2.5-flash";
/** Override with GENERATE_DELAY_MS (e.g. 1500 on paid tier). Default 13s fits free-tier RPM. */
const SUCCESS_DELAY_MS = Number(process.env.GENERATE_DELAY_MS) || 13_000;
const RATE_LIMIT_DELAY_MS = 5000;
const MAX_RETRIES = 5;

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  const raw = readFileSync(envPath, "utf-8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[''.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function getErrorDelayMs(error: unknown): number {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);

  const retryInMatch = message.match(/retry in (\d+(?:\.\d+)?)s/i);
  if (retryInMatch) {
    return Math.ceil(parseFloat(retryInMatch[1]) * 1000) + 500;
  }

  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
      ? (error as { status: number }).status
      : undefined;

  return status === 429 ? 25_000 : RATE_LIMIT_DELAY_MS;
}

function isRateLimitError(error: unknown): boolean {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status: number }).status === 429
  ) {
    return true;
  }
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("429") || message.includes("RESOURCE_EXHAUSTED");
}

function stripMarkdownFences(text: string): string {
  let body = text.trim();
  const fenceMatch = body.match(/^```(?:markdown|md)?\s*\n?([\s\S]*?)\n?```$/i);
  if (fenceMatch) {
    body = fenceMatch[1].trim();
  }
  return body;
}

function buildDrugPrompt(name: string, description?: string): string {
  const context = description
    ? `Brief reference: ${description}.`
    : "No additional reference provided.";
  return `Write a clinical, professional Markdown summary for the medication "${name}".
${context}

Use these exact section headers (include all three):
## What is ${name}?
## Primary Uses
## Common Side Effects

Rules:
- Output plain Markdown only.
- Do NOT wrap the response in code fences (no \`\`\`markdown blocks).
- Keep tone factual and suitable for a health-education sidebar.
- 2-4 sentences per section.`;
}

function buildPokemonPrompt(name: string, description?: string): string {
  const context = description
    ? `Brief reference: ${description}.`
    : "No additional reference provided.";
  return `Write an engaging, lore-accurate Markdown summary for the Pokémon "${name}".
${context}

Use these exact section headers (include all three):
## Who is ${name}?
## Biological Quirks & Lore
## Battle Performance

Rules:
- Output plain Markdown only.
- Do NOT wrap the response in code fences (no \`\`\`markdown blocks).
- Draw on established Pokémon canon where applicable.
- 2-4 sentences per section.`;
}

function assembleMarkdown(
  item: Item,
  slug: string,
  body: string,
): string {
  const escapedTitle = item.name.replace(/"/g, '\\"');
  return `---
title: "${escapedTitle}"
category: "${item.category}"
slug: "${slug}"
---

${body}
`;
}

async function generateBody(
  ai: GoogleGenAI,
  item: Item,
): Promise<string> {
  const prompt =
    item.category === "drug"
      ? buildDrugPrompt(item.name, item.description)
      : buildPokemonPrompt(item.name, item.description);

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  const text = response.text;
  if (!text?.trim()) {
    throw new Error("Empty response from Gemini");
  }

  return stripMarkdownFences(text);
}

async function main() {
  loadEnvLocal();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Add it to .env.local before running this script.",
    );
  }

  if (!existsSync(CONTENT_DIR)) {
    mkdirSync(CONTENT_DIR, { recursive: true });
    console.log(`Created directory: ${CONTENT_DIR}`);
  }

  const items = JSON.parse(readFileSync(ITEMS_PATH, "utf-8")) as Item[];
  const ai = new GoogleGenAI({ apiKey });

  let created = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Processing ${items.length} items…\n`);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const slug = toSlug(item.name);
    const filePath = join(CONTENT_DIR, `${slug}.md`);

    if (existsSync(filePath)) {
      skipped++;
      console.log(`[${i + 1}/${items.length}] skip  ${slug}.md (exists)`);
      continue;
    }

    let saved = false;
    for (let attempt = 1; attempt <= MAX_RETRIES && !saved; attempt++) {
      try {
        if (attempt > 1) {
          console.log(
            `[${i + 1}/${items.length}] retry ${slug}.md (attempt ${attempt}/${MAX_RETRIES})…`,
          );
        } else {
          console.log(
            `[${i + 1}/${items.length}] gen   ${slug}.md (${item.category})…`,
          );
        }

        const body = await generateBody(ai, item);
        const markdown = assembleMarkdown(item, slug, body);
        writeFileSync(filePath, markdown, "utf-8");
        created++;
        saved = true;
        await sleep(SUCCESS_DELAY_MS);
      } catch (error) {
        const delayMs = getErrorDelayMs(error);
        const rateLimited = isRateLimitError(error);

        if (rateLimited && attempt < MAX_RETRIES) {
          console.warn(
            `[${i + 1}/${items.length}] rate  ${slug}.md — waiting ${Math.round(delayMs / 1000)}s…`,
          );
          await sleep(delayMs);
          continue;
        }

        failed++;
        console.error(`[${i + 1}/${items.length}] fail  ${slug}.md:`, error);
        console.log(`Waiting ${delayMs / 1000}s before continuing…`);
        await sleep(delayMs);
        break;
      }
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}, Failed: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
