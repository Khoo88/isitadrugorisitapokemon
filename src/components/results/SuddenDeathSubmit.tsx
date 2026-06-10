"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { submitScore } from "@/app/actions/gameActions";
import { createGuestId, usePlayerIdentity } from "@/hooks/usePlayerIdentity";
import { SUDDEN_DEATH_LEADERBOARD_MODE } from "@/lib/leaderboard";

const MAX_NAME_LENGTH = 15;

interface SuddenDeathSubmitProps {
  score: number;
  accuracy: number;
  playStyle?: string;
  /** Leaderboard `game_mode` column value */
  gameMode?: string;
  heading?: string;
}

function sanitizePlayerName(value: string): string {
  return value
    .replace(/[^\p{L}\p{N}\s'-]/gu, "")
    .slice(0, MAX_NAME_LENGTH);
}

export function SuddenDeathSubmit({
  score,
  accuracy,
  playStyle,
  gameMode = SUDDEN_DEATH_LEADERBOARD_MODE,
  heading = "NEW HIGH SCORE — ENTER YOUR NAME",
}: SuddenDeathSubmitProps) {
  const router = useRouter();
  const { deviceId, playerName: cachedName, ready, setPlayerName } =
    usePlayerIdentity();
  const [playerName, setPlayerNameInput] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const autoSubmitted = useRef(false);

  const submitWithName = useCallback(
    async (name: string) => {
      const trimmed = name.trim().slice(0, MAX_NAME_LENGTH);
      if (trimmed.length < 1) {
        setError(`Enter a name (up to ${MAX_NAME_LENGTH} characters)`);
        return;
      }

      setLoading(true);
      setError(null);
      setStatusMessage(null);

      try {
        const result = await submitScore({
          playerName: trimmed,
          score,
          accuracy,
          gameMode,
          guestId: deviceId ?? createGuestId(),
          deviceId: deviceId ?? undefined,
          playStyle,
        });

        setPlayerName(trimmed);

        if (result.action === "protected") {
          setStatusMessage("Personal best protected — your top score stays on the board.");
        }

        router.refresh();
        router.push("/leaderboard");
      } catch (e) {
        console.error("[SuddenDeathSubmit] submit failed:", e);
        setError(e instanceof Error ? e.message : "Submit failed");
        setLoading(false);
        autoSubmitted.current = false;
      }
    },
    [
      accuracy,
      deviceId,
      gameMode,
      playStyle,
      router,
      score,
      setPlayerName,
    ],
  );

  useEffect(() => {
    if (!ready || editing || autoSubmitted.current) return;
    if (!cachedName) return;

    autoSubmitted.current = true;
    void submitWithName(cachedName);
  }, [cachedName, editing, ready, submitWithName]);

  const handleSubmit = () => {
    void submitWithName(playerName);
  };

  const usingCachedName = Boolean(cachedName) && !editing;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass mt-8 rounded-2xl border border-pokemon-cream/30 p-6"
    >
      <h2 className="pixel-text text-center text-sm text-pokemon-cream">
        {usingCachedName ? "SUBMITTING TO LEADERBOARD" : heading}
      </h2>
      <p className="mt-2 text-center text-sm text-text-muted">
        Score <span className="font-mono text-drug-glow">{score}</span> ·{" "}
        <span className="font-mono">{accuracy}%</span> accuracy
      </p>

      {usingCachedName ? (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-bg-card/60 px-5 py-4">
            <span className="text-xl font-bold text-white">{cachedName}</span>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                autoSubmitted.current = true;
                setEditing(true);
                setPlayerNameInput(cachedName ?? "");
                setLoading(false);
              }}
              className="rounded-lg p-1.5 text-text-muted transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              aria-label="Edit player name"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
          <p className="text-center text-xs text-text-muted">
            {loading
              ? "Recording your score…"
              : "Using your saved name. Tap the pencil to change it."}
          </p>
        </div>
      ) : (
        <div className="mt-6 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="flex w-full min-w-0 flex-col sm:max-w-sm">
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
                setPlayerNameInput(sanitizePlayerName(e.target.value));
                setError(null);
              }}
              placeholder="Your name"
              autoComplete="nickname"
              className="w-full min-w-0 rounded-xl border border-white/10 bg-bg-card/60 px-4 py-4 text-center text-xl font-bold text-white outline-none placeholder:text-text-muted/40 focus:border-drug-glow/50 focus:ring-1 focus:ring-drug-glow/30 disabled:opacity-50"
            />
            <p className="mt-2 text-center text-xs text-text-muted">
              Submitting your name will permanently record your score on the global
              leaderboard.
            </p>
          </div>
          <button
            type="button"
            disabled={loading || !ready || playerName.trim().length < 1}
            onClick={handleSubmit}
            aria-busy={loading}
            className="w-full shrink-0 rounded-xl border border-drug-glow/50 bg-drug-glow/20 px-8 py-4 font-semibold text-drug-glow transition hover:bg-drug-glow/30 disabled:opacity-50 sm:w-auto"
          >
            {!ready ? "Preparing…" : loading ? "Submitting…" : "Submit Score"}
          </button>
        </div>
      )}

      {statusMessage && (
        <p className="mt-3 text-center text-sm text-pokemon-cream">{statusMessage}</p>
      )}

      {error && (
        <p className="mt-3 text-center text-sm text-pokemon-red">{error}</p>
      )}
    </motion.section>
  );
}
