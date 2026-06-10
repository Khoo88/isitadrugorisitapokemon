import { Activity, Dna, Pill } from "lucide-react";

interface DrugLearnVisualProps {
  name: string;
  imageUrl?: string;
}

export function DrugLearnVisual({ name, imageUrl }: DrugLearnVisualProps) {
  return (
    <figure
      className="mx-auto mb-8 w-full max-w-sm"
      aria-label={`${name} clinical dossier`}
    >
      <div className="relative overflow-hidden rounded-2xl p-px">
        <div
          className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_0deg,transparent,rgba(16,185,129,0.55),rgba(6,182,212,0.45),transparent)] motion-safe:animate-[spin_8s_linear_infinite]"
          aria-hidden
        />
        <div className="relative rounded-[15px] border border-emerald-500/20 bg-slate-950/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage: `
                linear-gradient(rgba(16,185,129,0.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(16,185,129,0.2) 1px, transparent 1px)
              `,
              backgroundSize: "22px 22px",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent motion-safe:animate-[scanline_3s_ease-in-out_infinite]"
            aria-hidden
          />

          <div className="relative flex aspect-square flex-col items-center justify-center gap-4">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <span
                className="absolute inset-0 rounded-full border border-dashed border-cyan-400/35 motion-safe:animate-[spin_14s_linear_infinite_reverse]"
                aria-hidden
              />
              <span
                className="absolute inset-3 rounded-full border border-emerald-400/45 motion-safe:animate-[spin_7s_linear_infinite]"
                aria-hidden
              />
              <span
                className="absolute inset-6 rounded-full border border-emerald-300/25 bg-emerald-500/10 shadow-[inset_0_0_24px_rgba(16,185,129,0.2)]"
                aria-hidden
              />

              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${name} — Wikipedia`}
                  className="relative z-10 max-h-32 w-full max-w-[9.5rem] object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)] sm:max-h-36"
                />
              ) : (
                <div
                  className="relative z-10 flex flex-col items-center text-emerald-400"
                  aria-hidden
                >
                  <Pill
                    className="h-11 w-11 drop-shadow-[0_0_14px_rgba(52,211,153,0.85)]"
                    strokeWidth={1.5}
                  />
                  <Activity
                    className="absolute -right-2 -top-2 h-5 w-5 text-cyan-400"
                    strokeWidth={2}
                  />
                  <Dna
                    className="absolute -bottom-1 -left-2 h-4 w-4 text-emerald-300/80"
                    strokeWidth={2}
                  />
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-emerald-400/90">
                Clinical dossier
              </p>
              <p className="mt-1 text-xs text-slate-400">{name}</p>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
