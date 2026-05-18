"use client";

import { motion } from "framer-motion";
import type { Category } from "@/lib/types";
import { MedicalCross, PokeballIcon } from "@/components/ui/ThematicIcons";

interface ClassicModeProps {
  onAnswer: (c: Category) => void;
  disabled?: boolean;
}

export function ClassicMode({ onAnswer, disabled }: ClassicModeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto grid w-full max-w-lg grid-cols-2 gap-4 px-4"
    >
      <motion.button
        type="button"
        disabled={disabled}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => onAnswer("drug")}
        className="theme-drug-panel relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl py-8 text-lg font-bold text-drug-glow shadow-[0_0_24px_rgba(0,255,159,0.2)] disabled:opacity-50"
      >
        <MedicalCross className="h-10 w-10" />
        <span className="font-mono text-sm uppercase tracking-wider">Drug</span>
        <span className="text-xs font-normal text-drug-dim">Pharmacy</span>
      </motion.button>
      <motion.button
        type="button"
        disabled={disabled}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => onAnswer("pokemon")}
        className="theme-pokemon-panel relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl py-8 disabled:opacity-50"
      >
        <PokeballIcon className="h-12 w-12" />
        <span className="pixel-text text-sm text-pokemon-white">Pokémon</span>
        <span className="text-xs text-pokemon-cream/80">Pokéball</span>
      </motion.button>
    </motion.div>
  );
}
