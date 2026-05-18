/**
 * Generates drug learn-more Markdown files only.
 * Run: npm run generate-drugs
 * Force overwrite: npm run generate-drugs -- --force
 */
import { GoogleGenAI } from "@google/genai";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, join } from "path";

const DRUG_NAMES = [
  "Acetaminophen", "Acyclovir", "Adalimumab", "Aemcolo", "Albuterol",
  "Allopurinol", "Alprazolam", "Amiodarone", "Amlodipine", "Amoxicillin",
  "Apixaban", "Aripiprazole", "Atorvastatin", "Azithromycin", "Biktarvy",
  "Bisacodyl", "Brimonidine", "Budesonide", "Buprenorphine", "Bupropion",
  "Buspirone", "Carvedilol", "Ceftriaxone", "Cephalexin", "Chlorthalidone",
  "Ciprofloxacin", "Citalopram", "Clindamycin", "Clonazepam", "Clopidogrel",
  "Colchicine", "Cyclobenzaprine", "Diazepam", "Digoxin", "Diltiazem",
  "Diphenhydramine", "Docusate", "Dolutegravir", "Doxycycline", "Duloxetine",
  "Dupilumab", "Empagliflozin", "Entyvio", "Eplerenone", "Erythromycin",
  "Escitalopram", "Eszopiclone", "Etanercept", "Ethambutol", "Famotidine",
  "Finasteride", "Fingolimod", "Fluconazole", "Fluticasone", "Furosemide",
  "Gabapentin", "Gentamicin", "Glipizide", "Haloperidol", "Hydralazine",
  "Hydrochlorothiazide", "Hydroxychloroquine", "Hydroxyzine", "Ibuprofen",
  "Isoniazid", "Isosorbide", "Kevzara", "Lactulose", "Lamotrigine",
  "Latanoprost", "Ledipasvir", "Lenvima", "Levocetirizine", "Levofloxacin",
  "Levothyroxine", "Linezolid", "Lisinopril", "Lithium", "Loperamide",
  "Losartan", "Meloxicam", "Meropenem", "Mesalamine", "Metformin",
  "Methadone", "Methotrexate", "Metoclopramide", "Metoprolol", "Mirtazapine",
  "Montelukast", "Naloxone", "Naltrexone", "Nirmatrelvir", "Nitrofurantoin",
  "Nitroglycerin", "Olanzapine", "Omalizumab", "Omeprazole", "Ondansetron",
  "Orlistat", "Oseltamivir", "Otezla", "Pantoprazole", "Paxlovid",
  "Phentermine", "Piperacillin", "Pradaxa", "Pravastatin", "Prednisolone",
  "Prednisone", "Promethazine", "Propranolol", "Pyrazinamide", "Quetiapine",
  "Ranitidine", "Remdesivir", "Ribavirin", "Rifampin", "Risperidone",
  "Rivaroxaban", "Rosuvastatin", "Semaglutide", "Sertraline", "Sildenafil",
  "Simvastatin", "Sitagliptin", "Sofosbuvir", "Spironolactone", "Sucralfate",
  "Tadalafil", "Tamsulosin", "Tenofovir", "Timolol", "Tobramycin",
  "Torsemide", "Tramadol", "Trazodone", "Trimethoprim", "Trulicity",
  "Ursodiol", "Valacyclovir", "Vancomycin", "Varenicline", "Venlafaxine",
  "Verapamil", "Viberzi", "Warfarin", "Xiidra", "Zolpidem", "Zubsolv",
] as const;

const CONTENT_DIR = resolve(process.cwd(), "content", "learnMore");
const MODEL = "gemini-2.5-flash";
const SUCCESS_DELAY_MS = Number(process.env.GENERATE_DELAY_MS) || 13_000;
const RATE_LIMIT_DELAY_MS = 5000;
const MAX_RETRIES = 5;
const FORCE = process.argv.includes("--force");

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

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function stripMarkdownFences(text: string): string {
  let body = text.trim();
  const fenceMatch = body.match(/^```(?:markdown|md)?\s*\n?([\s\S]*?)\n?```$/i);
  if (fenceMatch) body = fenceMatch[1].trim();
  return body;
}

