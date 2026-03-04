import type { Metadata } from "next";
import { MockInterviewClient } from "@/app/mock-interview/mock-interview-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Mock Interview";
  const description =
    "Practice with voice or text, then review score, strengths, and improvements.";
  return {
    title,
    description,
    alternates: {
      canonical: "/mock-interview",
    },
    openGraph: {
      title,
      description,
      url: "/mock-interview",
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

export default function MockInterviewPage() {
  return <MockInterviewClient />;
}

