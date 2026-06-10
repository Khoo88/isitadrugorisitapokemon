"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AnswerRecord,
  Category,
  GameConfig,
  GameItem,
  GameResults,
} from "@/lib/types";
import { resolveQuestionLimit } from "@/lib/types";
import { shuffle, STORAGE_KEYS, timerSeconds } from "@/lib/game";
import { SPEED_SORT_BOARD_SIZE } from "@/components/game/DragDropMode";
import { useSound } from "@/hooks/useSound";

interface UseGameSessionOptions {
  config: GameConfig;
  deck: GameItem[];
  onComplete: (results: GameResults) => void;
}

function initSpeedSortBoard(deck: GameItem[] | undefined): GameItem[] {
  if (!deck?.length) return [];
  return deck.slice(0, Math.min(SPEED_SORT_BOARD_SIZE, deck.length));
}

export function useGameSession({
  config,
  deck,
  onComplete,
}: UseGameSessionOptions) {
  const [activeDeck, setActiveDeck] = useState(deck);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const answersRef = useRef<AnswerRecord[]>([]);
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

  const isSuddenDeath = config.gameMode === "sudden-death";
  const isSpeedSort = config.playStyle === "drag-drop";
  const questionLimit = isSuddenDeath
    ? Infinity
    : resolveQuestionLimit(config.questionCount);

  const [speedSortBoard, setSpeedSortBoard] = useState<GameItem[]>(() =>
    isSpeedSort ? initSpeedSortBoard(deck) : [],
  );
  const speedSortCursorRef = useRef(
    isSpeedSort ? initSpeedSortBoard(deck).length : 0,
  );

  const current = isSpeedSort ? speedSortBoard[0] : activeDeck[index];

  useEffect(() => {
    setActiveDeck(deck);
    setIndex(0);
    setAnswers([]);
    answersRef.current = [];
    setLives(3);
    if (isSpeedSort) {
      const initial = initSpeedSortBoard(deck);
      setSpeedSortBoard(initial);
      speedSortCursorRef.current = initial.length;
    } else {
      setSpeedSortBoard([]);
      speedSortCursorRef.current = 0;
    }
  }, [deck, isSpeedSort]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

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
      finish(answersRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const correctCount = answers.filter((a) => a.correct).length;
  const accuracy =
    answers.length > 0
      ? Math.round((correctCount / answers.length) * 100)
      : 100;

  const sortedCount = answers.filter((a) => a.correct).length;

  const progressLabel = useMemo(() => {
    if (isSuddenDeath) return `Score: ${correctCount}`;
    if (isSpeedSort) {
      const cap =
        questionLimit === Infinity ? "∞" : String(questionLimit);
      return `Sorted: ${sortedCount}/${cap}`;
    }
    return `${Math.min(index + 1, activeDeck.length)}/${activeDeck.length}`;
  }, [
    correctCount,
    index,
    activeDeck.length,
    isSuddenDeath,
    isSpeedSort,
    questionLimit,
    sortedCount,
  ]);

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

  const maybeFinishSpeedSort = useCallback(
    (
      nextAnswers: AnswerRecord[],
      boardAfter: GameItem[],
      deckLength: number,
    ) => {
      const sortedCorrect = nextAnswers.filter((a) => a.correct).length;
      const reachedLimit =
        !isSuddenDeath &&
        questionLimit !== Infinity &&
        sortedCorrect >= questionLimit;
      const deckExhausted =
        boardAfter.length === 0 && speedSortCursorRef.current >= deckLength;

      if (reachedLimit || deckExhausted) {
        setTimeout(() => finish(nextAnswers), 300);
      }
    },
    [finish, isSuddenDeath, questionLimit],
  );

  const pullNextOntoBoard = useCallback(
    (board: GameItem[], cursor: number, deckSnapshot: GameItem[]) => {
      if (cursor < deckSnapshot.length) {
        board.push(deckSnapshot[cursor]);
        return cursor + 1;
      }
      return cursor;
    },
    [],
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
        if (nextIndex >= activeDeck.length) {
          setActiveDeck((prev) => [...prev, ...shuffle(deck)]);
        }
        setIndex(nextIndex);
        questionStarted.current = Date.now();
        return;
      }

      const nextIndex = index + 1;
      if (nextIndex >= activeDeck.length) {
        setTimeout(() => finish(nextAnswers), 400);
        return;
      }
      setIndex(nextIndex);
      questionStarted.current = Date.now();
    },
    [activeDeck.length, answers, deck, finish, index, isSuddenDeath, lives],
  );

  const submitAnswer = useCallback(
    (choice: Category) => {
      if (!current || answering.current) return;
      if (!isSuddenDeath && index >= activeDeck.length) return;

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
    [activeDeck.length, advance, current, index, isSuddenDeath, playSound],
  );

  const pool = useMemo(() => activeDeck, [activeDeck]);

  const submitSpeedSort = useCallback(
    (item: GameItem, choice: Category): boolean => {
      if (!speedSortBoard.some((entry) => entry.id === item.id)) return false;

      const correct = choice === item.category;
      const timeMs = Date.now() - questionStarted.current;

      if (!correct) {
        void playSound("wrong");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setFeedback("wrong");
        setTimeout(() => setFeedback(null), 280);
        if (isSuddenDeath) {
          const newLives = lives - 1;
          setLives(newLives);
          if (newLives <= 0) {
            setTimeout(() => finish(answersRef.current), 600);
          }
        }
        return false;
      }

      const record: AnswerRecord = {
        item,
        userAnswer: choice,
        correct: true,
        timeMs,
      };
      const nextAnswers = [...answers, record];
      setAnswers(nextAnswers);

      void playSound("correct");
      setFeedback("correct");
      setTimeout(() => setFeedback(null), 180);

      const sortedCorrect = nextAnswers.length;
      const atQuestionCap =
        !isSuddenDeath &&
        questionLimit !== Infinity &&
        sortedCorrect >= questionLimit;

      if (!atQuestionCap) {
        setSpeedSortBoard((prev) => {
          const nextBoard = prev.filter((i) => i.id !== item.id);
          let cursor = speedSortCursorRef.current;
          let deckSnapshot = activeDeck;

          if (isSuddenDeath && cursor >= deckSnapshot.length) {
            deckSnapshot = [...deckSnapshot, ...shuffle(deck)];
            setActiveDeck(deckSnapshot);
          }

          speedSortCursorRef.current = pullNextOntoBoard(
            nextBoard,
            cursor,
            deckSnapshot,
          );
          maybeFinishSpeedSort(nextAnswers, nextBoard, deckSnapshot.length);
          return nextBoard;
        });
      } else {
        setSpeedSortBoard((prev) => {
          const nextBoard = prev.filter((i) => i.id !== item.id);
          maybeFinishSpeedSort(nextAnswers, nextBoard, activeDeck.length);
          return nextBoard;
        });
      }

      return true;
    },
    [
      activeDeck,
      answers,
      deck,
      finish,
      isSuddenDeath,
      lives,
      maybeFinishSpeedSort,
      playSound,
      pullNextOntoBoard,
      questionLimit,
      speedSortBoard,
    ],
  );

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
    submitSpeedSort,
    speedSortBoard,
    pool,
    done: !current && answers.length > 0,
    soundMuted: muted,
    toggleSound: toggleMute,
  };
}
