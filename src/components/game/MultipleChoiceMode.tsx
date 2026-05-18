"use client";

import { motion } from "framer-motion";
import { buildContextualMultipleChoice } from "@/lib/quiz-metadata";
import type { GameItem } from "@/lib/types";
import { useMemo } from "react";

interface MultipleChoiceModeProps {
  item: GameItem;
  pool: GameItem[];
  onSelect: (correct: boolean) => void;
  disabled?: boolean;
}

export function MultipleChoiceMode({
  item,
  pool,
  onSelect,
  disabled,
}: MultipleChoiceModeProps) {
  const { prompt, options } = useMemo(
    () => buildContextualMultipleChoice(item, pool),
    [item, pool],
  );

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto w-full max-w-lg px-4"
    >
      <p className="mb-4 text-center text-sm font-medium leading-snug text-text-muted">
        {prompt}
      </p>
      <ul className="grid gap-3">
        {options.map((opt, i) => (
          <li key={`${item.id}-opt-${i}`}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(opt.correct)}
              className={`glass w-full rounded-xl border px-4 py-4 text-left text-sm transition disabled:opacity-50 ${
                item.category === "drug"
                  ? "hover:border-emerald-400/35 hover:bg-emerald-500/10"
                  : "hover:border-pokemon-cream/40 hover:bg-pokemon-cream/10"
              }`}
            >
              {opt.text}
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
