import type { Metadata } from "next";
import { ProfileClient } from "@/app/profile/profile-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Profile";
  const description =
    "Update your skills, interests, experience, goals, education, and location.";
  return {
    title,
    description,
    alternates: {
      canonical: "/profile",
    },
    openGraph: {
      title,
      description,
      url: "/profile",
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

export default function ProfilePage() {
  return <ProfileClient />;
}

