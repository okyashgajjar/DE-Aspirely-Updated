import type { Metadata } from "next";
import { ChatbotClient } from "@/app/chatbot/chatbot-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Chatbot";
  const description =
    "Ask Aspirely anything—career plans, job search strategy, interview prep.";
  return {
    title,
    description,
    alternates: {
      canonical: "/chatbot",
    },
    openGraph: {
      title,
      description,
      url: "/chatbot",
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

export default function ChatbotPage() {
  return <ChatbotClient />;
}

