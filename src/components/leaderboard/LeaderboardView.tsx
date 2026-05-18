"use client";

import { motion } from "framer-motion";
import type { LeaderboardEntry } from "@/app/actions/gameActions";
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
  const heights = { 1: "min-h-[176px]", 2: "min-h-[144px]", 3: "min-h-[128px]" };
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" } as const;

  const panelClass =
    variant === "gold" ? "theme-drug-panel" : "theme-pokemon-panel";

  const borderClass =
    variant === "gold"
      ? "border-pokemon-cream/80"
      : variant === "silver"
        ? "border-slate-300/60"
        : "border-amber-700/70";

  const content = (
    <>
      <span className="absolute -top-3 text-2xl">{medals[rank]}</span>
      {variant !== "gold" && (
        <PokeballIcon className="mb-2 h-7 w-7 opacity-90" />
      )}
      <p
        className={`pixel-text line-clamp-2 text-center text-sm font-bold leading-tight ${
          variant === "gold" ? "text-drug-glow" : "text-pokemon-white"
        }`}
        title={entry.player_name}
      >
        {entry.player_name}
      </p>
      <p
        className={`mt-2 font-mono text-2xl font-bold tabular-nums ${
          variant === "gold" ? "text-pokemon-cream" : "text-pokemon-cream/90"
        }`}
      >
        {entry.score}
      </p>
      <p className="font-mono text-xs tabular-nums text-text-muted">
        {formatAccuracy(entry.accuracy_percentage)}
      </p>
    </>
  );

  const className = `relative flex w-full max-w-[200px] flex-col items-center justify-end rounded-2xl border-2 px-4 pb-4 pt-6 ${heights[rank]} ${panelClass} ${borderClass}`;

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
        {content}
      </motion.div>
    );
  }

  return <div className={className}>{content}</div>
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
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm tabular-nums text-text-muted">
                          #{i + 4}
                        </span>
                        <span className="max-w-[12rem] truncate font-medium" title={entry.player_name}>
                          {entry.player_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 font-mono text-sm tabular-nums">
                        <span className="text-drug-glow">{entry.score} pts</span>
                        <span className="text-text-muted">
                          {formatAccuracy(entry.accuracy_percentage)}
                        </span>
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
