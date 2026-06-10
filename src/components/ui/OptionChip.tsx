"use client";

import { motion } from "framer-motion";

interface OptionChipProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
  color?: "drug" | "pokemon" | "neutral";
  disabled?: boolean;
}

const colors = {
  drug: "border-drug-glow/40 bg-drug-glow/10 text-drug-glow hover:bg-drug-glow/20",
  pokemon:
    "border-pokemon-red/50 bg-pokemon-red/15 text-pokemon-white hover:bg-pokemon-red/25",
  neutral: "border-white/10 bg-white/5 hover:bg-white/10",
};

export function OptionChip({
  label,
  selected,
  onClick,
  color = "neutral",
  disabled = false,
}: OptionChipProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? color === "pokemon"
            ? "ring-2 ring-pokemon-red/70 border-pokemon-red/50 bg-pokemon-red/25 text-slate-100"
            : color === "drug"
              ? "ring-2 ring-drug-glow border-drug-glow/60 bg-drug-glow/15 text-drug-glow"
              : "ring-2 ring-pokemon-cream border-pokemon-cream/60 bg-pokemon-cream/15 text-slate-100"
          : colors[color]
      }`}
    >
      {label}
    </motion.button>
  );
}
