"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Course, CoursesApiResponse } from "@/types";

type CourseCard = Course & {
  youtubeThumbnailUrl: string;
  channelName: string;
  durationLabel: string;
  skillTag: string;
  fillsSkillGap: boolean;
};

export function CoursesClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [groupedCourses, setGroupedCourses] = useState<
    Array<{ tag: string; items: CourseCard[] }>
  >([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/courses");
      if (!res.ok) {
        throw new Error("Failed to load courses");
      }
      const data = (await res.json()) as CoursesApiResponse;

      if (data.message && data.courses.length === 0) {
        // No skill gaps yet
        setGroupedCourses([]);
        setSkillTags([]);
        setLoading(false);
        return;
      }

      // Extract skill tags from groupedBySkill keys
      const tags = Object.keys(data.groupedBySkill);
      setSkillTags(tags);

      // Build grouped course cards
      const groups: Array<{ tag: string; items: CourseCard[] }> = [];
      const entries = activeTag
        ? [[activeTag, data.groupedBySkill[activeTag] ?? []] as const]
        : Object.entries(data.groupedBySkill);

      for (const [tag, courses] of entries) {
        const cards: CourseCard[] = courses.map((c) => ({
          ...c,
          youtubeThumbnailUrl:
            c.url && c.url.includes("youtube.com")
              ? `https://img.youtube.com/vi/${extractYouTubeId(c.url)}/hqdefault.jpg`
              : `https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg`,
          channelName: c.provider ?? "YouTube",
          durationLabel: c.duration_hours
            ? `${c.duration_hours}h`
            : "—",
          skillTag: tag,
          fillsSkillGap: true,
        }));
        groups.push({ tag, items: cards });
      }
      setGroupedCourses(groups);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load courses");
      setGroupedCourses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag]);

  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Courses
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          Fill your skill gaps
        </h2>
        <p className="text-sm text-muted-foreground">
          Filter by skill tag. Courses are grouped by the gap they cover.
        </p>
      </section>

      <section className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <Button
          variant={activeTag === null ? "default" : "outline"}
          onClick={() => setActiveTag(null)}
        >
          All
        </Button>
        {skillTags.slice(0, 10).map((tag) => (
          <Button
            key={tag}
            variant={activeTag === tag ? "default" : "outline"}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </Button>
        ))}
      </section>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Couldn&apos;t load courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={() => void load()}>Retry</Button>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-44" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-60 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ) : groupedCourses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No course recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Complete onboarding to get personalized course suggestions based on your skill gaps.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedCourses.map((group) => (
            <section key={group.tag} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold">{group.tag}</h3>
                  <Badge variant="outline">{group.items.length}</Badge>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {group.items.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="relative aspect-video w-full bg-muted">
                      <Image
                        src={course.youtubeThumbnailUrl}
                        alt={course.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-sm">{course.title}</CardTitle>
                        {course.fillsSkillGap ? (
                          <Badge variant="accent">Fills skill gap</Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {course.channelName} · {course.durationLabel}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline">{course.skillTag}</Badge>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <Button variant="outline" asChild>
                          <a href={course.url} target="_blank" rel="noreferrer">
                            Watch
                          </a>
                        </Button>
                        <Button variant="ghost">Save</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function extractYouTubeId(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v") ?? "dQw4w9WgXcQ";
    }
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1) || "dQw4w9WgXcQ";
    }
  } catch {
    // ignore
  }
  return "dQw4w9WgXcQ";
}
