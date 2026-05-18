import type { Metadata } from "next";
import { GamePageClient } from "@/components/game/GamePageClient";

export const metadata: Metadata = {
  title: "Play",
  robots: { index: false, follow: false },
};

export default function GamePage() {
  return (
    <main className="game-gradient flex min-h-dvh flex-col pb-8">
      <h1 className="sr-only">Drug or Pokémon? — Active Game</h1>
      <GamePageClient />
    </main>
  );
}
