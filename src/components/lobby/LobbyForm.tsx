"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  QUESTION_COUNT_OPTIONS,
  TIMER_OPTIONS,
  type GameConfig,
  type GameMode,
  type PlayStyle,
  type QuestionCountOption,
  type QuizCategory,
  type TimerOption,
} from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/game";
import { OptionChip } from "@/components/ui/OptionChip";

const PLAY_STYLES: { value: PlayStyle; label: string; desc: string }[] = [
  { value: "swipe", label: "Swipe", desc: "Tinder-style cards (mobile default)" },
  { value: "classic", label: "Classic", desc: "Pharmacy vs Pokéball buttons" },
  {
    value: "drag-drop",
    label: "Speed Sort",
    desc: "Drag multiple names into Pharmacy or Pokéball zones",
  },
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
  const [questionCount, setQuestionCount] =
    useState<QuestionCountOption>(20);
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

  const launchGame = async (config: GameConfig) => {
    setLoading(true);
    sessionStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));

    try {
      const countParam =
        config.questionCount === "unlimited"
          ? "unlimited"
          : String(config.questionCount);
      const category =
        config.quizCategory ??
        (config.playStyle === "multiple-choice" ? quizCategory : "both");
      const res = await fetch(
        `/api/game/generate?count=${countParam}&quizCategory=${category}`,
      );
      if (!res.ok) throw new Error("Failed to load deck");
      const { deck } = await res.json();
      sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(deck));
      router.push("/game");
    } catch {
      setLoading(false);
      alert("Could not start game. Please try again.");
    }
  };

  const startGame = () => {
    void launchGame({
      questionCount,
      gameMode,
      timer: gameMode === "sudden-death" ? "zen" : timer,
      playStyle,
      ...(playStyle === "multiple-choice" ? { quizCategory } : {}),
    });
  };

  const startTournament = () => {
    void launchGame({
      questionCount: "unlimited",
      gameMode: "sudden-death",
      timer: "zen",
      playStyle: "classic",
      quizCategory: "both",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full min-h-0 flex-col justify-between"
    >
      <div className="flex flex-col gap-3">
        {/* 1. Question count */}
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted sm:text-sm">
            Question count
          </h2>
          <motion.div layout className="flex flex-wrap gap-2">
            {QUESTION_COUNT_OPTIONS.map((n) => (
              <OptionChip
                key={String(n)}
                label={n === "unlimited" ? "Unlimited" : String(n)}
                selected={questionCount === n}
                onClick={() => setQuestionCount(n)}
              />
            ))}
          </motion.div>
          {gameMode === "sudden-death" && (
            <p className="text-xs text-text-muted">
              Sudden Death runs until 3 wrong answers. Question count sets your
              target score for leaderboard eligibility when combined with
              Unlimited.
            </p>
          )}
          {questionCount === "unlimited" && gameMode === "standard" && (
            <p className="text-xs text-text-muted">
              Unlimited runs until the full deck is sorted or time runs out.
            </p>
          )}
        </section>

        {/* 2. Time limit */}
        <section className="space-y-3 rounded-2xl border border-drug-glow/20 bg-drug-glow/[0.04] p-3 ring-1 ring-drug-glow/10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-drug-glow/90 sm:text-sm">
            Time limit
          </h2>
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
            <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-muted">
              Sudden Death locks time to Unlimited / Zen.
            </p>
          )}
        </section>

        {/* 3. Game mode */}
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted sm:text-sm">
            Game mode
          </h2>
          <motion.div className="grid grid-cols-2 gap-2">
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
          {gameMode === "sudden-death" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-pokemon-cream/30 bg-pokemon-cream/10 px-3 py-2 text-sm"
            >
              🏆 All-time high score:{" "}
              <strong className="text-pokemon-cream">{highScore}</strong> correct
            </motion.p>
          )}
        </section>

        {/* 4. Play style */}
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted sm:text-sm">
            Play style
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {PLAY_STYLES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setPlayStyle(s.value)}
                className={`rounded-xl border p-2.5 text-left transition sm:p-3 ${
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
              className="space-y-3 border-t border-white/10 pt-3"
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

        {/* Tournament — official competitive mode */}
        <section className="space-y-3">
          <button
            type="button"
            disabled={loading}
            onClick={startTournament}
            className="tournament-btn group relative w-full overflow-hidden rounded-2xl border-2 border-amber-400/60 bg-gradient-to-br from-violet-950/80 via-bg-deep to-amber-950/40 p-4 text-left shadow-[0_0_24px_rgba(251,191,36,0.2)] transition hover:border-amber-300/80 hover:shadow-[0_0_32px_rgba(167,139,250,0.35)] disabled:opacity-60"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-400/10 via-violet-500/10 to-amber-400/10 opacity-0 transition group-hover:opacity-100"
            />
            <span className="relative flex items-center justify-between gap-3">
              <span>
                <span className="block text-base font-bold tracking-wide text-amber-200">
                  🏆 Tournament
                </span>
                <span className="mt-0.5 block text-xs text-text-muted sm:text-sm">
                  Official leaderboard mode — Sudden Death, mixed deck, full run.
                  Settings above are skipped.
                </span>
              </span>
              <span className="shrink-0 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm font-semibold text-amber-200">
                Play →
              </span>
            </span>
          </button>
        </section>
      </div>

      <motion.div className="mt-4 w-full shrink-0">
        <motion.button
          type="button"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startGame}
          className="relative isolate w-full overflow-hidden rounded-2xl border border-drug-glow/30 bg-bg-deep py-3.5 text-base font-bold text-bg-deep shadow-[0_0_30px_rgba(0,255,159,0.25)] transform-gpu disabled:opacity-60 sm:text-lg"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-drug-glow/90 via-pokemon-cream to-pokemon-red"
          />
          <span className="relative z-10">
            {loading ? "Loading deck…" : "Start Game →"}
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
