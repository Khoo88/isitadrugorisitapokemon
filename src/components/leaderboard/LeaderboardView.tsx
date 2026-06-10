"use client";

import { motion } from "framer-motion";
import type { LeaderboardEntry } from "@/app/actions/gameActions";
import { PlayStyleBadge } from "@/components/leaderboard/PlayStyleBadge";
import { PokeballIcon } from "@/components/ui/ThematicIcons";

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
}

function formatAccuracy(value: number) {
  return `${Number(value).toFixed(1)}%`;
}

function PodiumCard({
  entry,
  rank,
  variant,
}: {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
  variant: "gold" | "silver" | "bronze";
}) {
  const heights = { 1: "min-h-[200px]", 2: "min-h-[168px]", 3: "min-h-[152px]" };
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" } as const;

  const panelClass =
    variant === "gold" ? "theme-drug-panel" : "theme-pokemon-panel";

  const borderClass =
    variant === "gold"
      ? "border-pokemon-cream/80"
      : variant === "silver"
        ? "border-slate-300/60"
        : "border-amber-700/70";

  const className = `relative flex w-full max-w-[200px] flex-col rounded-2xl border-2 px-3 pb-4 pt-8 ${heights[rank]} ${panelClass} ${borderClass}`;

  const inner = (
    <>
      <span className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 text-2xl drop-shadow-md">
        {medals[rank]}
      </span>

      {variant !== "gold" && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-10 z-0 -translate-x-1/2 opacity-25"
        >
          <PokeballIcon className="h-16 w-16" />
        </motion.div>
      )}

      <div className="relative z-10 mt-2 flex w-full flex-col items-center gap-2 px-1">
        <div className="w-full rounded-md bg-slate-950/50 px-3 py-2 text-center backdrop-blur-sm">
          <p
            className={`line-clamp-2 text-center text-sm font-bold tracking-wide ${
              variant === "gold" ? "text-drug-glow" : "text-pokemon-white"
            }`}
            title={entry.player_name}
          >
            {entry.player_name}
          </p>
        </div>

        <div className="w-full rounded-md bg-slate-950/40 px-3 py-1.5 text-center">
          <p
            className={`font-mono text-2xl font-bold tabular-nums tracking-wide ${
              variant === "gold" ? "text-pokemon-cream" : "text-pokemon-cream/95"
            }`}
          >
            {entry.score}
          </p>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-muted/90">
            points
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <PlayStyleBadge playStyle={entry.play_style} />
          <span className="rounded-md bg-slate-950/35 px-2 py-0.5 font-mono text-[10px] tabular-nums text-text-muted">
            {formatAccuracy(entry.accuracy_percentage)}
          </span>
        </div>
      </div>
    </>
  );

  if (variant === "gold") {
    return (
      <motion.div
        className={className}
        animate={{
          boxShadow: [
            "0 0 24px rgba(0,255,159,0.35), 0 0 12px rgba(255,203,5,0.25)",
            "0 0 48px rgba(0,255,159,0.55), 0 0 24px rgba(255,203,5,0.45)",
            "0 0 24px rgba(0,255,159,0.35), 0 0 12px rgba(255,203,5,0.25)",
          ],
          borderColor: [
            "rgba(255, 203, 5, 0.5)",
            "rgba(0, 255, 159, 0.9)",
            "rgba(255, 203, 5, 0.5)",
          ],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        {inner}
      </motion.div>
    );
  }

  return <div className={className}>{inner}</div>;
}

export function LeaderboardView({ entries }: LeaderboardViewProps) {
  const top3 = entries.slice(0, 3);
  const roster = entries.slice(3);
  const [first, second, third] = top3;

  return (
    <motion.section
      className="mx-auto max-w-3xl px-4 pb-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label="Leaderboard rankings"
    >
      {entries.length === 0 ? (
        <p className="glass rounded-2xl p-10 text-center text-text-muted">
          No scores yet. Be the first to conquer Sudden Death!
        </p>
      ) : (
        <>
          <section className="mb-12">
            <h2 className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.25em] text-text-muted">
              Podium
            </h2>
            <div className="flex items-end justify-center gap-3 sm:gap-6">
              {second && (
                <div className="order-1 flex flex-1 justify-center">
                  <PodiumCard entry={second} rank={2} variant="silver" />
                </div>
              )}
              {first && (
                <motion.div
                  className="order-2 flex flex-1 justify-center sm:-mt-4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <PodiumCard entry={first} rank={1} variant="gold" />
                </motion.div>
              )}
              {third && (
                <div className="order-3 flex flex-1 justify-center">
                  <PodiumCard entry={third} rank={3} variant="bronze" />
                </div>
              )}
            </div>
          </section>

          {roster.length > 0 && (
            <section className="glass overflow-hidden rounded-2xl border border-white/10">
              <h2 className="border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                Roster · ranks 4–50
              </h2>
              <ol>
                {roster.map((entry, i) => (
                  <li
                    key={String(entry.id)}
                    className={`flex items-center justify-between gap-4 px-4 py-3 ${
                      i % 2 === 0 ? "bg-white/[0.03]" : "bg-transparent"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="font-mono text-sm tabular-nums text-text-muted">
                        #{i + 4}
                      </span>
                      <span
                        className="max-w-[10rem] truncate font-semibold text-text-primary"
                        title={entry.player_name}
                      >
                        {entry.player_name}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 font-mono text-sm tabular-nums">
                      <span className="font-bold text-drug-glow">
                        {entry.score} pts
                      </span>
                      <PlayStyleBadge playStyle={entry.play_style} />
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}
    </motion.section>
  );
}
