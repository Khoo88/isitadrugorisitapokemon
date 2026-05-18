"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { GameResults } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/game";
import { ResultsView } from "@/components/results/ResultsView";

export function ResultsPageClient() {
  const router = useRouter();
  const [results, setResults] = useState<GameResults | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEYS.results);
    if (!raw) {
      router.replace("/");
      return;
    }
    setResults(JSON.parse(raw) as GameResults);
  }, [router]);

  if (!results) {
    return (
      <section
        className="flex flex-1 items-center justify-center py-24"
        aria-busy="true"
        aria-label="Loading results"
      >
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-accent-gold border-t-transparent"
          role="status"
          aria-label="Loading"
        />
      </section>
    );
  }

  return <ResultsView results={results} />;
}
