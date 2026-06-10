"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import type { Category, GameItem } from "@/lib/types";
import { MedicalCross } from "@/components/ui/ThematicIcons";

export const SPEED_SORT_BOARD_SIZE = 6;

const DROP_THRESHOLD = 90;

/** @deprecated Use SPEED_SORT_BOARD_SIZE */
export const SPEED_SORT_BATCH_SIZE = SPEED_SORT_BOARD_SIZE;

interface ChipPosition {
  top: string;
  left: string;
}

interface ChipCoords {
  topPct: number;
  leftPct: number;
}

const TOP_MIN_PCT = 10;
const TOP_MAX_PCT = 85;
/** Keep chips in the central lane so they do not overlap side drop zones. */
const LEFT_MIN_PCT = 18;
const LEFT_MAX_PCT = 68;
const MIN_SEPARATION_PCT = 20;
const MAX_PLACEMENT_ATTEMPTS = 10;

function hashItemId(itemId: string): number {
  const id = itemId ?? "";
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function coordsFromPosition(pos: ChipPosition): ChipCoords {
  return {
    topPct: parseFloat(pos.top),
    leftPct: parseFloat(pos.left),
  };
}

function coordsToPosition(coords: ChipCoords): ChipPosition {
  return { top: `${coords.topPct}%`, left: `${coords.leftPct}%` };
}

function distanceBetween(a: ChipCoords, b: ChipCoords): number {
  const dTop = a.topPct - b.topPct;
  const dLeft = a.leftPct - b.leftPct;
  return Math.sqrt(dTop * dTop + dLeft * dLeft);
}

/** Deterministic fallback when separation retries are exhausted. */
function fallbackPosition(itemId: string): ChipPosition {
  const hash = hashItemId(itemId);
  return coordsToPosition({
    topPct: TOP_MIN_PCT + (hash % (TOP_MAX_PCT - TOP_MIN_PCT + 1)),
    leftPct: LEFT_MIN_PCT + ((hash >>> 8) % (LEFT_MAX_PCT - LEFT_MIN_PCT + 1)),
  });
}

/** Place a chip without overlapping existing board positions (min 18% separation). */
function allocateNonOverlappingPosition(
  itemId: string,
  existing: ChipCoords[],
): ChipPosition {
  const hash = hashItemId(itemId);

  for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
    const topSpan = TOP_MAX_PCT - TOP_MIN_PCT + 1;
    const leftSpan = LEFT_MAX_PCT - LEFT_MIN_PCT + 1;
    const topPct =
      TOP_MIN_PCT + ((hash + attempt * 17) % topSpan);
    const leftPct =
      LEFT_MIN_PCT + ((hash >>> 8) + attempt * 23) % leftSpan;

    const candidate: ChipCoords = { topPct, leftPct };
    const separated = existing.every(
      (other) => distanceBetween(candidate, other) >= MIN_SEPARATION_PCT,
    );

    if (separated) {
      return coordsToPosition(candidate);
    }
  }

  return fallbackPosition(itemId);
}

interface DragDropModeProps {
  items?: GameItem[];
  onSort: (item: GameItem, choice: Category) => boolean;
  shake?: boolean;
}

function PharmacyZone({ active }: { active: boolean }) {
  return (
    <motion.aside
      animate={{
        scale: active ? 1.02 : 1,
        boxShadow: active
          ? "0 0 50px rgba(0, 255, 159, 0.35)"
          : "0 0 20px rgba(0, 255, 159, 0.1)",
      }}
      className="theme-drug-panel relative flex w-[34vw] min-w-[120px] max-w-[280px] flex-col items-center justify-center gap-2 border-r border-drug-glow/30 p-3 sm:min-w-[180px] sm:gap-3 sm:p-4"
    >
      <MedicalCross className="h-8 w-8 text-drug-glow sm:h-12 sm:w-12" />
      <div className="pointer-events-none text-center">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-drug-glow/80 sm:text-[10px]">
          Drop zone
        </p>
        <h3 className="holo-text text-base font-bold sm:text-xl">Pharmacy</h3>
        <p className="text-[10px] text-drug-dim sm:text-xs">Drug</p>
      </div>
    </motion.aside>
  );
}

function PokeballZone({ active }: { active: boolean }) {
  return (
    <motion.aside
      animate={{
        scale: active ? 1.02 : 1,
        boxShadow: active
          ? "0 0 50px rgba(227, 53, 45, 0.45)"
          : "0 0 24px rgba(227, 53, 45, 0.12)",
      }}
      className="relative flex w-[34vw] min-w-[120px] max-w-[280px] flex-col items-center justify-center overflow-hidden border-l border-black/20 sm:min-w-[180px]"
      aria-label="Pokéball drop zone — Pokémon"
    >
      <div className="absolute inset-x-0 top-0 h-1/2 bg-pokemon-red" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white" aria-hidden />

      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-3 -translate-y-1/2 bg-black"
        aria-hidden
      />

      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-[5px] border-black bg-white shadow-[inset_0_-2px_4px_rgba(0,0,0,0.15)] sm:h-16 sm:w-16 sm:border-[6px]"
        aria-hidden
      >
        <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black/80 bg-white sm:h-5 sm:w-5" />
      </motion.div>

      <div className="pointer-events-none relative z-30 mt-8 px-2 text-center sm:px-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/50 sm:text-[10px]">
          Drop zone
        </p>
        <h3 className="text-base font-bold text-black/80 sm:text-xl">Pokéball</h3>
        <p className="text-[10px] font-semibold text-pokemon-red sm:text-xs">Pokémon</p>
      </div>
    </motion.aside>
  );
}

