import Link from "next/link";
import type { LeaderboardEntry } from "@/app/actions/gameActions";

interface HomeLeaderboardPreviewProps {
  entries: LeaderboardEntry[];
  className?: string;
  embedded?: boolean;
}

function formatAccuracy(value: number) {
  return `${Number(value).toFixed(1)}%`;
}

export function HomeLeaderboardPreview({
  entries,
  className = "",
  embedded = false,
}: HomeLeaderboardPreviewProps) {
  const top5 = entries.slice(0, 5);

  return (
    <section
      className={`w-full ${
        embedded
          ? "border-t border-slate-800/60 pt-6"
          : "glass rounded-2xl border border-white/10 p-5 sm:p-6"
      } ${className}`}
      aria-labelledby="home-leaderboard-heading"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2
          id="home-leaderboard-heading"
          className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted"
        >
          Top Global Players
        </h2>
        <Link
          href="/leaderboard"
          className="text-xs font-semibold text-drug-glow hover:underline"
        >
          Full board →
        </Link>
      </div>

      {top5.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-text-muted">
          No scores submitted yet. Be the first!
        </p>
      ) : (
        <ol className="space-y-2">
          {top5.map((entry, index) => {
            const rank = index + 1;
            const isFirst = rank === 1;

            return (
              <li
                key={String(entry.id)}
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                  isFirst
                    ? "border-accent-gold/30 bg-accent-gold/5 shadow-[0_0_20px_rgba(255,203,5,0.08)]"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`font-mono text-sm font-bold tabular-nums ${
                      isFirst ? "text-accent-gold" : "text-text-muted"
                    }`}
                  >
                    #{rank}
                  </span>
                  <span
                    className="truncate font-semibold text-text-primary"
                    title={entry.player_name}
                  >
                    {entry.player_name}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3 font-mono text-sm tabular-nums">
                  <span className={isFirst ? "text-drug-glow" : "text-pokemon-cream"}>
                    {entry.score} pts
                  </span>
                  <span className="text-text-muted">
                    {formatAccuracy(entry.accuracy_percentage)}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
