import type { Metadata } from "next";
import { SettingsClient } from "@/app/settings/settings-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Settings";
  const description = "Control notifications, theme, and account safety.";
  return {
    title,
    description,
    alternates: {
      canonical: "/settings",
    },
    openGraph: {
      title,
      description,
      url: "/settings",
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

export default function SettingsPage() {
  return <SettingsClient />;
}

