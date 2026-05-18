"use client";

import { motion } from "framer-motion";
import type { Category } from "@/lib/types";
import { MedicalCross } from "@/components/ui/ThematicIcons";

interface ClassicModeProps {
  onAnswer: (c: Category) => void;
  disabled?: boolean;
}

export function ClassicMode({ onAnswer, disabled }: ClassicModeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto grid w-full max-w-lg grid-cols-2 items-center gap-4 px-4"
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => onAnswer("pokemon")}
        aria-label="Pokémon — Pokéball"
        className="group relative mx-auto aspect-square h-40 w-40 overflow-hidden rounded-full border-8 border-slate-950 bg-slate-950 shadow-2xl disabled:opacity-50 sm:h-44 sm:w-44"
      >
        <span className="absolute inset-x-0 top-0 flex h-1/2 items-center justify-center bg-[#c41e1e]">
          <span className="text-sm font-bold uppercase tracking-widest text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.35)]">
            Pokémon
          </span>
        </span>
        <span
          className="absolute inset-x-0 bottom-0 h-1/2 bg-white"
          aria-hidden
        />
        <span
          className="absolute inset-x-0 top-1/2 h-3 w-full -translate-y-1/2 bg-slate-950"
          aria-hidden
        />
        <span
          className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950"
          aria-hidden
        >
          <span className="h-6 w-6 rounded-full border-2 border-slate-950 bg-white transition-shadow duration-200 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
        </span>
      </motion.button>
    </motion.div>
  );
}