function SortChip({
  item,
  position,
  onDrop,
  wrongShake,
  onHoverZone,
  onWrongDrop,
}: {
  item: GameItem;
  position: ChipPosition;
  onDrop: (item: GameItem, choice: Category) => boolean;
  wrongShake: boolean;
  onHoverZone: (zone: "drug" | "pokemon" | null) => void;
  onWrongDrop: (itemId: string) => void;
}) {
  const isDraggingRef = useRef(false);
  const [dragResetKey, setDragResetKey] = useState(0);

  useEffect(() => {
    if (!wrongShake) return;

    isDraggingRef.current = false;
    onHoverZone(null);
    setDragResetKey((k) => k + 1);
  }, [wrongShake, onHoverZone]);

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDrag = (_: unknown, info: PanInfo) => {
    if (!isDraggingRef.current) return;
    const x = info.offset.x;
    if (x < -DROP_THRESHOLD) onHoverZone("drug");
    else if (x > DROP_THRESHOLD) onHoverZone("pokemon");
    else onHoverZone(null);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    isDraggingRef.current = false;
    onHoverZone(null);

    const x = info.offset.x;
    if (x < -DROP_THRESHOLD) {
      const correct = onDrop(item, "drug");
      if (!correct) onWrongDrop(item.id);
    } else if (x > DROP_THRESHOLD) {
      const correct = onDrop(item, "pokemon");
      if (!correct) onWrongDrop(item.id);
    }
  };

  return (
    <motion.div
      key={`${item.id}-${dragResetKey}`}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      drag
      dragSnapToOrigin
      dragElastic={0.35}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.08, zIndex: 30 }}
      className="absolute z-20 max-w-[40%] cursor-grab touch-none active:cursor-grabbing sm:max-w-[34%] md:max-w-[30%]"
      style={{ top: position.top, left: position.left }}
    >
      <div
        className={`glass rounded-xl border-2 border-white/20 px-3 py-2.5 text-center shadow-lg sm:rounded-2xl sm:border-4 sm:px-6 sm:py-4 ${
          wrongShake ? "animate-[chip-wrong-shake_0.45s_ease-in-out]" : ""
        }`}
      >
        <p className="text-sm font-bold leading-tight text-text-primary sm:text-xl sm:leading-snug">
          {item.name}
        </p>
      </div>
    </motion.div>
  );
}

export function DragDropMode({
  items: itemsProp,
  onSort,
  shake = false,
}: DragDropModeProps) {
  const items = itemsProp ?? [];
  const [chipShakeId, setChipShakeId] = useState<string | null>(null);
  const [hoverZone, setHoverZone] = useState<"drug" | "pokemon" | null>(null);
  const positionMapRef = useRef<Map<string, ChipPosition>>(new Map());

  const getPosition = useCallback(
    (itemId: string, activeIds: string[]): ChipPosition => {
      const map = positionMapRef.current;
      const cached = map.get(itemId);
      if (cached) return cached;

      const existing = activeIds
        .filter((id) => id !== itemId && map.has(id))
        .map((id) => coordsFromPosition(map.get(id)!));

      const pos = allocateNonOverlappingPosition(itemId, existing);
      map.set(itemId, pos);
      return pos;
    },
    [],
  );

  const activeIds = items.map((item) => item.id);

  const handleDrop = useCallback(
    (item: GameItem, choice: Category): boolean => {
      return onSort(item, choice);
    },
    [onSort],
  );

  const handleWrongDrop = useCallback((itemId: string) => {
    setHoverZone(null);
    setChipShakeId(itemId);
    setTimeout(() => setChipShakeId(null), 450);
  }, []);

  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 top-[52px] z-10 flex overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PharmacyZone active={hoverZone === "drug"} />

      <section
        className={`relative min-h-0 flex-1 overflow-hidden ${
          shake ? "animate-[shake_0.45s_ease-in-out]" : ""
        }`}
        aria-label="Speed sort playfield"
      >
        <p className="pointer-events-none absolute inset-x-0 top-2 z-10 text-center font-mono text-[10px] uppercase tracking-widest text-text-muted/70 sm:text-xs">
          Drag each name to Pharmacy (left) or Pokéball (right)
        </p>

        <div className="relative isolate h-full w-full">
          <AnimatePresence initial={false}>
            {items.map((item) =>
              item?.id ? (
                <SortChip
                  key={item.id}
                  item={item}
                  position={getPosition(item.id, activeIds)}
                  onDrop={handleDrop}
                  wrongShake={chipShakeId === item.id}
                  onHoverZone={setHoverZone}
                  onWrongDrop={handleWrongDrop}
                />
              ) : null,
            )}
          </AnimatePresence>
        </div>
      </section>

      <PokeballZone active={hoverZone === "pokemon"} />
    </motion.div>
  );
}
