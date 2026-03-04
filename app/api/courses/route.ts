import { NextResponse } from "next/server";
import type { CoursesApiResponse, Course } from "@/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchYouTubeCoursesForSkill } from "@/lib/youtube";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: gapRow, error: gapError } = await supabase
      .from("skill_gaps")
      .select("missing_skills")
      .eq("user_id", user.id)
      .order("computed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (gapError) {
      console.error("Failed to load skill gaps", gapError);
      return NextResponse.json(
        { error: "Failed to load skill gaps" },
        { status: 500 },
      );
    }

    const missingSkills = (gapRow?.missing_skills as string[] | null) ?? [];

    if (!gapRow || missingSkills.length === 0) {
      const emptyResponse: CoursesApiResponse = {
        courses: [],
        groupedBySkill: {},
        message: "Complete onboarding to get course suggestions",
      };
      return NextResponse.json(emptyResponse);
    }

    const allCourses: Course[] = [];

    await Promise.all(
      missingSkills.map(async (skill) => {
        try {
          const coursesForSkill = await fetchYouTubeCoursesForSkill(skill);
          allCourses.push(...coursesForSkill);
        } catch (err) {
          console.error(`YouTube fetch failed for skill ${skill}`, err);
        }
      }),
    );

    const groupedBySkill: Record<string, Course[]> = {};

    for (const course of allCourses) {
      const skillTags = course.skills ?? [];
      if (skillTags.length === 0) {
        continue;
      }

      for (const skill of skillTags) {
        if (!groupedBySkill[skill]) {
          groupedBySkill[skill] = [];
        }
        groupedBySkill[skill].push(course);
      }
    }

    const responseBody: CoursesApiResponse = {
      courses: allCourses,
      groupedBySkill,
    };

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("GET /api/courses error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

