import { NextResponse } from "next/server";
import { db } from "@/db";
import { skillGaps } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUserId } from "@/lib/session";
import { fetchYouTubeCoursesForSkill } from "@/lib/youtube";
import type { Course } from "@/types";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const gapRow = await db.query.skillGaps.findFirst({
      where: eq(skillGaps.userId, userId),
      orderBy: [desc(skillGaps.computed_at)],
    });

    const missingSkills = (gapRow?.missing_skills as string[] | null) ?? [];

    if (!gapRow || missingSkills.length === 0) {
      return NextResponse.json({
        courses: [],
        groupedBySkill: {},
        message: "Complete onboarding to get course suggestions",
      });
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
      for (const skill of skillTags) {
        if (!groupedBySkill[skill]) groupedBySkill[skill] = [];
        groupedBySkill[skill].push(course);
      }
    }

    return NextResponse.json({ courses: allCourses, groupedBySkill });
  } catch (error) {
    console.error("GET /api/courses error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
