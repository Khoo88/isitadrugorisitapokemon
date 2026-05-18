export function MedicalCross({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect
        x="13"
        y="4"
        width="6"
        height="24"
        rx="1"
        fill="currentColor"
        opacity="0.9"
      />
      <rect
        x="4"
        y="13"
        width="24"
        height="6"
        rx="1"
        fill="currentColor"
        opacity="0.9"
      />
      <rect
        x="13"
        y="4"
        width="6"
        height="24"
        rx="1"
        stroke="currentColor"
        strokeWidth="0.5"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}

export function PokeballIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      className={`block shrink-0 ${className}`}
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      {/* White ball (full circle — bottom half shows through) */}
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="#f5f5f5"
        stroke="#2a2a2a"
        strokeWidth="2"
      />
      {/* Red top half: left → over top → right (explicit arcs, no sweep ambiguity) */}
      <path
        d="M 2 24 A 22 22 0 0 1 24 2 A 22 22 0 0 1 46 24 Z"
        fill="#e3352d"
      />
      <line x1="2" y1="24" x2="46" y2="24" stroke="#2a2a2a" strokeWidth="3" />
      <circle
        cx="24"
        cy="24"
        r="7"
        fill="#f5f5f5"
        stroke="#2a2a2a"
        strokeWidth="2"
      />
      <circle cx="24" cy="24" r="3" fill="#2a2a2a" />
    </svg>
  );
}

export function HoloX({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <line
        x1="16"
        y1="16"
        x2="64"
        y2="64"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line
        x1="64"
        y1="16"
        x2="16"
        y2="64"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="16"
        x2="64"
        y2="64"
        stroke="#00ff9f"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="64"
        y1="16"
        x2="16"
        y2="64"
        stroke="#00ff9f"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
