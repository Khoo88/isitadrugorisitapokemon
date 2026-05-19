"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { AdBanner } from "@/components/ui/AdBanner";
import { BrandLogo } from "@/components/ui/BrandLogo";
import type { GameResults } from "@/lib/types";
import { formatTime, categoryLabel } from "@/lib/game";
import { buildShareText } from "@/lib/share-results";
import { SuddenDeathSubmit } from "@/components/results/SuddenDeathSubmit";

interface ResultsViewProps {
  results: GameResults;
}

export function ResultsView({ results }: ResultsViewProps) {
  const { answers, startedAt, endedAt, suddenDeathScore, config } = results;
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const isSuddenDeath = config.gameMode === "sudden-death";
  const totalMs = endedAt - startedAt;
  const totalSec = Math.floor(totalMs / 1000);
  const correct = answers.filter((a) => a.correct).length;
  const pct =
    answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0;
  const wrong = answers.filter((a) => !a.correct);

  const handleShare = useCallback(async () => {
    const text = buildShareText(results);
    try {
      if (navigator.share) {
        await navigator.share({ text });
        setShareStatus("copied");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setShareStatus("copied");
      } else {
        throw new Error("Share not supported");
      }
      setTimeout(() => setShareStatus("idle"), 2500);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(text);
        setShareStatus("copied");
        setTimeout(() => setShareStatus("idle"), 2500);
      } catch {
        setShareStatus("error");
        setTimeout(() => setShareStatus("idle"), 2500);
      }
    }
  }, [results]);

  return (
    <div className="pb-24">
      <AdBanner
        slot="8169680388"
        format="horizontal"
        className="mx-auto mb-6 mt-4 max-w-5xl px-4"
      />

      <div className="mx-auto max-w-2xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex justify-center"
        >
          <Link
            href="/"
            className="rounded-xl border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-text-muted transition hover:border-drug-glow/40 hover:bg-drug-glow/10 hover:text-drug-glow"
          >
            ← Return to Home
          </Link>
        </motion.div>

        <motion.header
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="mb-4 flex justify-center">
            <BrandLogo size="compact" />
          </div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            {pct >= 80
              ? "🔥 Legendary!"
              : pct >= 50
                ? "Nice run!"
                : "Keep practicing!"}
          </h1>
        </motion.header>

        <div className="mt-8 flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass flex flex-col items-center rounded-3xl border border-drug-glow/20 px-10 py-8 shadow-[0_0_40px_rgba(0,255,159,0.1)]"
          >
            <span className="text-6xl font-black tabular-nums text-drug-glow">
              {pct}%
            </span>
            <span className="mt-1 text-text-muted">accuracy</span>
            <p className="mt-4 text-sm text-text-muted">
              {correct}/{answers.length} correct · {formatTime(totalSec)}
            </p>
            {suddenDeathScore !== undefined && (
              <p className="mt-2 font-semibold text-pokemon-red">
                Sudden Death score: {suddenDeathScore}
              </p>
            )}
          </motion.div>

          <AdBanner
            slot="RESULTS_SIDEBAR_RECTANGLE_SLOT_ID"
            format="rectangle"
            responsive="false"
            className="hidden max-w-sm shrink-0 md:block"
          />
        </div>

        {isSuddenDeath && suddenDeathScore !== undefined && (
          <SuddenDeathSubmit score={suddenDeathScore} accuracy={pct} />
        )}

        {wrong.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass mt-10 rounded-2xl p-6"
          >
            <h2 className="mb-4 text-lg font-bold">Review misses</h2>
            <ul className="space-y-3">
              {wrong.map((w) => (
                <li
                  key={`${w.item.id}-${w.timeMs}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-4 py-3"
                >
                  <div>
                    <span className="font-semibold">{w.item.name}</span>
                    <span className="ml-2 text-sm text-text-muted">
                      ({categoryLabel(w.item.category)})
                    </span>
                    <p
                      className={`text-xs ${
                        w.item.category === "drug"
                          ? "text-drug-glow"
                          : "text-pokemon-red"
                      }`}
                    >
                      You picked {categoryLabel(w.userAnswer)}
                    </p>
                  </div>
                  <Link
                    href={`/learn/${w.item.slug}`}
                    className="rounded-lg border border-pokemon-red/30 bg-pokemon-red/20 px-3 py-1.5 text-sm font-medium text-pokemon-white hover:bg-pokemon-red/35"
                  >
                    Learn more →
                  </Link>
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <button
            type="button"
            onClick={() => void handleShare()}
            className="rounded-2xl border border-pokemon-cream/40 bg-pokemon-cream/15 px-8 py-3.5 text-base font-semibold text-pokemon-cream transition hover:bg-pokemon-cream/25"
          >
            {shareStatus === "copied"
              ? "Copied!"
              : shareStatus === "error"
                ? "Copy failed"
                : "Share results"}
          </button>
          <Link
            href="/"
            className="rounded-2xl border border-white/20 bg-white/5 px-8 py-3.5 text-base font-semibold text-text-primary transition hover:bg-white/10"
          >
            Return to Home
          </Link>
          <Link
            href="/"
            className="rounded-2xl bg-gradient-to-r from-drug-glow to-pokemon-red px-10 py-4 text-lg font-bold text-bg-deep shadow-lg"
          >
            Play Again
          </Link>
        </motion.div>
      </div>

      <div className="mx-auto mt-12 w-full max-w-5xl border-t border-slate-800/20 px-4 pt-8">
        <h4 className="mb-4 select-none text-center font-mono text-xs uppercase tracking-widest text-text-muted/60">
          Recommended
        </h4>
        <AdBanner
          slot="6665027021"
          format="autorelaxed"
          className="overflow-hidden rounded-2xl"
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[320px] md:hidden">
        <AdBanner
          slot="RESULTS_MOBILE_BOTTOM_SLOT_ID"
          format="horizontal"
          className="px-2 pb-2"
        />
      </div>
    </div>
  );
}
