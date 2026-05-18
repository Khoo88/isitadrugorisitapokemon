import { ImageResponse } from "next/og";
import { DEFAULT_TITLE } from "@/lib/site";

export const alt = DEFAULT_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(145deg, #020810 0%, #0a1220 45%, #1a0a0a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "rgba(0, 255, 159, 0.15)",
              border: "2px solid rgba(0, 255, 159, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
            }}
          >
            💊
          </div>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "rgba(238, 21, 21, 0.2)",
              border: "2px solid rgba(238, 21, 21, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
            }}
          >
            ⚡
          </div>
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#f5f5dc",
            textAlign: "center",
            padding: "0 48px",
            lineHeight: 1.15,
          }}
        >
          Drug or Pokémon?
        </div>
        <p
          style={{
            marginTop: 20,
            fontSize: 26,
            color: "#7a8fa8",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          Pharmaceutical vs Pocket Monster — the ultimate name quiz
        </p>
      </div>
    ),
    { ...size },
  );
}
