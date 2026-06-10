import type { Category } from "@/lib/types";

const WIKI_HEADING_RE = /(?:^|\n)(={2,3})\s*([^=\n]+?)\s*\1(?=\n|$)/g;

type WikiBlock =
  | { type: "paragraph"; content: string }
  | { type: "heading"; content: string; level: 2 | 3 };

function parseWikiText(text: string): WikiBlock[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const blocks: WikiBlock[] = [];
  let lastIndex = 0;

  for (const match of trimmed.matchAll(WIKI_HEADING_RE)) {
    const matchIndex = match.index ?? 0;
    const before = trimmed.slice(lastIndex, matchIndex).trim();
    if (before) {
      blocks.push({ type: "paragraph", content: before });
    }

    const equals = match[1] ?? "==";
    const level: 2 | 3 = equals.length <= 2 ? 2 : 3;
    blocks.push({ type: "heading", content: match[2].trim(), level });
    lastIndex = matchIndex + match[0].length;
  }

  const tail = trimmed.slice(lastIndex).trim();
  if (tail) {
    blocks.push({ type: "paragraph", content: tail });
  }

  if (blocks.length === 0) {
    blocks.push({ type: "paragraph", content: trimmed });
  }

  return blocks;
}

function splitParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

interface StructuredWikiTextProps {
  text: string;
  category: Category;
  itemName: string;
}

export function StructuredWikiText({
  text,
  category,
  itemName,
}: StructuredWikiTextProps) {
  const blocks = parseWikiText(text);
  const isDrug = category === "drug";

  return (
    <div className="article-body">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3
              key={`heading-${index}-${block.content}`}
              className="text-xl font-bold text-white mt-8 mb-4"
            >
              {block.content}
            </h3>
          );
        }

        const paragraphs = splitParagraphs(block.content);
        const isFirstIntro =
          index === 0 && block.type === "paragraph" && paragraphs.length > 0;

        return (
          <div key={`paragraph-${index}`}>
            {isFirstIntro && (
              <h2 className="text-2xl font-extrabold text-white mt-8 mb-4">
                {isDrug ? `What is ${itemName}?` : `Who is ${itemName}?`}
              </h2>
            )}
            {paragraphs.map((paragraph, pIndex) => (
              <p
                key={`${index}-${pIndex}`}
                className="text-slate-300 leading-relaxed mb-4"
              >
                {paragraph}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}
