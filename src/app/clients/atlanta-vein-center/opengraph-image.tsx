import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "InflowMD — Confidential Growth Strategy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #1A1A2E 0%, #12122a 60%, #0d0d24 100%)",
          color: "white",
          padding: "80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              padding: "8px 14px",
              background: "rgba(245,158,11,0.18)",
              border: "1px solid rgba(245,158,11,0.5)",
              color: "#fcd34d",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              borderRadius: 999,
            }}
          >
            ● Confidential
          </div>
          <div style={{ color: "#94a3b8", fontSize: 22, fontWeight: 600, letterSpacing: 2 }}>
            InflowMD
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              color: "#4A8AF4",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Growth Strategy
          </div>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05 }}>
            Confidential Growth Strategy —
            <br />
            <span style={{ color: "#4A8AF4" }}>Atlanta Vein Center</span>
          </div>
        </div>

        <div style={{ color: "#94a3b8", fontSize: 22, fontWeight: 500 }}>
          Prepared July 2026 · inflowmd.com
        </div>
      </div>
    ),
    { ...size }
  );
}
