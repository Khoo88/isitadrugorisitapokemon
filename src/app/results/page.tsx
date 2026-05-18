import type { Metadata } from "next";
import { ResultsPageClient } from "@/components/results/ResultsPageClient";

export const metadata: Metadata = {
  title: "Results",
  robots: { index: false, follow: false },
};

export default function ResultsPage() {
  return (
    <main className="game-gradient min-h-dvh">
      <ResultsPageClient />
    </main>
  );
}
