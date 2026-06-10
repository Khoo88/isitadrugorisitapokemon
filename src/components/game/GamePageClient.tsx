"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { GameConfig, GameItem, GameResults } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/game";
import { useGameSession } from "@/hooks/useGameSession";
import { GameHUD } from "@/components/game/GameHUD";
import { NameCard } from "@/components/game/NameCard";
import { ClassicMode } from "@/components/game/ClassicMode";
import { SwipeMode } from "@/components/game/SwipeMode";
import { DragDropMode } from "@/components/game/DragDropMode";
import { MultipleChoiceMode } from "@/components/game/MultipleChoiceMode";
import { FeedbackOverlay } from "@/components/game/FeedbackOverlay";

export function GamePageClient() {
  const router = useRouter();
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [deck, setDeck] = useState<GameItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cfg = sessionStorage.getItem(STORAGE_KEYS.config);
    const session = sessionStorage.getItem(STORAGE_KEYS.session);
    if (!cfg || !session) {
      router.replace("/");
      return;
    }
    setConfig(JSON.parse(cfg) as GameConfig);
    setDeck(JSON.parse(session) as GameItem[]);
    setReady(true);
  }, [router]);

  const onComplete = useCallback(
    (results: GameResults) => {
      if (results.suddenDeathScore !== undefined) {
        const prev = Number(localStorage.getItem(STORAGE_KEYS.highScore) || 0);
        if (results.suddenDeathScore > prev) {
          localStorage.setItem(
            STORAGE_KEYS.highScore,
            String(results.suddenDeathScore),
          );
        }
      }
      router.push("/results");
    },
    [router],
  );

  if (!ready || !config) {
    return (
      <section
        className="flex flex-1 items-center justify-center py-24"
        aria-busy="true"
        aria-label="Loading game session"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-12 w-12 rounded-full border-4 border-drug-glow border-t-transparent"
          role="status"
          aria-label="Loading"
        />
      </section>
    );
  }

  return <GameShell config={config} deck={deck} onComplete={onComplete} />;
}

function GameShell({
  config,
  deck,
  onComplete,
}: {
  config: GameConfig;
  deck: GameItem[];
  onComplete: (r: GameResults) => void;
}) {
  const session = useGameSession({ config, deck, onComplete });
  const {
    current,
    feedback,
    feedbackMeta,
    shake,
    accuracy,
    progressLabel,
    secondsLeft,
    lives,
    isSuddenDeath,
    submitAnswer,
    submitSpeedSort,
    speedSortBoard = [],
    pool,
    soundMuted,
    toggleSound,
  } = session;

  const disabled = feedback !== null;
  const isDragDrop = config.playStyle === "drag-drop";
  const board = speedSortBoard ?? [];

  if (!isDragDrop && !current) return null;
  if (isDragDrop && board.length === 0 && !isSuddenDeath) return null;

  const showNameCard =
    config.playStyle === "classic" || config.playStyle === "multiple-choice";

  return (
    <>
      <GameHUD
        progressLabel={progressLabel}
        accuracy={accuracy}
        secondsLeft={isSuddenDeath ? null : secondsLeft}
        lives={lives}
        isSuddenDeath={isSuddenDeath}
        soundMuted={soundMuted}
        onToggleSound={toggleSound}
      />

      <FeedbackOverlay feedback={feedback} meta={feedbackMeta} />

      {!isDragDrop && (
        <section
          className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 py-6"
          aria-label="Game play area"
        >
          <AnimatePresence mode="wait">
            {showNameCard && (
              <NameCard
                name={current.name}
                feedback={feedback}
                shake={shake}
                mode={
                  config.playStyle === "multiple-choice" ? "quiz" : "category"
                }
              />
            )}
          </AnimatePresence>

          {config.playStyle === "swipe" && (
            <SwipeMode
              item={current}
              onAnswer={submitAnswer}
              feedback={feedback}
            />
          )}
          {config.playStyle === "classic" && (
            <ClassicMode onAnswer={submitAnswer} disabled={disabled} />
          )}
          {config.playStyle === "multiple-choice" && (
            <MultipleChoiceMode
              item={current}
              pool={pool}
              disabled={disabled}
              onSelect={(correct) =>
                submitAnswer(
                  correct
                    ? current.category
                    : current.category === "drug"
                      ? "pokemon"
                      : "drug",
                )
              }
            />
          )}
        </section>
      )}

      {isDragDrop && board.length > 0 && (
        <DragDropMode
          items={board}
          onSort={submitSpeedSort}
          shake={shake}
        />
      )}
    </>
  );
}
