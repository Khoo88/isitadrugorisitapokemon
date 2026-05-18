import type { Metadata } from "next";
import Link from "next/link";
import { getLeaderboard } from "@/app/actions/gameActions";
import { GamePremise } from "@/components/lobby/GamePremise";
import { HomeLeaderboardPreview } from "@/components/lobby/HomeLeaderboardPreview";
import { HomePageHeader } from "@/components/lobby/HomePageHeader";
import { LobbyForm } from "@/components/lobby/LobbyForm";
import { SUDDEN_DEATH_LEADERBOARD_MODE } from "@/lib/leaderboard";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "@/lib/site";

const CONSOLE_PANEL =
  "flex h-full flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/40 p-8";

export const metadata: Metadata = {
  title: { absolute: DEFAULT_TITLE },
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const leaderboard = await getLeaderboard(SUDDEN_DEATH_LEADERBOARD_MODE);

  return (
    <main className="game-gradient flex min-h-dvh flex-col">
      <div className="mx-auto w-full max-w-6xl px-4 pt-4">
        <nav
          aria-label="Site navigation"
          className="mb-2 flex justify-end"
        >
          <Link
            href="/leaderboard"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-text-muted transition hover:border-drug-glow/40 hover:text-drug-glow"
          >
            Leaderboard
          </Link>
        </nav>

        <HomePageHeader />
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 pb-8 lg:grid-cols-2 lg:items-stretch">
        <div className={CONSOLE_PANEL}>
          <GamePremise embedded />
          <div className="mt-8 hidden lg:block">
            <HomeLeaderboardPreview entries={leaderboard} embedded />
          </div>
        </div>

        <div className={CONSOLE_PANEL}>
          <LobbyForm />
        </div>
      </div>

      <div className="mx-auto block w-full max-w-6xl px-4 pb-8 lg:hidden">
        <HomeLeaderboardPreview entries={leaderboard} />
      </div>

      <footer className="mx-auto mt-auto w-full max-w-6xl px-4 py-6 text-center text-xs text-text-muted sm:py-8">
        <p>
          &copy; {new Date().getFullYear()} Drug or Pokémon? — Pharmaceutical vs
          Pocket Monster quiz.
        </p>
      </footer>
    </main>
  );
}
