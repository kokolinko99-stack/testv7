import { ImageResponse } from "next/og";

export const alt = "Kristiyan Yordanov — Video Editor & Graphic Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#050505",
          color: "#f3f3ed",
          padding: "58px 64px",
          fontFamily: "Arial, sans-serif",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", right: -80, top: -140, width: 600, height: 600, borderRadius: 999, background: "radial-gradient(circle, rgba(20,162,52,.55), rgba(105,255,84,0) 67%)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 2 }}>
          <span>KRISTIYAN YORDANOV</span>
          <span style={{ color: "#14A234" }}>THRTYSIX</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: .82, fontSize: 104, fontWeight: 900, letterSpacing: -5 }}>
          <span>VIDEO EDITOR</span>
          <span>&amp; GRAPHIC DESIGNER</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#a6a6a0" }}>
          <span>SELECTED EDITS. MOTION. DESIGN.</span>
          <span>BULGARIA / WORLDWIDE</span>
        </div>
      </div>
    ),
    size
  );
}
