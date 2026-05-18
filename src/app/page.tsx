import type { Metadata } from "next";
import Link from "next/link";
import { getLeaderboard } from "@/app/actions/gameActions";
import { HomeLeaderboardPreview } from "@/components/lobby/HomeLeaderboardPreview";
import { LobbyForm } from "@/components/lobby/LobbyForm";
import { SUDDEN_DEATH_LEADERBOARD_MODE } from "@/lib/leaderboard";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: DEFAULT_TITLE },
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const leaderboard = await getLeaderboard(SUDDEN_DEATH_LEADERBOARD_MODE);

  return (
    <main className="game-gradient flex min-h-dvh flex-col">
      <header className="mx-auto w-full max-w-xl px-4 pt-4">
        <nav
          aria-label="Site navigation"
          className="flex justify-end"
        >
          <Link
            href="/leaderboard"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-text-muted transition hover:border-drug-glow/40 hover:text-drug-glow"
          >
            Leaderboard
          </Link>
        </nav>
      </header>

      <LobbyForm />

      <HomeLeaderboardPreview entries={leaderboard} />

      <footer className="mx-auto mt-auto w-full max-w-xl px-4 py-8 text-center text-xs text-text-muted">
        <p>
          &copy; {new Date().getFullYear()} Drug or Pokémon? — Pharmaceutical vs
          Pocket Monster quiz.
        </p>
      </footer>
    </main>
  );
}
