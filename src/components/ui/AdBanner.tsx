"use client";

import { useEffect } from "react";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "autorelaxed";
  responsive?: "true" | "false";
  className?: string;
}

export function AdBanner({
  slot,
  format = "auto",
  responsive = "true",
  className = "",
}: AdBannerProps) {
  useEffect(() => {
    try {
      ((window as Window & { adsbygoogle?: unknown[] }).adsbygoogle =
        (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle || []).push(
        {},
      );
    } catch (error) {
      console.error("AdSense execution catch:", error);
    }
  }, [slot]);

  return (
    <div
      className={`flex w-full select-none items-center justify-center overflow-hidden ${className}`}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8123473649158632"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
