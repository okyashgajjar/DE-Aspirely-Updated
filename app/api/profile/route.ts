import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { users, onboardingProfiles, skillGaps, chatHistory, analyticsEvents, mockInterviews, settings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUserId } from "@/lib/session";
import { profileUpdateSchema, type ProfileUpdateRequest } from "@/lib/validations/profile";
import { fetchAdzunaJobs } from "@/lib/adzuna";
import { cosineSimilarity, extractSkillsFromJobs, normalizeSkill } from "@/lib/skills";

async function loadFullProfile(userId: string) {
  const [userRow, onboardingRow, gapRow] = await Promise.all([
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

  const user = userRow ? {
    id: userRow.id,
    email: userRow.email,
    name: userRow.name,
    avatar: userRow.avatar,
    bio: userRow.bio,
    location: userRow.location,
    created_at: userRow.created_at.toISOString(),
    deleted_at: userRow.deleted_at?.toISOString() ?? null,
  } : null;

  const onboardingProfile = onboardingRow ? {
    id: onboardingRow.id,
    user_id: onboardingRow.userId,
    skills: onboardingRow.skills as string[] ?? [],
    interests: onboardingRow.interests as string[] ?? [],
    experience_level: onboardingRow.experience_level,
    education: onboardingRow.education,
    goals: onboardingRow.goals as string[] ?? [],
    completed_at: onboardingRow.completed_at?.toISOString() ?? null,
  } : null;

  const skill_gap = gapRow ? {
    user_id: gapRow.userId,
    user_skills: gapRow.user_skills as string[] ?? [],
    job_skills: gapRow.job_skills as string[] ?? [],
    missing_skills: gapRow.missing_skills as string[] ?? [],
    similarity_score: gapRow.similarity_score,
    source_job_ids: gapRow.source_job_ids as string[] ?? [],
    computed_at: gapRow.computed_at.toISOString(),
  } : null;

  return { user, onboarding_profile: onboardingProfile, skill_gap };
}

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    const profile = await loadFullProfile(userId);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("GET /api/profile error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    let rawBody: unknown;
    try { rawBody = await req.json(); }
    catch { return new NextResponse("Invalid JSON body", { status: 400 }); }

    const parsed = profileUpdateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const body: ProfileUpdateRequest = parsed.data;
    const now = new Date();

    if (body.name !== undefined || body.bio !== undefined || body.location !== undefined || body.avatar !== undefined) {
      const updatePayload: Record<string, string | null> = {};
      if (body.name !== undefined) updatePayload.name = body.name;
      if (body.bio !== undefined) updatePayload.bio = body.bio;
      if (body.location !== undefined) updatePayload.location = body.location;
      if (body.avatar !== undefined) updatePayload.avatar = body.avatar;
      await db.update(users).set(updatePayload).where(eq(users.id, userId));
    }

    const existingOnboarding = await db.query.onboardingProfiles.findFirst({
      where: eq(onboardingProfiles.userId, userId)
    });

    let skillsChanged = false;

    if (body.skills !== undefined || body.interests !== undefined || body.experience_level !== undefined || body.education !== undefined || body.goals !== undefined) {
      const nextSkills = body.skills ?? (existingOnboarding?.skills as string[] ?? []);
      const nextInterests = body.interests ?? (existingOnboarding?.interests as string[] ?? []);
      const nextExperience = body.experience_level ?? existingOnboarding?.experience_level ?? null;
      const nextEducation = body.education ?? existingOnboarding?.education ?? null;
      const nextGoals = body.goals ?? (existingOnboarding?.goals as string[] ?? []);
      
      const prevSkills = (existingOnboarding?.skills as string[] ?? []);
      const prevSet = new Set(prevSkills.map(normalizeSkill));
      const nextSet = new Set(nextSkills.map(normalizeSkill));
      skillsChanged = prevSet.size !== nextSet.size || [...prevSet].some(s => !nextSet.has(s));

      const upsertPayload = {
        skills: nextSkills, interests: nextInterests,
        experience_level: nextExperience, education: nextEducation, goals: nextGoals,
        completed_at: existingOnboarding?.completed_at ?? now,
      };

      if (existingOnboarding) {
        await db.update(onboardingProfiles).set(upsertPayload).where(eq(onboardingProfiles.id, existingOnboarding.id));
      } else {
        await db.insert(onboardingProfiles).values({
          id: crypto.randomUUID(),
          userId,
          ...upsertPayload
        });
      }

      if (skillsChanged) {
        try {
          const nonEmptySkills = nextSkills.map(normalizeSkill).filter(Boolean);
          const queryTokens = nonEmptySkills.length > 0 ? nonEmptySkills : nextGoals.length > 0 ? nextGoals : nextInterests;
          const { jobs } = await fetchAdzunaJobs({ what: queryTokens.join(" ") || "software engineer", resultsPerPage: 5 });
          const jobSkills = extractSkillsFromJobs(jobs);
          const userSkillsNorm = Array.from(new Set(nextSkills.map(normalizeSkill).filter(Boolean)));
          const jobSkillsNorm = Array.from(new Set(jobSkills.map(normalizeSkill).filter(Boolean)));
          
          await db.delete(skillGaps).where(eq(skillGaps.userId, userId));
          await db.insert(skillGaps).values({
            id: crypto.randomUUID(),
            userId,
            user_skills: userSkillsNorm,
            job_skills: jobSkillsNorm,
            missing_skills: jobSkillsNorm.filter(s => !userSkillsNorm.includes(s)),
            similarity_score: cosineSimilarity(userSkillsNorm, jobSkillsNorm),
            source_job_ids: jobs.map(j => j.id),
            computed_at: now,
          });
        } catch (err) {
          console.error("Failed to recompute skill gaps", err);
        }
      }
    }

    await db.insert(analyticsEvents).values({
      id: crypto.randomUUID(),
      userId,
      event_type: "profile_updated",
      metadata: {}
    });

    const profile = await loadFullProfile(userId);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("PATCH /api/profile error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await db.update(users)
      .set({
        deleted_at: new Date(),
        name: "Deleted User",
        email: `deleted_${userId}@aspirely.app`,
        avatar: null,
        bio: null,
        location: null
      })
      .where(eq(users.id, userId));

    // Drizzle doesn't have a direct equivalent to $transaction for multiple deleteManys as easily as Prisma
    // but better-sqlite3 handles them fast anyway.
    await db.delete(chatHistory).where(eq(chatHistory.userId, userId));
    await db.delete(analyticsEvents).where(eq(analyticsEvents.userId, userId));
    await db.delete(mockInterviews).where(eq(mockInterviews.userId, userId));
    await db.delete(settings).where(eq(settings.userId, userId));
    await db.delete(skillGaps).where(eq(skillGaps.userId, userId));
    await db.delete(onboardingProfiles).where(eq(onboardingProfiles.userId, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/profile error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
