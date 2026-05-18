import { NextRequest, NextResponse } from "next/server";
import { generateGameDeckItems } from "@/lib/items";
import type { QuestionCount } from "@/lib/types";
import { QUESTION_COUNTS } from "@/lib/types";

export async function GET(request: NextRequest) {
  const countParam = request.nextUrl.searchParams.get("count");
  const count = Number(countParam) as QuestionCount;

  if (!QUESTION_COUNTS.includes(count)) {
    return NextResponse.json(
      { error: "Invalid question count" },
      { status: 400 },
    );
  }

  try {
    const deck = await generateGameDeckItems(count);
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
