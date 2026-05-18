"use client";

import { useState, type ReactNode } from "react";
import { motion, type PanInfo } from "framer-motion";
import type { Category, GameItem } from "@/lib/types";
import { MedicalCross, PokeballIcon } from "@/components/ui/ThematicIcons";

interface DragDropModeProps {
  item: GameItem;
  onAnswer: (c: Category) => void;
  feedback: "correct" | "wrong" | null;
}

const DROP_THRESHOLD = 100;

function PharmacyZone({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <motion.aside
      animate={{
        scale: active ? 1.02 : 1,
        boxShadow: active
          ? "0 0 50px rgba(0, 255, 159, 0.35)"
          : "0 0 20px rgba(0, 255, 159, 0.1)",
      }}
      className="theme-drug-panel relative flex w-[38vw] min-w-[140px] max-w-[320px] flex-col items-center justify-center gap-3 border-r border-drug-glow/30 p-4 sm:min-w-[200px] sm:gap-4"
    >
      {children}
    </motion.aside>
  );
}

function PokeballZone({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <motion.aside
      animate={{
        scale: active ? 1.02 : 1,
        boxShadow: active
          ? "0 0 50px rgba(238, 21, 21, 0.4)"
          : "0 0 20px rgba(238, 21, 21, 0.15)",
      }}
      className="theme-pokemon-panel relative flex w-[38vw] min-w-[140px] max-w-[320px] flex-col items-center justify-center gap-3 border-l border-pokemon-red/40 p-4 sm:min-w-[200px] sm:gap-4"
    >
      {children}
    </motion.aside>
  );
}

export function DragDropMode({ item, onAnswer, feedback }: DragDropModeProps) {
  const [dragging, setDragging] = useState(false);
  const [hoverZone, setHoverZone] = useState<"drug" | "pokemon" | null>(null);

  const handleDrag = (_: unknown, info: PanInfo) => {
    const x = info.offset.x;
    if (x < -DROP_THRESHOLD) setHoverZone("drug");
    else if (x > DROP_THRESHOLD) setHoverZone("pokemon");
    else setHoverZone(null);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setDragging(false);
    setHoverZone(null);
    const x = info.offset.x;
    if (x < -DROP_THRESHOLD) onAnswer("drug");
    else if (x > DROP_THRESHOLD) onAnswer("pokemon");
  };

  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 top-[52px] z-10 flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PharmacyZone active={hoverZone === "drug"}>
        <MedicalCross className="h-10 w-10 text-drug-glow sm:h-14 sm:w-14" />
        <motion.div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-drug-glow/70 sm:text-xs">
            Clinical Lab
          </p>
          <h3 className="holo-text text-lg font-bold sm:text-2xl">Pharmacy</h3>
          <p className="mt-1 text-xs text-drug-dim">(Drug)</p>
        </motion.div>
        <p className="hidden text-center text-[10px] text-text-muted sm:block">
          Drop name here
        </p>
      </PharmacyZone>

      <section className="relative flex flex-1 items-center justify-center px-2 py-4 sm:px-6">
        <motion.div
          drag
          dragSnapToOrigin
          dragElastic={0.35}
          onDragStart={() => setDragging(true)}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={{
            scale: dragging ? 1.06 : 1,
            boxShadow:
              feedback === "correct"
                ? "0 0 50px rgba(0, 255, 159, 0.5)"
                : feedback === "wrong"
                  ? "0 0 50px rgba(238, 21, 21, 0.5)"
                  : "0 16px 48px rgba(0,0,0,0.5)",
            borderColor:
              feedback === "correct"
                ? "rgba(0, 255, 159, 0.7)"
                : feedback === "wrong"
                  ? "rgba(238, 21, 21, 0.7)"
                  : "rgba(255,255,255,0.15)",
          }}
          className="glass z-20 w-full max-w-xs cursor-grab touch-none rounded-2xl border-2 px-6 py-10 text-center active:cursor-grabbing sm:max-w-sm sm:rounded-3xl sm:py-14"
        >
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted sm:text-xs">
            Drag to a side
          </p>
          <h2 className="text-2xl font-extrabold sm:text-3xl">{item.name}</h2>
        </motion.div>
      </section>

      <PokeballZone active={hoverZone === "pokemon"}>
        <PokeballIcon className="h-12 w-12 sm:h-16 sm:w-16" />
        <motion.div className="text-center">
          <p className="pixel-text text-[10px] text-pokemon-cream/80 sm:text-xs">
            BATTLE ARENA
          </p>
          <h3 className="pixel-text text-lg font-bold text-pokemon-white sm:text-2xl">
            Pokéball
          </h3>
          <p className="mt-1 text-xs text-pokemon-cream/90">(Pokémon)</p>
        </motion.div>
        <p className="hidden text-center text-[10px] text-pokemon-white/60 sm:block">
          Drop name here
        </p>
      </PokeballZone>
    </motion.div>
  );
}
