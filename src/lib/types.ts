export type Category = "drug" | "pokemon";

export type QuestionCount = 10 | 20 | 30 | 50 | 75 | 100 | 150 | 200 | 300;

export type GameMode = "standard" | "sudden-death";

export type TimerOption = 5 | 10 | 15 | "zen";

export type PlayStyle = "swipe" | "classic" | "drag-drop" | "multiple-choice";

export interface GameItem {
  id: string;
  name: string;
  category: Category;
  slug: string;
  description: string;
}

export interface GameConfig {
  questionCount: QuestionCount;
  gameMode: GameMode;
  timer: TimerOption;
  playStyle: PlayStyle;
}

export interface AnswerRecord {
  item: GameItem;
  userAnswer: Category;
  correct: boolean;
  timeMs: number;
}

export interface GameResults {
  config: GameConfig;
  answers: AnswerRecord[];
  startedAt: number;
  endedAt: number;
  suddenDeathScore?: number;
}

export const QUESTION_COUNTS: QuestionCount[] = [
  10, 20, 30, 50, 75, 100, 150, 200, 300,
];

export const TIMER_OPTIONS: { value: TimerOption; label: string }[] = [
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
  { value: "zen", label: "Unlimited / Zen" },
];
