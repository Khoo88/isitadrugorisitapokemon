import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface LearnMoreDoc {
  slug: string;
  title: string;
  category: "drug" | "pokemon";
  body: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "learnMore");

export function getLearnMoreSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx?$/, ""));
}

export function getLearnMoreBySlug(slug: string): LearnMoreDoc | null {
  for (const ext of [".mdx", ".md"]) {
    const filePath = path.join(CONTENT_DIR, `${slug}${ext}`);
    if (!fs.existsSync(filePath)) continue;
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    return {
      slug,
      title: (data.title as string) ?? slug,
      category: (data.category as "drug" | "pokemon") ?? "drug",
      body: content,
    };
  }
  return null;
}

export function getDefaultLearnMore(
  name: string,
  category: "drug" | "pokemon",
  description: string,
): LearnMoreDoc {
  const label = category === "drug" ? "medication" : "Pokémon";
  return {
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: name,
    category,
    body: `## About ${name}\n\n${description}\n\nThis is a **${label}**. Content editors can expand this page in TinaCMS under \`content/learnMore\`.`,
  };
}
