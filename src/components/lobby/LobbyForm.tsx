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
  type QuizCategory,
  type TimerOption,
} from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/game";
import { OptionChip } from "@/components/ui/OptionChip";

const PLAY_STYLES: { value: PlayStyle; label: string; desc: string }[] = [
  { value: "swipe", label: "Swipe", desc: "Tinder-style cards (mobile default)" },
  { value: "classic", label: "Classic", desc: "Pharmacy vs Pokéball buttons" },
  { value: "drag-drop", label: "Drag & Drop", desc: "Full-screen lab vs arena zones" },
  {
    value: "multiple-choice",
    label: "Multiple Choice",
    desc: "Answer about drug class or Pokémon type",
  },
];

const QUIZ_CATEGORIES: {
  value: QuizCategory;
  label: string;
  desc: string;
}[] = [
  { value: "both", label: "Mixed", desc: "Medications and Pokémon" },
  { value: "medicine", label: "Medicine", desc: "Therapeutic class questions only" },
  { value: "pokemon", label: "Pokémon", desc: "Elemental type questions only" },
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
  const [quizCategory, setQuizCategory] = useState<QuizCategory>("both");
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
      ...(playStyle === "multiple-choice" ? { quizCategory } : {}),
    };

    sessionStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));

    try {
      const count = config.questionCount;
      const categoryQuery =
        config.playStyle === "multiple-choice" && config.quizCategory
          ? `&quizCategory=${config.quizCategory}`
          : "";
      const res = await fetch(`/api/game/generate?count=${count}${categoryQuery}`);
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full min-h-0 flex-col justify-between"
    >
      <div className="flex flex-col gap-4 sm:gap-5">
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted sm:text-sm">
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

        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted sm:text-sm">
            Game mode
          </h2>
          <motion.div className="grid grid-cols-2 gap-2 sm:gap-3">
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
              className="rounded-xl border border-pokemon-cream/30 bg-pokemon-cream/10 px-3 py-2.5 text-sm"
            >
              🏆 All-time high score:{" "}
              <strong className="text-pokemon-cream">{highScore}</strong> correct
            </motion.p>
          )}
        </section>

        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted sm:text-sm">
            Play style
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {PLAY_STYLES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setPlayStyle(s.value)}
                className={`rounded-xl border p-3 text-left transition sm:p-4 ${
                  playStyle === s.value
                    ? "border-pokemon-cream/50 bg-pokemon-cream/10 ring-1 ring-pokemon-cream/40"
                    : "border-white/10 bg-white/5 hover:bg-white/8"
                }`}
              >
                <span className="text-sm font-semibold">{s.label}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-text-muted sm:text-xs">
                  {s.desc}
                </span>
              </button>
            ))}
          </div>

          {playStyle === "multiple-choice" && (
            <motion.div
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2 border-t border-white/10 pt-3 sm:space-y-3 sm:pt-4"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted sm:text-sm">
                Quiz category
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {QUIZ_CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setQuizCategory(c.value)}
                    className={`rounded-xl border p-2 text-left transition sm:p-3 ${
                      quizCategory === c.value
                        ? "border-drug-glow/50 bg-drug-glow/10 ring-1 ring-drug-glow/30"
                        : "border-white/10 bg-white/5 hover:bg-white/8"
                    }`}
                  >
                    <span className="text-xs font-semibold sm:text-sm">
                      {c.label}
                    </span>
                    <span className="mt-0.5 block text-[10px] leading-snug text-text-muted sm:text-[11px]">
                      {c.desc}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </section>
      </div>

      <motion.button
        type="button"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={startGame}
        className="mt-6 w-full shrink-0 rounded-2xl border border-drug-glow/30 bg-gradient-to-r from-drug-glow/90 via-pokemon-cream to-pokemon-red py-4 text-lg font-bold text-bg-deep shadow-[0_0_30px_rgba(0,255,159,0.25)] disabled:opacity-60"
      >
        {loading ? "Loading deck…" : "Start Game →"}
      </motion.button>
    </motion.div>
  );
}
