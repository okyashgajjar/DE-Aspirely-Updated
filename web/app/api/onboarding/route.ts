import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getServerEnv } from "@/lib/validations/env";
import {
  onboardingRequestSchema,
  type OnboardingRequest,
  type OnboardingResponse,
} from "@/lib/validations/onboarding";
import { fetchAdzunaJobs } from "@/lib/adzuna";
import {
  cosineSimilarity,
  extractSkillsFromJobs,
  normalizeSkill,
} from "@/lib/skills";

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const env = getServerEnv();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parseResult = onboardingRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parseResult.error.flatten() },
      { status: 400 },
    );
  }

  const payload: OnboardingRequest = parseResult.data;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    name,
    location,
    education,
    skills = [],
    experience_level,
    experience_history,
    interests = [],
    goals = [],
  } = payload;

  const nowIso = new Date().toISOString();

  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  const userPayload = {
    id: user.id,
    email: user.email ?? "",
    name,
    location,
    bio: experience_history,
  };

  let upsertUserError;

  if (existingUser) {
    const { error } = await supabase
      .from("users")
      .update(userPayload)
      .eq("id", user.id);
    upsertUserError = error;
  } else {
    const { error } = await supabase
      .from("users")
      .insert(userPayload);
    upsertUserError = error;
  }

  if (upsertUserError) {
    console.error("User upsert error:", upsertUserError);
    return NextResponse.json(
      { error: "Failed to save user profile" },
      { status: 500 },
    );
  }

  const { data: existingOnboarding } = await supabase
    .from("onboarding_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const payloadOnboarding = {
    user_id: user.id,
    skills,
    interests,
    experience_level,
    education,
    goals,
    completed_at: nowIso,
  };

  let onboardingInsert;
  let onboardingError;

  if (existingOnboarding) {
    const { data, error } = await supabase
      .from("onboarding_profiles")
      .update(payloadOnboarding)
      .eq("user_id", user.id)
      .select("*")
      .single();
    onboardingInsert = data;
    onboardingError = error;
  } else {
    const { data, error } = await supabase
      .from("onboarding_profiles")
      .insert(payloadOnboarding)
      .select("*")
      .single();
    onboardingInsert = data;
    onboardingError = error;
  }

  if (onboardingError || !onboardingInsert) {
    console.error("Onboarding insert error:", onboardingError);
    return NextResponse.json(
      { error: "Failed to save onboarding profile" },
      { status: 500 },
    );
  }

  let jobSkillGap:
    | {
      user_skills: string[];
      job_skills: string[];
      missing_skills: string[];
      similarity_score: number;
      source_job_ids: string[];
    }
    | null = null;

  try {
    const nonEmptySkills = skills.map(normalizeSkill).filter(Boolean);
    const queryTokens =
      nonEmptySkills.length > 0
        ? nonEmptySkills
        : goals.length > 0
          ? goals
          : interests;

    const whatQuery =
      queryTokens.length > 0 ? queryTokens.join(" ") : "software engineer";

    const { jobs } = await fetchAdzunaJobs({
      what: whatQuery,
      where: location,
      resultsPerPage: 5,
    });

    const jobSkills = extractSkillsFromJobs(jobs);
    const userSkillsNorm = Array.from(
      new Set(skills.map(normalizeSkill).filter(Boolean)),
    );
    const jobSkillsNorm = Array.from(
      new Set(jobSkills.map(normalizeSkill).filter(Boolean)),
    );

    const similarity = cosineSimilarity(userSkillsNorm, jobSkillsNorm);

    const missingSkills = jobSkillsNorm.filter(
      (skill) => !userSkillsNorm.includes(skill),
    );

    const sourceJobIds = jobs.map((j) => j.id);

    await supabase.from("skill_gaps").delete().eq("user_id", user.id);

    const { data: skillGapRow, error: skillGapError } = await supabase
      .from("skill_gaps")
      .insert(
        {
          user_id: user.id,
          user_skills: userSkillsNorm,
          job_skills: jobSkillsNorm,
          missing_skills: missingSkills,
          similarity_score: similarity,
          source_job_ids: sourceJobIds,
          computed_at: nowIso,
        }
      )
      .select("*")
      .single();

    if (!skillGapError && skillGapRow) {
      jobSkillGap = {
        user_skills: skillGapRow.user_skills ?? userSkillsNorm,
        job_skills: skillGapRow.job_skills ?? jobSkillsNorm,
        missing_skills: skillGapRow.missing_skills ?? missingSkills,
        similarity_score: skillGapRow.similarity_score ?? similarity,
        source_job_ids: skillGapRow.source_job_ids ?? sourceJobIds,
      };
    }
  } catch {
    jobSkillGap = null;
  }

  await supabase.from("analytics_events").insert({
    user_id: user.id,
    event_type: "onboarding_completed",
    metadata: {
      env: env.SUPABASE_PROJECT_URL,
      skills_count: skills.length,
    },
  });

  const responseBody: OnboardingResponse = {
    onboarding_profile: {
      id: onboardingInsert.id,
      user_id: onboardingInsert.user_id,
      skills: onboardingInsert.skills ?? [],
      interests: onboardingInsert.interests ?? [],
      experience_level: onboardingInsert.experience_level,
      education: onboardingInsert.education,
      goals: onboardingInsert.goals ?? [],
      completed_at: onboardingInsert.completed_at,
    },
    skill_gap: jobSkillGap
      ? {
        user_id: user.id,
        user_skills: jobSkillGap.user_skills,
        job_skills: jobSkillGap.job_skills,
        missing_skills: jobSkillGap.missing_skills,
        similarity_score: jobSkillGap.similarity_score,
        source_job_ids: jobSkillGap.source_job_ids,
        computed_at: nowIso,
      }
      : null,
  };

  return NextResponse.json(responseBody, { status: 201 });
}


