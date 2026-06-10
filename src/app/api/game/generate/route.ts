import { NextRequest, NextResponse } from "next/server";
import { generateGameDeckItems } from "@/lib/items";
import type { QuestionCount, QuizCategory } from "@/lib/types";
import {
  questionCountToDeckSize,
  QUESTION_COUNTS,
  type QuestionCountOption,
} from "@/lib/types";

const QUIZ_CATEGORIES: QuizCategory[] = ["medicine", "pokemon", "both"];
const FULL_DECK_SIZE = 700;

function parseCountOption(countParam: string | null): QuestionCountOption | null {
  const normalized = countParam?.trim().toLowerCase() ?? "";

  if (normalized === "unlimited" || normalized === "") {
    return "unlimited";
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
    return null;
  }

  if (!QUESTION_COUNTS.includes(parsed as QuestionCount)) {
    return null;
  }

  return parsed as QuestionCount;
}

export async function GET(request: NextRequest) {
  const countParam = request.nextUrl.searchParams.get("count");
  const quizCategoryParam = request.nextUrl.searchParams.get("quizCategory");
  const quizCategory: QuizCategory = QUIZ_CATEGORIES.includes(
    quizCategoryParam as QuizCategory,
  )
    ? (quizCategoryParam as QuizCategory)
    : "both";

  const option = parseCountOption(countParam);
  if (option === null) {
    return NextResponse.json(
      { error: "Invalid question count" },
      { status: 400 },
    );
  }

  const deckSize =
    option === "unlimited" ? FULL_DECK_SIZE : questionCountToDeckSize(option);

  try {
    const deck = await generateGameDeckItems(deckSize, quizCategory);
    const drugCount = deck.filter((i) => i.category === "drug").length;
    return NextResponse.json({
      deck,
      meta: {
        total: deck.length,
        drugs: drugCount,
        pokemon: deck.length - drugCount,
        requested: deckSize,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
