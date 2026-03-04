import type { Metadata } from "next";
import JobsClient from "@/app/jobs/jobs-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Jobs";
  const description =
    "Browse skill-based job matches, refine by profile, or search by location.";
  return {
    title,
    description,
    alternates: {
      canonical: "/jobs",
    },
    openGraph: {
      title,
      description,
      url: "/jobs",
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

export default function JobsPage() {
  return <JobsClient />;
}

