"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { submitScore } from "@/app/actions/gameActions";
import { createGuestId, usePlayerIdentity } from "@/hooks/usePlayerIdentity";
import { SUDDEN_DEATH_LEADERBOARD_MODE } from "@/lib/leaderboard";

const MAX_NAME_LENGTH = 15;

interface SuddenDeathSubmitProps {
  score: number;
  accuracy: number;
}

function sanitizePlayerName(value: string): string {
  return value
    .replace(/[^\p{L}\p{N}\s'-]/gu, "")
    .slice(0, MAX_NAME_LENGTH);
}

export function SuddenDeathSubmit({ score, accuracy }: SuddenDeathSubmitProps) {
  const router = useRouter();
  const { guestId, ready } = usePlayerIdentity();
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const name = playerName.trim().slice(0, MAX_NAME_LENGTH);
    if (name.length < 1) {
      setError(`Enter a name (up to ${MAX_NAME_LENGTH} characters)`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitScore({
        playerName: name,
        score,
        accuracy,
        gameMode: SUDDEN_DEATH_LEADERBOARD_MODE,
        guestId: guestId ?? createGuestId(),
      });
      router.refresh();
      router.push("/leaderboard");
    } catch (e) {
      console.error("[SuddenDeathSubmit] submit failed:", e);
      setError(e instanceof Error ? e.message : "Submit failed");
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass mt-8 rounded-2xl border border-pokemon-cream/30 p-6"
    >
      <h2 className="pixel-text text-center text-sm text-pokemon-cream">
        NEW HIGH SCORE — ENTER YOUR NAME
      </h2>
      <p className="mt-2 text-center text-sm text-text-muted">
        Score <span className="font-mono text-drug-glow">{score}</span> ·{" "}
        <span className="font-mono">{accuracy}%</span> accuracy
      </p>

      <motion.div className="mt-6 flex w-full flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center">
        <label className="sr-only" htmlFor="player-name">
          Player name
        </label>
        <input
          id="player-name"
          type="text"
          maxLength={MAX_NAME_LENGTH}
          value={playerName}
          disabled={loading || !ready}
          onChange={(e) => {
            setPlayerName(sanitizePlayerName(e.target.value));
            setError(null);
          }}
          placeholder="Your name"
          autoComplete="nickname"
          className="w-full min-w-0 rounded-xl border border-white/10 bg-bg-card/60 px-4 py-4 text-center text-xl font-bold text-white outline-none placeholder:text-text-muted/40 focus:border-drug-glow/50 focus:ring-1 focus:ring-drug-glow/30 disabled:opacity-50 sm:max-w-sm"
        />
        <button
          type="button"
          disabled={loading || !ready || playerName.trim().length < 1}
          onClick={handleSubmit}
          aria-busy={loading}
          className="rounded-xl border border-drug-glow/50 bg-drug-glow/20 px-8 py-4 font-semibold text-drug-glow transition hover:bg-drug-glow/30 disabled:opacity-50"
        >
          {!ready ? "Preparing…" : loading ? "Submitting…" : "Submit Score"}
        </button>
      </motion.div>

      {error && (
        <p className="mt-3 text-center text-sm text-pokemon-red">{error}</p>
      )}
    </motion.section>
  );
}
