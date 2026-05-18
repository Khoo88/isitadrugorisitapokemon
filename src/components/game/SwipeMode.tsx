"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import type { Category, GameItem } from "@/lib/types";
import { MedicalCross, PokeballIcon } from "@/components/ui/ThematicIcons";

interface SwipeModeProps {
  item: GameItem;
  onAnswer: (c: Category) => void;
  feedback: "correct" | "wrong" | null;
}

const SWIPE_THRESHOLD = 100;

export function SwipeMode({ item, onAnswer, feedback }: SwipeModeProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const drugOpacity = useTransform(x, [-120, 0], [1, 0]);
  const pokemonOpacity = useTransform(x, [0, 120], [0, 1]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) onAnswer("drug");
    else if (info.offset.x > SWIPE_THRESHOLD) onAnswer("pokemon");
  };

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative mx-auto h-[420px] w-full max-w-sm"
    >
      <motion.div
        style={{ opacity: drugOpacity }}
        className="theme-drug-panel pointer-events-none absolute left-2 top-1/2 flex -translate-y-1/2 items-center gap-2 rounded-xl px-3 py-2 sm:left-4"
      >
        <MedicalCross className="h-5 w-5 text-drug-glow" />
        <span className="font-mono text-xs font-bold text-drug-glow sm:text-sm">
          DRUG
        </span>
      </motion.div>
      <motion.div
        style={{ opacity: pokemonOpacity }}
        className="theme-pokemon-panel pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2 rounded-xl px-3 py-2 sm:right-4"
      >
        <span className="pixel-text text-xs font-bold text-pokemon-white sm:text-sm">
          POKÉ
        </span>
        <PokeballIcon className="h-5 w-5" />
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        style={{ x, rotate }}
        onDragEnd={handleDragEnd}
        animate={{
          boxShadow:
            feedback === "correct"
              ? "0 0 50px rgba(0,255,159,0.5)"
              : feedback === "wrong"
                ? "0 0 50px rgba(238,21,21,0.5)"
                : "0 20px 60px rgba(0,0,0,0.4)",
        }}
        className="glass absolute inset-x-4 top-8 cursor-grab touch-none rounded-3xl border-2 border-white/10 px-6 py-20 text-center active:cursor-grabbing"
      >
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-text-muted">
          Swipe left = Drug · Right = Pokémon
        </p>
        <h2 className="text-3xl font-extrabold">{item.name}</h2>
      </motion.div>
    </motion.div>
  );
}
