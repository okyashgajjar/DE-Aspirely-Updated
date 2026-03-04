import type { Metadata } from "next";
import { LogoutClient } from "@/app/logout/logout-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Logout",
  description: "Signing you out.",
  openGraph: {
    title: "Logout",
    description: "Signing you out.",
    url: "/logout",
    images: [
      {
        url: "/api/og?title=Logout&description=Signing%20you%20out.",
      },
    ],
  },
  alternates: {
    canonical: "/logout",
  },
};

export default function LogoutPage() {
  return <LogoutClient />;
}

