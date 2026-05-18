"use client";

import { motion } from "framer-motion";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function HomePageHeader() {
  return (
    <header className="mb-8 flex w-full items-center justify-center gap-6 border-b border-slate-800/30 pb-8 pt-4">
      <BrandLogo size="hero" priority className="shrink-0" />
      <div className="flex min-w-0 flex-col text-left">
        <motion.h1
          className="bg-gradient-to-r from-drug-glow via-pokemon-cream to-pokemon-red bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-4xl lg:text-5xl"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1, opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Drug or Pokémon?
        </motion.h1>
        <p className="mt-1 max-w-md text-sm text-text-muted sm:text-base">
          Clinical lab vs battle arena — can you sort the names?
        </p>
      </div>
    </header>
  );
}
