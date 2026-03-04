import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "ASPIRELY";
  const description =
    searchParams.get("description") ??
    "Personalized skill gap coaching and career navigation.";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background:
            "linear-gradient(135deg, rgba(2,6,23,1) 0%, rgba(15,23,42,1) 40%, rgba(2,6,23,1) 100%)",
          color: "white",
          fontFamily: "ui-sans-serif, system-ui",
        }}
      >
        <div style={{ fontSize: 18, letterSpacing: 6, opacity: 0.8 }}>
          ASPIRELY
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05 }}>
            {title}
          </div>
          <div style={{ fontSize: 28, opacity: 0.86, maxWidth: 900 }}>
            {description}
          </div>
        </div>
        <div style={{ fontSize: 18, opacity: 0.75 }}>
          Your AI Career Advisor
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

