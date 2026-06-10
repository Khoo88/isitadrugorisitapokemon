import Link from "next/link";
import { LearnBackButton } from "@/components/learn/LearnBackButton";

interface LearnNotFoundProps {
  slug: string;
}

export function LearnNotFound({ slug }: LearnNotFoundProps) {
  return (
    <main className="game-gradient flex min-h-dvh items-center justify-center px-4 py-16">
      <article className="glass w-full max-w-lg rounded-3xl border border-white/10 p-8 text-center shadow-[0_0_48px_rgba(0,0,0,0.45)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-text-muted">
          Error 404 · Data Not Found
        </p>
        <h1 className="mt-4 text-3xl font-extrabold text-text-primary sm:text-4xl">
          Signal Lost
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          No encyclopedia record exists for{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-drug-glow">
            {slug}
          </code>
          . The identifier may be misspelled or not yet indexed in our 700-item
          database.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LearnBackButton className="border-white/15 bg-white/5 text-text-muted hover:border-drug-glow/40 hover:bg-drug-glow/10 hover:text-drug-glow" />
          <Link
            href="/"
            className="rounded-xl border border-pokemon-cream/30 bg-pokemon-cream/10 px-4 py-2 text-sm font-semibold text-pokemon-cream transition hover:bg-pokemon-cream/20"
          >
            Return to lobby
          </Link>
        </div>
      </article>
    </main>
  );
}
