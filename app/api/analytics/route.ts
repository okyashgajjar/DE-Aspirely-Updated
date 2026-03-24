import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { analyticsEvents, onboardingProfiles, users, mockInterviews } from "@/db/schema";
import { getSessionUserId } from "@/lib/session";
import { eq, desc } from "drizzle-orm";
import { fetchAdzunaHistory, fetchAdzunaGeodata, fetchAdzunaHistogram, fetchAdzunaJobs } from "@/lib/adzuna";
import type { MarketAnalyticsSnapshot, MockInterview } from "@/types";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  // 1. Fetch User Data
  const [user, profile, events, pastInterviews] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, userId),
    }),
    db.query.onboardingProfiles.findFirst({
      where: eq(onboardingProfiles.userId, userId),
      orderBy: [desc(onboardingProfiles.completed_at)],
    }),
    db.query.analyticsEvents.findMany({
      where: eq(analyticsEvents.userId, userId),
      orderBy: [desc(analyticsEvents.created_at)],
      limit: 100,
    }),
    db.query.mockInterviews.findMany({
      where: eq(mockInterviews.userId, userId),
      orderBy: [desc(mockInterviews.created_at)],
    }),
  ]);

  // 2. Determine Context
  const goals = (profile?.goals as string[]) || [];
  const primaryRole = goals[0] || "Software Engineer";
  const rawLocation = user?.location || "";
  const simplifiedLocation = rawLocation.split(',')[0].trim();
  const country = /india|ahmedabad|mumbai|delhi|bangalore|bengaluru/i.test(rawLocation) ? "in" : "gb";

  // 3. Fetch Market Data (Adzuna)
  const [history, geodata, histogram] = await Promise.all([
    fetchAdzunaHistory({ what: primaryRole, country, location: simplifiedLocation || undefined }),
    fetchAdzunaGeodata({ what: primaryRole, country }),
    fetchAdzunaHistogram({ what: primaryRole, country, location: simplifiedLocation || undefined }),
  ]);

  // 4. FALLBACK: If Adzuna history/histogram is empty (common for non-UK/US regions), provide simulated data
  if (Object.keys(history.month || {}).length === 0) {
    console.log(`[Analytics] History empty for ${country}, generating fallback.`);
    const baseSalary = country === "in" ? 800000 : 50000;
    const months = ["2023-10", "2023-11", "2023-12", "2024-01", "2024-02", "2024-03"];
    history.month = {};
    months.forEach((m, i) => {
      history.month[m] = baseSalary + (i * (baseSalary * 0.02)) + (Math.random() * 1000);
    });
  }

  if (Object.keys(histogram.histogram || {}).length === 0) {
    console.log(`[Analytics] Histogram empty for ${country}, generating fallback.`);
    const base = country === "in" ? 400000 : 30000;
    const step = country === "in" ? 200000 : 10000;
    histogram.histogram = {
      [base]: 12,
      [base + step]: 25,
      [base + step * 2]: 45,
      [base + step * 3]: 30,
      [base + step * 4]: 15,
    };
  }

  // 5. Activity Aggregation
  const jobsViewed = events.filter(e => e.event_type === "job_clicked").length;
  const coursesViewed = events.filter(e => e.event_type === "course_clicked").length;
  const interviewsDone = pastInterviews.length;
  const avgScore = pastInterviews.length > 0 
    ? Math.round(pastInterviews.reduce((acc, curr) => acc + (curr.score || 0), 0) / pastInterviews.length)
    : 0;

  // 6. Build Snapshot
  const snapshot: MarketAnalyticsSnapshot = {
    marketData: {
      salaryHistory: history.month || {},
      regionalDemand: geodata.locations || [],
      salaryDistribution: histogram.histogram || {},
      skillDemand: [
        { skill: "React", count: 85 },
        { skill: "TypeScript", count: 72 },
        { skill: "Node.js", count: 64 },
        { skill: "Next.js", count: 58 },
        { skill: "Docker", count: 42 },
      ],
    },
    activitySummary: {
      jobsViewed,
      coursesViewed,
      interviewsDone,
      avgInterviewScore: avgScore,
    },
    context: {
      primaryRole,
      location: simplifiedLocation || "Global",
      country,
    },
  };

  return NextResponse.json({ 
    ...snapshot, 
    events, 
    pastMockInterviews: pastInterviews as MockInterview[] 
  });
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  let body: { event_type: string; metadata?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const { event_type, metadata = {} } = body;
  if (!event_type) return new NextResponse("Missing event_type", { status: 400 });

  await db.insert(analyticsEvents).values({
    id: crypto.randomUUID(),
    userId,
    event_type,
    metadata,
    created_at: new Date(),
  });

  return NextResponse.json({ success: true });
}
