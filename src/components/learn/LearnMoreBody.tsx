import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import type { LearnMoreDoc } from "@/lib/learn-more";
import { DrugLearnVisual } from "@/components/learn/DrugLearnVisual";
import { PokemonLearnArtwork } from "@/components/learn/PokemonLearnArtwork";

interface LearnMoreBodyProps {
  doc: LearnMoreDoc;
  slug: string;
  pokemonDexId?: number | null;
}

function headingText(children: ReactNode): string {
  return String(children ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldShowVisual(
  category: LearnMoreDoc["category"],
  heading: string,
): boolean {
  if (category === "pokemon") {
    return /^Who is\b/i.test(heading);
  }
  return /^What is\b/i.test(heading);
}

export function LearnMoreBody({ doc, slug, pokemonDexId }: LearnMoreBodyProps) {
  let visualInserted = false;

  const components: Components = {
    h2: ({ children, ...props }) => {
      const heading = headingText(children);
      const showVisual =
        !visualInserted && shouldShowVisual(doc.category, heading);

      if (showVisual) {
        visualInserted = true;
      }

      return (
        <>
          {showVisual &&
            (doc.category === "pokemon" ? (
              <PokemonLearnArtwork
                slug={slug}
                name={doc.title}
                dexId={pokemonDexId}
              />
            ) : (
              <DrugLearnVisual name={doc.title} />
            ))}
          <h2
            {...props}
            className="mt-6 text-xl font-bold text-text-primary first:mt-0"
          >
            {children}
          </h2>
        </>
      );
    },
  };

  return (
    <section className="learn-body space-y-4 text-text-muted [&_strong]:text-text-primary">
      <ReactMarkdown components={components}>{doc.body}</ReactMarkdown>
    </section>
  );
}
