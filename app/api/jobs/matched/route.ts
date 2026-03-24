import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, onboardingProfiles, skillGaps } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUserId } from "@/lib/session";
import { fetchAdzunaJobs } from "@/lib/adzuna";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const [user, profile, gap] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, userId),
    }),
    db.query.onboardingProfiles.findFirst({
      where: eq(onboardingProfiles.userId, userId),
      orderBy: [desc(onboardingProfiles.completed_at)],
    }),
    db.query.skillGaps.findFirst({
      where: eq(skillGaps.userId, userId),
      orderBy: [desc(skillGaps.computed_at)],
    }),
  ]);

  if (!profile) {
    return NextResponse.json({ 
      jobs: [], 
      userSkills: [], 
      userLocation: user?.location || "" 
    });
  }

  const goals = profile.goals as string[] ?? [];
  const primaryGoal = goals[0] || "software engineer";
  const rawLocation = user?.location || "";
  const simplifiedLocation = rawLocation.split(',')[0].trim();
  
  // Use 'in' country for India locations, else 'gb'
  const country = /india|ahmedabad|mumbai|delhi|bangalore|bengaluru/i.test(rawLocation) ? "in" : "gb";

  console.log(`[JobsMatched] Fetching for: ${primaryGoal} in ${simplifiedLocation} (Country: ${country})`);

  const { jobs } = await fetchAdzunaJobs({
    what: primaryGoal,
    where: simplifiedLocation || undefined,
    country,
    resultsPerPage: 10,
  });

  console.log(`[JobsMatched] Found ${jobs.length} jobs.`);

  return NextResponse.json({ 
    jobs, 
    skill_gap: gap,
    userSkills: profile?.skills || [],
    userLocation: user?.location || ""
  });
}
