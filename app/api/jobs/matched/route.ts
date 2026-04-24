import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { users, onboardingProfiles, skillGaps } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUserId } from "@/lib/session";
import { fetchAdzunaJobs } from "@/lib/adzuna";

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const pageRaw = url.searchParams.get("page");
  const page = Number.isNaN(Number(pageRaw)) || !pageRaw ? 1 : Math.max(1, Number(pageRaw));
  const ITEMS_PER_PAGE = 10;

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

  const userSkillsList = (profile?.skills as string[]) || [];
  const interests = (profile?.interests as string[]) || [];
  
  // Use up to 2 skills/interests to keep search broad
  const searchTerms = [...userSkillsList, ...interests].filter(Boolean);
  const searchWhat = searchTerms.slice(0, 2).join(" ") || "professional";
  
  const rawLocation = user?.location || "";
  const simplifiedLocation = rawLocation.split(',')[0].trim();
  
  // Use 'in' country for India locations, else 'gb'
  const country = /india|ahmedabad|mumbai|delhi|bangalore|bengaluru/i.test(rawLocation) ? "in" : "gb";

  console.log(`[JobsMatched] Fetching for: ${searchWhat} in ${simplifiedLocation} (Country: ${country})`);

  // Fetch a larger pool of jobs (e.g. 50) to evaluate and rank locally
  const { jobs: rawJobs } = await fetchAdzunaJobs({
    what: searchWhat,
    where: simplifiedLocation || undefined,
    country,
    resultsPerPage: 50,
  });


  
  // Cross-validate skills and calculate match scores
  const evaluatedJobs = rawJobs.map((job) => {
    let matchScore = 0;
    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    if (userSkillsList.length === 0) {
      matchScore = 50; // Default if no skills to check
    } else {
      const jobText = `${job.title} ${job.description}`.toLowerCase();
      let matches = 0;

      for (const skill of userSkillsList) {
        // Use word boundaries for accurate skill matching (e.g. "C" vs "CSS")
        const regex = new RegExp(`\\b${skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(jobText)) {
          matches++;
          matchingSkills.push(skill);
        } else {
          missingSkills.push(skill);
        }
      }

      matchScore = Math.round((matches / userSkillsList.length) * 100);
    }

    return {
      ...job,
      matchScore,
      matchingSkills,
      missingSkills,
    };
  });

  // Sort strictly by match score descending
  evaluatedJobs.sort((a, b) => b.matchScore - a.matchScore);

  // Paginate the sorted results locally
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedJobs = evaluatedJobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const hasMore = evaluatedJobs.length > startIndex + ITEMS_PER_PAGE;

  console.log(`[JobsMatched] Found ${rawJobs.length} total, sorted and returning ${paginatedJobs.length} for page ${page}`);

  return NextResponse.json({ 
    jobs: paginatedJobs, 
    skill_gap: gap,
    userSkills: userSkillsList,
    userLocation: rawLocation,
    page,
    hasMore,
    total: evaluatedJobs.length
  });
}
