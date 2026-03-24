import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, onboardingProfiles, skillGaps, analyticsEvents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUserId } from "@/lib/session";
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
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = onboardingRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parseResult.error.flatten() },
      { status: 400 },
    );
  }

  const payload: OnboardingRequest = parseResult.data;
  const { name, location, education, skills = [], experience_level, experience_history, interests = [], goals = [] } = payload;
  const now = new Date();

  // Update user profile
  await db.update(users)
    .set({ name, location, bio: experience_history })
    .where(eq(users.id, userId));

  // Upsert onboarding profile
  const existingOnboarding = await db.query.onboardingProfiles.findFirst({
    where: eq(onboardingProfiles.userId, userId),
  });

  let onboardingRecord;
  if (existingOnboarding) {
    [onboardingRecord] = await db.update(onboardingProfiles)
      .set({ skills, interests, experience_level, education, goals, completed_at: now })
      .where(eq(onboardingProfiles.id, existingOnboarding.id))
      .returning();
  } else {
    [onboardingRecord] = await db.insert(onboardingProfiles)
      .values({
        id: crypto.randomUUID(),
        userId,
        skills,
        interests,
        experience_level,
        education,
        goals,
        completed_at: now
      })
      .returning();
  }

  // Compute skill gaps
  let jobSkillGap = null;
  try {
    const nonEmptySkills = skills.map(normalizeSkill).filter(Boolean);
    const queryTokens = nonEmptySkills.length > 0 ? nonEmptySkills : goals.length > 0 ? goals : interests;
    const whatQuery = queryTokens.length > 0 ? queryTokens.join(" ") : "software engineer";

    const { jobs } = await fetchAdzunaJobs({ what: whatQuery, where: location, resultsPerPage: 5 });
    const jobSkills = extractSkillsFromJobs(jobs);
    const userSkillsNorm = Array.from(new Set(skills.map(normalizeSkill).filter(Boolean)));
    const jobSkillsNorm = Array.from(new Set(jobSkills.map(normalizeSkill).filter(Boolean)));
    const similarity = cosineSimilarity(userSkillsNorm, jobSkillsNorm);
    const missingSkills = jobSkillsNorm.filter(s => !userSkillsNorm.includes(s));
    const sourceJobIds = jobs.map(j => j.id);

    await db.delete(skillGaps).where(eq(skillGaps.userId, userId));
    const [gapRow] = await db.insert(skillGaps)
      .values({
        id: crypto.randomUUID(),
        userId,
        user_skills: userSkillsNorm,
        job_skills: jobSkillsNorm,
        missing_skills: missingSkills,
        similarity_score: similarity,
        source_job_ids: sourceJobIds,
        computed_at: now,
      })
      .returning();

    jobSkillGap = {
      user_skills: gapRow.user_skills as string[],
      job_skills: gapRow.job_skills as string[],
      missing_skills: gapRow.missing_skills as string[],
      similarity_score: gapRow.similarity_score,
      source_job_ids: gapRow.source_job_ids as string[],
    };
  } catch (err) {
    console.error("Onboarding Gap recompute error", err);
    jobSkillGap = null;
  }

  // Log analytics event
  await db.insert(analyticsEvents).values({
    id: crypto.randomUUID(),
    userId,
    event_type: "onboarding_completed",
    metadata: { skills_count: skills.length },
  });

  const responseBody: OnboardingResponse = {
    onboarding_profile: {
      id: onboardingRecord.id,
      user_id: onboardingRecord.userId,
      skills: onboardingRecord.skills as string[] ?? [],
      interests: onboardingRecord.interests as string[] ?? [],
      experience_level: onboardingRecord.experience_level,
      education: onboardingRecord.education,
      goals: onboardingRecord.goals as string[] ?? [],
      completed_at: onboardingRecord.completed_at?.toISOString() ?? null,
    },
    skill_gap: jobSkillGap
      ? {
          user_id: userId,
          user_skills: jobSkillGap.user_skills,
          job_skills: jobSkillGap.job_skills,
          missing_skills: jobSkillGap.missing_skills,
          similarity_score: jobSkillGap.similarity_score,
          source_job_ids: jobSkillGap.source_job_ids,
          computed_at: now.toISOString(),
        }
      : null,
  };

  return NextResponse.json(responseBody, { status: 201 });
}
