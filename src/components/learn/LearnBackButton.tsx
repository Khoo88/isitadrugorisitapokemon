"use client";

import { useRouter } from "next/navigation";

interface LearnBackButtonProps {
  className?: string;
  /** Button label (default: Back to lobby) */
  label?: string;
}

export function LearnBackButton({
  className = "",
  label = "Back to lobby",
}: LearnBackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push("/");
        }
      }}
      className={`inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white ${className}`}
    >
      ← {label}
    </button>
  );
}
