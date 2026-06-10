interface SuddenDeathModeBadgeProps {
  className?: string;
}

/** Matches Sudden Death game mode chip styling for leaderboard headings. */
export function SuddenDeathModeBadge({ className = "" }: SuddenDeathModeBadgeProps) {
  return (
    <span
      className={`ml-2 inline-flex shrink-0 items-center rounded-md border border-red-500/30 bg-red-950/40 px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-wide text-red-500 ${className}`}
    >
      Sudden Death
    </span>
  );
}
