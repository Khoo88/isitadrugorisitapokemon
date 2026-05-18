import Image from "next/image";
import Link from "next/link";
import logoIcon from "@/app/icon.png";

type BrandLogoSize = "hero" | "compact";

const sizeClasses: Record<BrandLogoSize, string> = {
  hero: "h-24 w-24 sm:h-32 sm:w-32 drop-shadow-[0_0_24px_rgba(255,107,157,0.35)]",
  compact:
    "h-14 w-14 sm:h-16 sm:w-16 drop-shadow-[0_0_16px_rgba(255,107,157,0.3)]",
};

interface BrandLogoProps {
  size?: BrandLogoSize;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({
  size = "hero",
  className = "",
  priority = false,
}: BrandLogoProps) {
  return (
    <Link
      href="/"
      aria-label="Return to lobby"
      className={`inline-block rounded-2xl transition duration-200 hover:scale-105 hover:opacity-90 active:scale-95 ${className}`}
    >
      <Image
        src={logoIcon}
        alt="Nurse Chansey — Drug or Pokémon? logo"
        width={size === "hero" ? 128 : 64}
        height={size === "hero" ? 128 : 64}
        priority={priority}
        className={`object-contain ${sizeClasses[size]}`}
      />
    </Link>
  );
}
