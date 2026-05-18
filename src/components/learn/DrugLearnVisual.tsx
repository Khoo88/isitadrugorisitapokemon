import { MedicalCross } from "@/components/ui/ThematicIcons";

interface DrugLearnVisualProps {
  name: string;
}

export function DrugLearnVisual({ name }: DrugLearnVisualProps) {
  return (
    <figure
      className="mx-auto mb-8 w-full max-w-xs sm:max-w-sm"
      aria-label={`${name} medication illustration`}
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-drug-glow/40 bg-bg-deep/80 p-4 shadow-[0_0_40px_rgba(0,255,159,0.2),inset_0_0_30px_rgba(0,0,0,0.55)]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 159, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 159, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-drug-glow/10 via-transparent to-drug-glow/5" />

        <div className="relative mx-auto flex aspect-square w-full max-h-48 flex-col items-center justify-center gap-3 sm:max-h-56 md:max-h-64">
          <div className="theme-drug-panel flex h-20 w-20 items-center justify-center rounded-2xl border border-drug-glow/50 text-drug-glow shadow-[0_0_24px_rgba(0,255,159,0.35)]">
            <MedicalCross className="h-10 w-10" aria-hidden="true" />
          </div>
          <span className="text-5xl" role="img" aria-label="Medication capsule">
            💊
          </span>
          <p className="max-w-[14rem] text-center text-xs font-medium uppercase tracking-[0.2em] text-drug-glow/80">
            Clinical compound profile
          </p>
        </div>
      </div>
    </figure>
  );
}
