"use client";

import { motion } from "framer-motion";

interface OptionChipProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
  color?: "drug" | "pokemon" | "neutral";
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
}: OptionChipProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
        selected
          ? "ring-2 ring-pokemon-cream border-pokemon-cream/60 bg-pokemon-cream/15 text-pokemon-cream"
          : colors[color]
      }`}
    >
      {label}
    </motion.button>
  );
}
