"use client";

import { motion } from "framer-motion";
import { buildMultipleChoice } from "@/lib/game";
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
  const { options } = useMemo(
    () => buildMultipleChoice(item, pool),
    [item, pool],
  );

  return (
    <motion.ul
      key={item.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto grid w-full max-w-lg gap-3 px-4"
    >
      {options.map((opt, i) => (
        <motion.li key={i}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt.correct)}
            className="glass w-full rounded-xl border border-white/10 px-4 py-4 text-left text-sm transition hover:border-drug-glow/30 hover:bg-drug-glow/5 disabled:opacity-50"
          >
            {opt.text}
          </button>
        </motion.li>
      ))}
    </motion.ul>
  );
}
