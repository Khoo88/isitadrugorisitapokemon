import { formatPlayStyleLabel } from "@/lib/play-style";

interface PlayStyleBadgeProps {
  playStyle?: string | null;
  className?: string;
}

export function PlayStyleBadge({ playStyle, className = "" }: PlayStyleBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md border border-emerald-500/25 bg-slate-900/80 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-emerald-300/90 sm:text-[11px] ${className}`}
    >
      {formatPlayStyleLabel(playStyle)}
    </span>
  );
}
