"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Category } from "@/lib/types";
import { HoloX, MedicalCross, PokeballIcon } from "@/components/ui/ThematicIcons";

export interface FeedbackMeta {
  correct: boolean;
  itemCategory: Category;
}

interface FeedbackOverlayProps {
  feedback: "correct" | "wrong" | null;
  meta: FeedbackMeta | null;
}

export function FeedbackOverlay({ feedback, meta }: FeedbackOverlayProps) {
  return (
    <AnimatePresence>
      {feedback && meta && (
        <motion.div
          key={`${feedback}-${meta.itemCategory}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
        >
          {feedback === "wrong" ? (
            <motion.div
              initial={{ scale: 0.3, rotate: -15 }}
              animate={{ scale: [0.3, 1.2, 1], rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="text-drug-glow drop-shadow-[0_0_40px_rgba(0,255,159,0.8)]"
            >
              <HoloX className="h-28 w-28" />
              <p className="mt-2 text-center font-mono text-sm uppercase tracking-[0.3em] text-drug-glow">
                Rejected
              </p>
            </motion.div>
          ) : meta.itemCategory === "pokemon" ? (
            <motion.div
              initial={{ scale: 2, y: -80, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 0.4 }}
              >
                <PokeballIcon className="h-32 w-32 drop-shadow-[0_0_30px_rgba(238,21,21,0.6)]" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pixel-text mt-3 text-lg text-pokemon-cream"
              >
                GOTCHA!
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center rounded-2xl border border-drug-glow/60 bg-drug-glow/10 px-10 py-8 shadow-[0_0_60px_rgba(0,255,159,0.4)]"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.35 }}
                className="text-drug-glow"
              >
                <MedicalCross className="h-16 w-16" />
              </motion.div>
              <p className="mt-3 font-mono text-sm uppercase tracking-[0.25em] text-drug-glow">
                Verified Rx
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
