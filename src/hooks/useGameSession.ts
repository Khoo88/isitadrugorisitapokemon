"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AnswerRecord,
  Category,
  GameConfig,
  GameItem,
  GameResults,
} from "@/lib/types";
import { STORAGE_KEYS, timerSeconds } from "@/lib/game";

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

  const totalQuestions =
    config.gameMode === "sudden-death" ? Infinity : config.questionCount;
  const current = deck[index];
  const isSuddenDeath = config.gameMode === "sudden-death";

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
    : `${Math.min(index + 1, deck.length)}/${deck.length}`;

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
      onComplete(results);
    },
    [config, startedAt, isSuddenDeath, onComplete],
  );

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
        if (nextIndex >= deck.length) {
          finish(nextAnswers);
          return;
        }
        setIndex(nextIndex);
        questionStarted.current = Date.now();
        return;
      }

      const nextIndex = index + 1;
      if (nextIndex >= deck.length) {
        setTimeout(() => finish(nextAnswers), 400);
        return;
      }
      setIndex(nextIndex);
      questionStarted.current = Date.now();
    },
    [answers, deck.length, finish, index, isSuddenDeath, lives],
  );

  const submitAnswer = useCallback(
    (choice: Category) => {
      if (!current || answering.current) return;
      if (!isSuddenDeath && index >= deck.length) return;

      answering.current = true;
      const correct = choice === current.category;
      const timeMs = Date.now() - questionStarted.current;

      setFeedbackMeta({ correct, itemCategory: current.category });

      if (correct) {
        setFeedback("correct");
      } else {
        setFeedback("wrong");
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
    [advance, current, deck.length, index, isSuddenDeath],
  );

  const pool = useMemo(() => deck, [deck]);

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
  };
}
