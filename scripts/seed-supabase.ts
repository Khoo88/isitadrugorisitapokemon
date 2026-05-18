/**
 * Seeds medicine & pokemon tables from src/data/items.json
 * Run: npm run seed
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

interface SeedItem {
  id: string;
  name: string;
  category: "drug" | "pokemon";
  slug: string;
  description: string;
}

// 👇 Bringing this back! This is what actually reads your .env.local file
function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
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
  } catch (err) {
    console.warn("⚠️ Could not read .env.local file.");
  }
}

async function main() {
  // Tell the script to load the variables first
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  const supabase = createClient(url, key);

  const jsonPath = resolve(process.cwd(), "src/data/items.json");
  const items = JSON.parse(readFileSync(jsonPath, "utf-8")) as SeedItem[];

  const drugs = items.filter((i) => i.category === "drug");
  const pokemon = items.filter((i) => i.category === "pokemon");

  console.log(`Found ${drugs.length} drugs, ${pokemon.length} pokemon in JSON`);

  const medicineRows = drugs.map((d) => ({
    name: d.name,
    therapeutic_category: d.description,
  }));

  const pokemonRows = pokemon.map((p) => ({
    name: p.name,
  }));

  const BATCH = 50;

  for (let i = 0; i < medicineRows.length; i += BATCH) {
    const chunk = medicineRows.slice(i, i + BATCH);
    const { error } = await supabase
      .from("medicine")
      .upsert(chunk, { onConflict: "name" });
    if (error) {
      throw new Error(`Medicine upsert failed: ${error.message}`);
    }
    console.log(`Upserted medicine ${i + chunk.length}/${medicineRows.length}`);
  }

  for (let i = 0; i < pokemonRows.length; i += BATCH) {
    const chunk = pokemonRows.slice(i, i + BATCH);
    const { error } = await supabase
      .from("pokemon")
      .upsert(chunk, { onConflict: "name" });
    if (error) {
      throw new Error(`Pokemon upsert failed: ${error.message}`);
    }
    console.log(`Upserted pokemon ${i + chunk.length}/${pokemonRows.length}`);
  }

  console.log("🎉 Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});