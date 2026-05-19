"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AnswerRecord,
  Category,
  GameConfig,
  GameItem,
  GameResults,
} from "@/lib/types";
import { shuffle, STORAGE_KEYS, timerSeconds } from "@/lib/game";
import { useSound } from "@/hooks/useSound";

interface UseGameSessionOptions {
  config: GameConfig;
  deck: GameItem[];
  onComplete: (results: GameResults) => void;
}

export function useGameSession({
  config,
  deck,
  onComplete,
}: UseGameSessionOptions) {
  const baseDeckRef = useRef(deck);
  const activeDeckRef = useRef<GameItem[]>(deck);
  const [deckVersion, setDeckVersion] = useState(0);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [feedbackMeta, setFeedbackMeta] = useState<{
    correct: boolean;
    itemCategory: Category;
  } | null>(null);
  const [shake, setShake] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const questionStarted = useRef(Date.now());
  const answering = useRef(false);
  const { play: playSound, muted, toggleMute } = useSound();

  useEffect(() => {
    baseDeckRef.current = deck;
    activeDeckRef.current = deck;
    setDeckVersion((v) => v + 1);
    setIndex(0);
    setAnswers([]);
    setLives(3);
  }, [deck]);

  const activeDeck = activeDeckRef.current;
  const isSuddenDeath = config.gameMode === "sudden-death";
  const current = activeDeck[index];

  const timerLimit = timerSeconds(config.timer);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(timerLimit);

  useEffect(() => {
    if (timerLimit === null || isSuddenDeath) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s === null || s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerLimit, isSuddenDeath]);

  const extendDeckForSuddenDeath = useCallback((targetIndex: number) => {
    if (targetIndex < activeDeckRef.current.length) {
      return activeDeckRef.current;
    }
    const extension = shuffle(baseDeckRef.current);
    activeDeckRef.current = [...activeDeckRef.current, ...extension];
    setDeckVersion((v) => v + 1);
    return activeDeckRef.current;
  }, []);

  const finish = useCallback(
    (finalAnswers: AnswerRecord[]) => {
      const results: GameResults = {
        config,
        answers: finalAnswers,
        startedAt,
        endedAt: Date.now(),
        suddenDeathScore: isSuddenDeath
          ? finalAnswers.filter((a) => a.correct).length
          : undefined,
      };
      sessionStorage.setItem(STORAGE_KEYS.results, JSON.stringify(results));
      void playSound("complete");
      onComplete(results);
    },
    [config, startedAt, isSuddenDeath, onComplete, playSound],
  );

  useEffect(() => {
    if (secondsLeft === 0 && !isSuddenDeath) {
      finish(answers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const correctCount = answers.filter((a) => a.correct).length;
  const accuracy =
    answers.length > 0
      ? Math.round((correctCount / answers.length) * 100)
      : 100;

  const progressLabel = isSuddenDeath
    ? `Score: ${correctCount}`
    : `${Math.min(index + 1, activeDeck.length)}/${activeDeck.length}`;

  const advance = useCallback(
    (record: AnswerRecord) => {
      const nextAnswers = [...answers, record];
      setAnswers(nextAnswers);

      if (isSuddenDeath) {
        if (!record.correct) {
          const newLives = lives - 1;
          setLives(newLives);
          if (newLives <= 0) {
            setTimeout(() => finish(nextAnswers), 600);
            return;
          }
        }

        const nextIndex = index + 1;
        extendDeckForSuddenDeath(nextIndex);
        setIndex(nextIndex);
        questionStarted.current = Date.now();
        return;
      }

      const nextIndex = index + 1;
      if (nextIndex >= activeDeckRef.current.length) {
        setTimeout(() => finish(nextAnswers), 400);
        return;
      }
      setIndex(nextIndex);
      questionStarted.current = Date.now();
    },
    [answers, extendDeckForSuddenDeath, finish, index, isSuddenDeath, lives],
  );

  const submitAnswer = useCallback(
    (choice: Category) => {
      if (!current || answering.current) return;
      if (!isSuddenDeath && index >= activeDeckRef.current.length) return;

      answering.current = true;
      const correct = choice === current.category;
      const timeMs = Date.now() - questionStarted.current;

      setFeedbackMeta({ correct, itemCategory: current.category });

      if (correct) {
        setFeedback("correct");
        void playSound("correct");
      } else {
        setFeedback("wrong");
        void playSound("wrong");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }

      const record: AnswerRecord = {
        item: current,
        userAnswer: choice,
        correct,
        timeMs,
      };

      setTimeout(() => {
        setFeedback(null);
        setFeedbackMeta(null);
        answering.current = false;
        advance(record);
      }, correct ? 400 : 580);
    },
    [advance, current, index, isSuddenDeath, playSound],
  );

  const pool = useMemo(() => activeDeckRef.current, [deckVersion]);

  return {
    current,
    index,
    answers,
    lives,
    feedback,
    feedbackMeta,
    shake,
    accuracy,
    progressLabel,
    secondsLeft,
    isSuddenDeath,
    submitAnswer,
    pool,
    done: !current && answers.length > 0,
    soundMuted: muted,
    toggleSound: toggleMute,
  };
}
