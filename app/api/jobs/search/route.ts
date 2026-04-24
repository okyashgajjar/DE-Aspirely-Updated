import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { onboardingProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUserId } from "@/lib/session";
import { fetchAdzunaJobs } from "@/lib/adzuna";

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const url = new URL(req.url);
    const role = url.searchParams.get("role") || "";
    const skills = url.searchParams.get("skills") || "";
    const location = url.searchParams.get("location") || "";
    const pageRaw = url.searchParams.get("page");
    const page = Number.isNaN(Number(pageRaw)) || !pageRaw ? 1 : Math.max(1, Number(pageRaw));

    const onboardingRow = await db.query.onboardingProfiles.findFirst({
        where: eq(onboardingProfiles.userId, userId),
        orderBy: [desc(onboardingProfiles.completed_at)],
    });

    const searchWhat = [role, skills].filter(Boolean).join(" ") || (onboardingRow?.skills as string[] ?? []).slice(0, 2).join(" ") || "professional";
    const rawWhere = location.trim() || onboardingRow?.education || "";
    const simplifiedWhere = rawWhere.split(',')[0].trim();
    
    // Auto-detect country for common India keywords
    const country = /india|ahmedabad|mumbai|delhi|bangalore|bengaluru/i.test(rawWhere) ? "in" : "gb";

    console.log(`[JobsSearch] Searching: ${searchWhat} in ${simplifiedWhere} (Country: ${country})`);

    const { jobs, total } = await fetchAdzunaJobs({
      what: searchWhat,
      where: simplifiedWhere || undefined,
      country,
      resultsPerPage: 10,
      page
    });

    console.log(`[JobsSearch] Found ${jobs.length}/${total} jobs.`);

    const hasMore = total > page * 10;

    return NextResponse.json({ jobs, total, page, hasMore });
  } catch (error) {
    console.error("GET /api/jobs/search error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
