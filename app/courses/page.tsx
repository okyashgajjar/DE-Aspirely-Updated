import type { Metadata } from "next";
import { CoursesClient } from "@/app/courses/courses-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Courses";
  const description =
    "Course recommendations grouped by missing skill tags to close your gaps faster.";
  return {
    title,
    description,
    alternates: {
      canonical: "/courses",
    },
    openGraph: {
      title,
      description,
      url: "/courses",
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

export default function CoursesPage() {
  return <CoursesClient />;
}

