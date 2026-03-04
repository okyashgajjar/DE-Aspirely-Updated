import { NextResponse, type NextRequest } from "next/server";
import type { SkillGap, User, OnboardingProfile } from "@/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { profileUpdateSchema, type ProfileUpdateRequest } from "@/lib/validations/profile";
import { fetchAdzunaJobs } from "@/lib/adzuna";
import {
  cosineSimilarity,
  extractSkillsFromJobs,
  normalizeSkill,
} from "@/lib/skills";

async function getAuthUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, userId: null as string | null };
  }

  return { supabase, userId: user.id as string };
}

async function loadFullProfile(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  userId: string,
): Promise<{
  user: User | null;
  onboarding_profile: OnboardingProfile | null;
  skill_gap: SkillGap | null;
}> {
  const [userRow, onboardingRow, gapRow] = await Promise.all([
    supabase
      .from("users")
      .select("id, email, name, avatar, bio, location, created_at, deleted_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("onboarding_profiles")
      .select(
        "id, user_id, skills, interests, experience_level, education, goals, completed_at",
      )
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("skill_gaps")
      .select(
        "user_id, user_skills, job_skills, missing_skills, similarity_score, source_job_ids, computed_at",
      )
      .eq("user_id", userId)
      .order("computed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const userData = userRow.data
    ? ({
      id: userRow.data.id,
      email: userRow.data.email,
      name: userRow.data.name,
      avatar: userRow.data.avatar,
      bio: userRow.data.bio,
      location: userRow.data.location,
      created_at: userRow.data.created_at,
      deleted_at: userRow.data.deleted_at,
    } satisfies User)
    : null;

  const onboarding =
    onboardingRow.data &&
    ({
      id: onboardingRow.data.id,
      user_id: onboardingRow.data.user_id,
      skills: onboardingRow.data.skills ?? [],
      interests: onboardingRow.data.interests ?? [],
      experience_level: onboardingRow.data.experience_level,
      education: onboardingRow.data.education,
      goals: onboardingRow.data.goals ?? [],
      completed_at: onboardingRow.data.completed_at,
    } satisfies OnboardingProfile);

  const gap =
    gapRow.data &&
    ({
      user_id: gapRow.data.user_id,
      user_skills: gapRow.data.user_skills ?? [],
      job_skills: gapRow.data.job_skills ?? [],
      missing_skills: gapRow.data.missing_skills ?? [],
      similarity_score: gapRow.data.similarity_score ?? 0,
      source_job_ids: gapRow.data.source_job_ids ?? [],
      computed_at: gapRow.data.computed_at,
    } satisfies SkillGap);

  return {
    user: userData,
    onboarding_profile: onboarding ?? null,
    skill_gap: gap ?? null,
  };
}

export async function GET() {
  try {
    const { supabase, userId } = await getAuthUser();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const profile = await loadFullProfile(supabase, userId);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("GET /api/profile error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { supabase, userId } = await getAuthUser();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return new NextResponse("Invalid JSON body", { status: 400 });
    }

    const parsed = profileUpdateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const body: ProfileUpdateRequest = parsed.data;

    const [userRow, onboardingRow] = await Promise.all([
      supabase
        .from("users")
        .select("id, email, name, avatar, bio, location, created_at, deleted_at")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("onboarding_profiles")
        .select(
          "id, user_id, skills, interests, experience_level, education, goals, completed_at",
        )
        .eq("user_id", userId)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (userRow.error) {
      console.error("Failed to load user", userRow.error);
      return NextResponse.json(
        { error: "Failed to load user" },
        { status: 500 },
      );
    }

    const nowIso = new Date().toISOString();

    if (body.name !== undefined || body.bio !== undefined || body.location !== undefined || body.avatar !== undefined) {
      const update: Record<string, unknown> = {};
      if (body.name !== undefined) update.name = body.name;
      if (body.bio !== undefined) update.bio = body.bio;
      if (body.location !== undefined) update.location = body.location;
      if (body.avatar !== undefined) update.avatar = body.avatar;

      const { error: userUpdateError } = await supabase
        .from("users")
        .update(update)
        .eq("id", userId);

      if (userUpdateError) {
        console.error("Failed to update user", userUpdateError);
        return NextResponse.json(
          { error: "Failed to update user" },
          { status: 500 },
        );
      }
    }

    const existingOnboarding = onboardingRow.data;

    let skillsChanged = false;

    if (
      body.skills !== undefined ||
      body.interests !== undefined ||
      body.experience_level !== undefined ||
      body.education !== undefined ||
      body.goals !== undefined
    ) {
      const nextSkills =
        body.skills ?? (existingOnboarding?.skills as string[] | null) ?? [];
      const nextInterests =
        body.interests ??
        ((existingOnboarding?.interests as string[] | null) ?? []);
      const nextExperience =
        body.experience_level ?? existingOnboarding?.experience_level ?? null;
      const nextEducation =
        body.education ?? existingOnboarding?.education ?? null;
      const nextGoals =
        body.goals ?? (existingOnboarding?.goals as string[] | null) ?? [];

      const prevSkills =
        (existingOnboarding?.skills as string[] | null) ?? [];

      const prevSet = new Set(prevSkills.map(normalizeSkill));
      const nextSet = new Set(nextSkills.map(normalizeSkill));

      if (prevSet.size !== nextSet.size) {
        skillsChanged = true;
      } else {
        for (const s of prevSet) {
          if (!nextSet.has(s)) {
            skillsChanged = true;
            break;
          }
        }
      }

      const upsertPayload = {
        user_id: userId,
        skills: nextSkills,
        interests: nextInterests,
        experience_level: nextExperience,
        education: nextEducation,
        goals: nextGoals,
        completed_at: existingOnboarding?.completed_at ?? nowIso,
      };

      let onboardingError;
      if (existingOnboarding) {
        const { error } = await supabase
          .from("onboarding_profiles")
          .update(upsertPayload)
          .eq("user_id", userId);
        onboardingError = error;
      } else {
        const { error } = await supabase
          .from("onboarding_profiles")
          .insert(upsertPayload);
        onboardingError = error;
      }

      if (onboardingError) {
        console.error("Failed to update onboarding profile", onboardingError);
        return NextResponse.json(
          { error: "Failed to update onboarding profile" },
          { status: 500 },
        );
      }

      if (skillsChanged) {
        try {
          const nonEmptySkills = nextSkills.map(normalizeSkill).filter(Boolean);
          const queryTokens =
            nonEmptySkills.length > 0
              ? nonEmptySkills
              : nextGoals.length > 0
                ? nextGoals
                : nextInterests;

          const whatQuery =
            queryTokens.length > 0
              ? queryTokens.join(" ")
              : "software engineer";

          const { jobs } = await fetchAdzunaJobs({
            what: whatQuery,
            resultsPerPage: 5,
          });

          const jobSkills = extractSkillsFromJobs(jobs);
          const userSkillsNorm = Array.from(
            new Set(nextSkills.map(normalizeSkill).filter(Boolean)),
          );
          const jobSkillsNorm = Array.from(
            new Set(jobSkills.map(normalizeSkill).filter(Boolean)),
          );

          const similarity = cosineSimilarity(userSkillsNorm, jobSkillsNorm);
          const missingSkills = jobSkillsNorm.filter(
            (skill) => !userSkillsNorm.includes(skill),
          );
          const sourceJobIds = jobs.map((j) => j.id);

          await supabase.from("skill_gaps").delete().eq("user_id", userId);
          await supabase
            .from("skill_gaps")
            .insert(
              {
                user_id: userId,
                user_skills: userSkillsNorm,
                job_skills: jobSkillsNorm,
                missing_skills: missingSkills,
                similarity_score: similarity,
                source_job_ids: sourceJobIds,
                computed_at: nowIso,
              }
            );
        } catch (err) {
          console.error("Failed to recompute skill gaps", err);
        }
      }
    }

    await supabase.from("analytics_events").insert({
      user_id: userId,
      event_type: "profile_updated",
      metadata: {},
    });

    const profile = await loadFullProfile(supabase, userId);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("PATCH /api/profile error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const { supabase, userId } = await getAuthUser();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const nowIso = new Date().toISOString();

    const { error: userUpdateError } = await supabase
      .from("users")
      .update({
        deleted_at: nowIso,
        name: "Deleted User",
        email: null,
        avatar: null,
        bio: null,
        location: null,
      })
      .eq("id", userId);

    if (userUpdateError) {
      console.error("Failed to soft delete user", userUpdateError);
      return NextResponse.json(
        { error: "Failed to delete account" },
        { status: 500 },
      );
    }

    const tablesWithUserId = [
      "chat_history",
      "analytics_events",
      "mock_interviews",
      "settings",
      "skill_gaps",
      "onboarding_profiles",
    ] as const;

    for (const table of tablesWithUserId) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("user_id", userId);
      if (error) {
        console.error(`Failed to delete from ${table}`, error);
      }
    }

    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/profile error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

