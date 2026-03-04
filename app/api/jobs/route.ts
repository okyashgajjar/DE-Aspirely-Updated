import { NextResponse, type NextRequest } from "next/server";
import type { JobsApiResponse, JobListing } from "@/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAdzunaJobs } from "@/lib/adzuna";

type Mode = "skills" | "profile" | "location";

async function getAuthUserAndProfile() {
  const supabase = await getSupabaseServerClient();

  const [
    {
      data: { user },
      error: userError,
    },
    { data: onboardingProfile },
    { data: userRow },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("onboarding_profiles")
      .select("skills, experience_level, education, goals, interests")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("users").select("location").limit(1).maybeSingle(),
  ]);

  if (userError || !user) {
    return { supabase, userId: null as string | null, onboardingProfile: null, userLocation: null as string | null };
  }

  return {
    supabase,
    userId: user.id as string,
    onboardingProfile,
    userLocation: (userRow?.location as string | null) ?? null,
  };
}

function buildAdzunaQuery(
  mode: Mode | null,
  onboardingProfile: {
    skills?: string[] | null;
    experience_level?: string | null;
    education?: string | null;
    goals?: string[] | null;
  } | null,
  userLocation: string | null,
  explicitLocation: string | null,
): { what: string; where?: string } {
  const skills = (onboardingProfile?.skills ?? []) as string[];
  const goals = (onboardingProfile?.goals ?? []) as string[];
  const experience = onboardingProfile?.experience_level ?? "";
  const education = onboardingProfile?.education ?? "";

  const baseTokens: string[] = [];

  if (skills.length > 0) {
    baseTokens.push(...skills);
  }

  const effectiveMode: Mode =
    mode ?? (skills.length > 0 ? "skills" : "profile");

  if (effectiveMode === "profile") {
    if (experience) baseTokens.push(experience);
    if (education) baseTokens.push(education);
    if (goals.length > 0) baseTokens.push(...goals);
  }

  const what =
    baseTokens.length > 0
      ? baseTokens.join(" ")
      : "software engineer";

  const where =
    effectiveMode === "location"
      ? explicitLocation?.trim() || userLocation || undefined
      : undefined;

  return { what, where };
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const modeParam = searchParams.get("mode");
    const mode: Mode | null =
      modeParam === "skills" || modeParam === "profile" || modeParam === "location"
        ? modeParam
        : null;

    const pageRaw = searchParams.get("page");
    const page = Number.isNaN(Number(pageRaw)) || !pageRaw ? 1 : Math.max(1, Number(pageRaw));

    const explicitLocation = searchParams.get("location");

    const { supabase, userId, onboardingProfile, userLocation } =
      await getAuthUserAndProfile();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { what, where } = buildAdzunaQuery(
      mode,
      onboardingProfile,
      userLocation,
      explicitLocation,
    );

    let jobs: JobListing[] = [];
    let total = 0;

    try {
      const result = await fetchAdzunaJobs({
        what,
        where,
        resultsPerPage: 10,
        page,
      });
      jobs = result.jobs;
      total = result.total;
    } catch (err) {
      console.error("Adzuna fetch failed", err);
      return NextResponse.json(
        { error: "Failed to fetch jobs from Adzuna" },
        { status: 502 },
      );
    }

    const responseBody: JobsApiResponse = {
      jobs,
      total,
      page,
    };

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("GET /api/jobs error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

