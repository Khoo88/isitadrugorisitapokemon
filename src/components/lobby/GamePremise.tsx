"use client";

import { motion } from "framer-motion";
import { MedicalCross, PokeballIcon } from "@/components/ui/ThematicIcons";

interface GamePremiseProps {
  embedded?: boolean;
}

export function GamePremise({ embedded = false }: GamePremiseProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className={
        embedded
          ? "relative flex-1"
          : "glass relative overflow-hidden rounded-2xl border border-white/10 p-5 sm:p-6"
      }
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

      <div className="relative flex items-start gap-4 sm:gap-6">
        <div className="flex shrink-0 flex-col gap-3 pt-1">
          <motion.div
            className="theme-drug-panel relative flex h-14 w-14 items-center justify-center rounded-xl text-drug-glow"
            animate={{
              boxShadow: [
                "0 0 20px rgba(0,255,159,0.2)",
                "0 0 35px rgba(0,255,159,0.4)",
                "0 0 20px rgba(0,255,159,0.2)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MedicalCross className="h-7 w-7" />
          </motion.div>
          <motion.div
            className="theme-pokemon-panel relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl"
            whileHover={{ scale: 1.05 }}
          >
            <PokeballIcon className="h-9 w-9 self-center" />
          </motion.div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <h3 className="text-xl font-bold leading-snug text-text-primary sm:text-2xl">
            The ultimate name-guessing challenge
          </h3>

          <p className="text-sm leading-relaxed text-text-muted">
            Pharmaceutical brand names and Pokémon species often sound bizarrely
            alike. Your mission: sort each name into the{" "}
            <span className="holo-text font-semibold">clinical lab</span> or the{" "}
            <span className="font-semibold text-pokemon-red">Pokéball</span>.
          </p>

          <p className="text-sm leading-relaxed text-text-muted">
            Every round draws from our database of{" "}
            <strong className="text-text-primary">700 unique items</strong> — 350
            medications and 350 Pokémon — fully randomized for your session.
          </p>

          <hr className="my-6 border-white/10" />

          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-text-muted">
            Game Modes Explained
          </h3>

          <ul className="space-y-3">
            <li className="flex gap-2.5">
              <span
                aria-hidden
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-drug-glow"
              />
              <p className="text-sm text-slate-400">
                <span className="font-semibold text-drug-glow">Standard:</span>{" "}
                Play through your selected question count at your own pace. Ideal
                for training and learning the database items.
              </p>
            </li>
            <li className="flex gap-2.5">
              <span
                aria-hidden
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pokemon-red"
              />
              <p className="text-sm text-slate-400">
                <span className="font-semibold text-pokemon-red">Sudden Death:</span>{" "}
                One wrong move and your run is instantly terminated. Submits your
                final score to the leaderboard tracking deck.
              </p>
            </li>
            <li className="flex gap-2.5">
              <span
                aria-hidden
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"
              />
              <p className="text-sm text-slate-400">
                <span className="font-semibold text-amber-300">Tournament:</span>{" "}
                The ultimate gauntlet. Bypasses all settings to launch an endless,
                randomized mix of both pools under Sudden Death rules. Compete
                directly for global rank.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </motion.section>
  );
}
