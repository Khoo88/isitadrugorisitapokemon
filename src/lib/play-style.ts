import type { PlayStyle } from "@/lib/types";

const LABELS: Record<PlayStyle, string> = {
  classic: "Classic",
  swipe: "Swipe",
  "drag-drop": "Speed Sort",
  "multiple-choice": "Multiple Choice",
};

/** Human-readable label for leaderboard badges. */
export function formatPlayStyleLabel(
  style: string | null | undefined,
): string {
  if (!style) return "Classic";
  if (style in LABELS) return LABELS[style as PlayStyle];
  return style
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
