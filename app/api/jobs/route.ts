import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { onboardingProfiles, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUserId } from "@/lib/session";
import { fetchAdzunaJobs } from "@/lib/adzuna";
import type { JobListing } from "@/types";

type Mode = "skills" | "profile" | "location";

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const url = new URL(req.url);
    const modeParam = url.searchParams.get("mode");
    const mode: Mode | null = (modeParam === "skills" || modeParam === "profile" || modeParam === "location") ? modeParam : null;
    const pageRaw = url.searchParams.get("page");
    const page = Number.isNaN(Number(pageRaw)) || !pageRaw ? 1 : Math.max(1, Number(pageRaw));
    const explicitLocation = url.searchParams.get("location");

    const [profile, userRow] = await Promise.all([
      db.query.onboardingProfiles.findFirst({
        where: eq(onboardingProfiles.userId, userId),
        orderBy: [desc(onboardingProfiles.completed_at)],
      }),
      db.query.users.findFirst({
        where: eq(users.id, userId),
      }),
    ]);

    const skills = (profile?.skills as string[] ?? []);
    const goals = (profile?.goals as string[] ?? []);
    const experience = profile?.experience_level ?? "";
    const education = profile?.education ?? "";
    const userLocation = userRow?.location ?? null;

    const baseTokens: string[] = [];
    if (skills.length > 0) baseTokens.push(...skills);
    const effectiveMode: Mode = mode ?? (skills.length > 0 ? "skills" : "profile");

    if (effectiveMode === "profile") {
      if (experience) baseTokens.push(experience);
      if (education) baseTokens.push(education);
      if (goals.length > 0) baseTokens.push(...goals);
    }

    const what = baseTokens.length > 0 ? baseTokens.slice(0, 2).join(" ") : "professional";
    const where = effectiveMode === "location" ? explicitLocation?.trim() || userLocation || undefined : undefined;

    let jobs: JobListing[] = [];
    let total = 0;

    try {
      const result = await fetchAdzunaJobs({ what, where, resultsPerPage: 10, page });
      jobs = result.jobs;
      total = result.total;
    } catch (err) {
      console.error("Adzuna fetch failed", err);
      return NextResponse.json({ error: "Failed to fetch jobs from Adzuna" }, { status: 502 });
    }

    return NextResponse.json({ jobs, total, page });
  } catch (error) {
    console.error("GET /api/jobs error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
