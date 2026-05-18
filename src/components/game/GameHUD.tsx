"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatTime } from "@/lib/game";

interface GameHUDProps {
  progressLabel: string;
  accuracy: number;
  secondsLeft: number | null;
  lives?: number;
  isSuddenDeath?: boolean;
}

export function GameHUD({
  progressLabel,
  accuracy,
  secondsLeft,
  lives,
  isSuddenDeath,
}: GameHUDProps) {
  return (
    <header className="glass sticky top-0 z-40 border-b border-white/10">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            aria-label="Exit game and return to lobby"
            className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-text-muted transition hover:border-drug-glow/40 hover:bg-drug-glow/10 hover:text-drug-glow sm:px-3 sm:text-sm"
          >
            Exit Game
          </Link>
          <motion.span
            key={progressLabel}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-base font-bold tabular-nums sm:text-lg"
          >
            {progressLabel}
          </motion.span>
        </div>

        <motion.div
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1"
          animate={{
            borderColor:
              accuracy >= 80
                ? "rgba(0, 255, 159, 0.4)"
                : accuracy >= 50
                  ? "rgba(255, 203, 5, 0.4)"
                  : "rgba(238, 21, 21, 0.4)",
          }}
        >
          <span className="text-xs text-text-muted">Accuracy</span>
          <span
            className={`font-bold tabular-nums ${
              accuracy >= 80
                ? "text-drug-glow"
                : accuracy >= 50
                  ? "text-pokemon-cream"
                  : "text-pokemon-red"
            }`}
          >
            {accuracy}%
          </span>
        </motion.div>

        {isSuddenDeath && lives !== undefined && (
          <motion.div className="flex gap-1" aria-label={`${lives} lives`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.span
                key={i}
                animate={{
                  scale: i < lives ? 1 : 0.5,
                  opacity: i < lives ? 1 : 0.25,
                }}
                className="h-3 w-3 rounded-full border border-pokemon-red/50 bg-pokemon-red shadow-[0_0_8px_rgba(238,21,21,0.5)]"
              />
            ))}
          </motion.div>
        )}

        {secondsLeft !== null && !isSuddenDeath && (
          <motion.span
            key={secondsLeft}
            animate={{ scale: secondsLeft <= 30 ? [1, 1.08, 1] : 1 }}
            transition={{ repeat: secondsLeft <= 30 ? Infinity : 0, duration: 0.8 }}
            className={`font-mono text-base font-bold tabular-nums sm:text-lg ${
              secondsLeft <= 30 ? "text-pokemon-red" : "text-drug-glow"
            }`}
          >
            {formatTime(secondsLeft)}
          </motion.span>
        )}
      </motion.div>
    </header>
  );
}
