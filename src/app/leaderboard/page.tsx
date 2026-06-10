import type { Metadata } from "next";
import Link from "next/link";
import { getLeaderboard } from "@/app/actions/gameActions";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import { SuddenDeathModeBadge } from "@/components/leaderboard/SuddenDeathModeBadge";
import { SUDDEN_DEATH_LEADERBOARD_MODE } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Sudden Death Leaderboard",
  description:
    "Top 50 Sudden Death high scores — see who survived the ultimate Drug or Pokémon? challenge.",
  alternates: { canonical: "/leaderboard" },
};

export default async function LeaderboardPage() {
  const entries = await getLeaderboard(SUDDEN_DEATH_LEADERBOARD_MODE);

  return (
    <main className="game-gradient min-h-dvh pb-16">
      <header className="mx-auto max-w-3xl px-4 pt-6">
        <nav aria-label="Site navigation" className="flex justify-center">
          <Link
            href="/"
            className="rounded-xl border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-text-muted transition hover:border-drug-glow/40 hover:bg-drug-glow/10 hover:text-drug-glow"
          >
            ← Return to Home
          </Link>
        </nav>
        <div className="mb-10 mt-8 text-center">
          <h1 className="flex flex-wrap items-center justify-center bg-gradient-to-r from-drug-glow via-pokemon-cream to-pokemon-red bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
            <span>Top Global Players</span>
            <SuddenDeathModeBadge className="ml-2 bg-red-950/60 text-red-400" />
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Top 50 survivors · clinical data readout
          </p>
        </div>
      </header>

      <LeaderboardView entries={entries} />
    </main>
  );
}
