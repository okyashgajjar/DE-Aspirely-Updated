import type { Metadata } from "next";
import { AnalyticsClient } from "@/app/analytics/analytics-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Analytics";
  const description =
    "Activity heatmap, skills radar, interview scores, and your application funnel.";
  return {
    title,
    description,
    alternates: {
      canonical: "/analytics",
    },
    openGraph: {
      title,
      description,
      url: "/analytics",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(
            title,
          )}&description=${encodeURIComponent(description)}`,
        },
      ],
    },
  };
}

export default function AnalyticsPage() {
  return <AnalyticsClient />;
}

