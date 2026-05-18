"use client";

import { motion } from "framer-motion";
import { MedicalCross, PokeballIcon } from "@/components/ui/ThematicIcons";

export function GamePremise() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass relative overflow-hidden rounded-2xl border border-white/10 p-6 sm:p-8"
    >
      <motion.div
        className="pointer-events-none absolute -left-8 top-0 h-32 w-32 rounded-full bg-drug-glow/10 blur-3xl"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute -right-8 bottom-0 h-32 w-32 rounded-full bg-pokemon-red/15 blur-3xl"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, delay: 2 }}
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <motion.div className="flex shrink-0 gap-3">
          <motion.div
            className="theme-drug-panel relative flex h-14 w-14 items-center justify-center rounded-xl text-drug-glow"
            animate={{ boxShadow: ["0 0 20px rgba(0,255,159,0.2)", "0 0 35px rgba(0,255,159,0.4)", "0 0 20px rgba(0,255,159,0.2)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MedicalCross className="h-7 w-7" />
          </motion.div>
          <motion.div
            className="theme-pokemon-panel relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl"
            whileHover={{ scale: 1.05 }}
          >
            <PokeballIcon className="h-9 w-9" />
          </motion.div>
        </motion.div>

        <div className="space-y-3 text-sm leading-relaxed text-text-muted sm:text-base">
          <h2 className="text-lg font-bold text-text-primary sm:text-xl">
            The ultimate name-guessing challenge
          </h2>
          <p>
            Pharmaceutical brand names and Pokémon species often sound bizarrely
            alike. Your mission: sort each name into the{" "}
            <span className="holo-text font-semibold">clinical lab</span> or the{" "}
            <span className="font-semibold text-pokemon-red">Pokéball</span>.
          </p>
          <p>
            Every round draws from our database of{" "}
            <strong className="text-text-primary">300 unique items</strong> — 150
            medications and 150 Pokémon — fully randomized for your session.
          </p>
          <p className="rounded-lg border border-drug-glow/20 bg-drug-glow/5 px-3 py-2 text-xs sm:text-sm">
            <span className="font-semibold text-drug-glow">70/30 rule:</span>{" "}
            No game skews too hard toward one side. For any question count, drugs
            and Pokémon each stay between 30% and 70% of the deck — so a 50-question
            run might be 18 drugs and 32 Pokémon, but never 40 vs 10.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
