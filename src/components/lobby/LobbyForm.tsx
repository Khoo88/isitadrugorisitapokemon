"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  QUESTION_COUNTS,
  TIMER_OPTIONS,
  type GameConfig,
  type GameMode,
  type PlayStyle,
  type QuestionCount,
  type TimerOption,
} from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/game";
import { OptionChip } from "@/components/ui/OptionChip";
import { GamePremise } from "@/components/lobby/GamePremise";
import { MedicalCross, PokeballIcon } from "@/components/ui/ThematicIcons";

const PLAY_STYLES: { value: PlayStyle; label: string; desc: string }[] = [
  { value: "swipe", label: "Swipe", desc: "Tinder-style cards (mobile default)" },
  { value: "classic", label: "Classic", desc: "Pharmacy vs Pokéball buttons" },
  { value: "drag-drop", label: "Drag & Drop", desc: "Full-screen lab vs arena zones" },
  { value: "multiple-choice", label: "Multiple Choice", desc: "Pick the real definition" },
];

function defaultPlayStyle(): PlayStyle {
  if (typeof window === "undefined") return "classic";
  return window.matchMedia("(max-width: 768px)").matches ? "swipe" : "classic";
}

export function LobbyForm() {
  const router = useRouter();
  const [questionCount, setQuestionCount] = useState<QuestionCount>(20);
  const [gameMode, setGameMode] = useState<GameMode>("standard");
  const [timer, setTimer] = useState<TimerOption>(10);
  const [playStyle, setPlayStyle] = useState<PlayStyle>("classic");
  const [highScore, setHighScore] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPlayStyle(defaultPlayStyle());
    const stored = localStorage.getItem(STORAGE_KEYS.highScore);
    if (stored) setHighScore(Number(stored) || 0);
  }, []);

  const startGame = async () => {
    setLoading(true);
    const config: GameConfig = {
      questionCount: gameMode === "sudden-death" ? 300 : questionCount,
      gameMode,
      timer: gameMode === "sudden-death" ? "zen" : timer,
      playStyle,
    };

    sessionStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));

    try {
      const count = config.questionCount;
      const res = await fetch(`/api/game/generate?count=${count}`);
      if (!res.ok) throw new Error("Failed to load deck");
      const { deck } = await res.json();
      sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(deck));
      router.push("/game");
    } catch {
      setLoading(false);
      alert("Could not start game. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-xl space-y-8 px-4 py-10"
    >
      <header className="text-center">
        <motion.div
          className="mb-4 flex items-center justify-center gap-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <span
            className="theme-drug-panel flex h-12 w-12 items-center justify-center rounded-xl text-drug-glow"
            aria-hidden="true"
          >
            <MedicalCross className="h-6 w-6" />
          </span>
          <motion.h1
            className="bg-gradient-to-r from-drug-glow via-pokemon-cream to-pokemon-red bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl"
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Drug or Pokémon?
          </motion.h1>
          <span
            className="theme-pokemon-panel flex h-12 w-12 items-center justify-center rounded-xl"
            aria-hidden="true"
          >
            <PokeballIcon className="h-7 w-7" />
          </span>
        </motion.div>
        <p className="text-text-muted">
          Clinical lab vs battle arena — can you sort the names?
        </p>
      </header>

      <GamePremise />

      <section className="glass space-y-4 rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Question count
        </h2>
        <motion.div layout className="flex flex-wrap gap-2">
          {QUESTION_COUNTS.map((n) => (
            <OptionChip
              key={n}
              label={String(n)}
              selected={questionCount === n}
              onClick={() => setQuestionCount(n)}
            />
          ))}
        </motion.div>
        {gameMode === "sudden-death" && (
          <p className="text-xs text-text-muted">
            Sudden Death uses an infinite deck until 3 wrong answers.
          </p>
        )}
      </section>

      <section className="glass space-y-4 rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Game mode
        </h2>
        <motion.div className="grid grid-cols-2 gap-3">
          <OptionChip
            label="Standard"
            selected={gameMode === "standard"}
            onClick={() => setGameMode("standard")}
          />
          <OptionChip
            label="Sudden Death"
            selected={gameMode === "sudden-death"}
            onClick={() => setGameMode("sudden-death")}
            color="pokemon"
          />
        </motion.div>
        {gameMode === "standard" ? (
          <motion.div layout className="flex flex-wrap gap-2">
            {TIMER_OPTIONS.map((t) => (
              <OptionChip
                key={String(t.value)}
                label={t.label}
                selected={timer === t.value}
                onClick={() => setTimer(t.value)}
                color="drug"
              />
            ))}
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-pokemon-cream/30 bg-pokemon-cream/10 px-4 py-3 text-sm"
          >
            🏆 All-time high score:{" "}
            <strong className="text-pokemon-cream">{highScore}</strong> correct
          </motion.p>
        )}
      </section>

      <section className="glass space-y-4 rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Play style
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {PLAY_STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setPlayStyle(s.value)}
              className={`rounded-xl border p-4 text-left transition ${
                playStyle === s.value
                  ? "border-pokemon-cream/50 bg-pokemon-cream/10 ring-1 ring-pokemon-cream/40"
                  : "border-white/10 bg-white/5 hover:bg-white/8"
              }`}
            >
              <span className="font-semibold">{s.label}</span>
              <span className="mt-1 block text-xs text-text-muted">{s.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <motion.button
        type="button"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={startGame}
        className="w-full rounded-2xl border border-drug-glow/30 bg-gradient-to-r from-drug-glow/90 via-pokemon-cream to-pokemon-red py-4 text-lg font-bold text-bg-deep shadow-[0_0_30px_rgba(0,255,159,0.25)] disabled:opacity-60"
      >
        {loading ? "Loading deck…" : "Start Game →"}
      </motion.button>
    </motion.div>
  );
}