function buildDrugPrompt(name: string): string {
  return `You are a clinical medical copywriter. Write educational Markdown for the prescription medication "${name}".

Use these EXACT section headers (all three required):
## What is ${name}?
## Primary Uses
## Common Side Effects

Section requirements:
- "## What is ${name}?": Write 2-3 substantial paragraphs (not bullet lists) covering therapeutic class, mechanism of action, and how the drug works in the body. Use precise clinical language suitable for a health-education reference page.
- "## Primary Uses": Provide a detailed breakdown of FDA-approved or standard clinical indications, typical prescribing scenarios, and who receives this therapy. Use paragraphs and/or bullet lists as appropriate.
- "## Common Side Effects": List documented adverse reactions, frequent side effects, and important clinical warnings. Use paragraphs and/or bullet lists.

Rules:
- Output plain Markdown only (body sections after headers).
- Do NOT include frontmatter.
- Do NOT wrap output in code fences.
- Be factually accurate; if brand-only (e.g. Lenvima, Trulicity), describe the active agent and its class.
- Do not include disclaimer boilerplate.`;
}

function assembleMarkdown(name: string, slug: string, body: string): string {
  const escapedTitle = name.replace(/"/g, '\\"');
  return `---
title: "${escapedTitle}"
category: "drug"
slug: "${slug}"
---

${body}
`;
}

function getErrorDelayMs(error: unknown): number {
  const message = error instanceof Error ? error.message : String(error);
  const retryInMatch = message.match(/retry in (\d+(?:\.\d+)?)s/i);
  if (retryInMatch) return Math.ceil(parseFloat(retryInMatch[1]) * 1000) + 500;
  const status =
    typeof error === "object" && error !== null && "status" in error
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

async function main() {
  loadEnvLocal();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY missing in .env.local");
  }

  if (!existsSync(CONTENT_DIR)) {
    mkdirSync(CONTENT_DIR, { recursive: true });
  }

  const ai = new GoogleGenAI({ apiKey });
  const total = DRUG_NAMES.length;
  let created = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Generating ${total} drug learn-more files${FORCE ? " (force)" : ""}…\n`);

  for (let i = 0; i < total; i++) {
    const name = DRUG_NAMES[i];
    const slug = toSlug(name);
    const filePath = join(CONTENT_DIR, `${slug}.md`);

    if (!FORCE && existsSync(filePath)) {
      skipped++;
      console.log(`[${i + 1}/${total}] skip  ${slug}.md`);
      continue;
    }

    let saved = false;
    for (let attempt = 1; attempt <= MAX_RETRIES && !saved; attempt++) {
      try {
        console.log(
          `[${i + 1}/${total}] ${attempt > 1 ? `retry ${attempt}` : "gen"}   ${slug}.md…`,
        );
        const response = await ai.models.generateContent({
          model: MODEL,
          contents: buildDrugPrompt(name),
        });
        const text = response.text;
        if (!text?.trim()) throw new Error("Empty response");

        writeFileSync(
          filePath,
          assembleMarkdown(name, slug, stripMarkdownFences(text)),
          "utf-8",
        );
        created++;
        saved = true;
        await sleep(SUCCESS_DELAY_MS);
      } catch (error) {
        if (isRateLimitError(error) && attempt < MAX_RETRIES) {
          const delayMs = getErrorDelayMs(error);
          console.warn(`  rate limit — wait ${Math.round(delayMs / 1000)}s`);
          await sleep(delayMs);
          continue;
        }
        failed++;
        console.error(`  fail:`, error);
        await sleep(getErrorDelayMs(error));
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
