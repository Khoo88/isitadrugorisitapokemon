import { NextRequest, NextResponse } from "next/server";
import { generateGameDeckItems } from "@/lib/items";
import type { QuestionCount, QuizCategory } from "@/lib/types";
import { QUESTION_COUNTS } from "@/lib/types";

const QUIZ_CATEGORIES: QuizCategory[] = ["medicine", "pokemon", "both"];

export async function GET(request: NextRequest) {
  const countParam = request.nextUrl.searchParams.get("count");
  const count = Number(countParam) as QuestionCount;
  const quizCategoryParam = request.nextUrl.searchParams.get("quizCategory");
  const quizCategory: QuizCategory = QUIZ_CATEGORIES.includes(
    quizCategoryParam as QuizCategory,
  )
    ? (quizCategoryParam as QuizCategory)
    : "both";

  if (!QUESTION_COUNTS.includes(count)) {
    return NextResponse.json(
      { error: "Invalid question count" },
      { status: 400 },
    );
  }

  try {
    const deck = await generateGameDeckItems(count, quizCategory);
    const drugCount = deck.filter((i) => i.category === "drug").length;
    return NextResponse.json({
      deck,
      meta: {
        total: deck.length,
        drugs: drugCount,
        pokemon: deck.length - drugCount,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
