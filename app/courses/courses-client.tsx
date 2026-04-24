"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
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
        setGroupedCourses([]);
        setSkillTags([]);
        setLoading(false);
        return;
      }

      const tags = Object.keys(data.groupedBySkill);
      setSkillTags(tags);

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
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <section className="space-y-1.5">
        <h2 className="font-display text-3xl font-bold tracking-tight">
          Courses
        </h2>
        <p className="text-sm text-muted-foreground font-medium">
          Curated courses grouped by skill gap. Filter by tag.
        </p>
      </section>

      {/* Skill tag filters */}
      <section className="flex flex-wrap items-center gap-2 rounded-2xl bg-card p-3">
        <Button
          variant={activeTag === null ? "default" : "ghost"}
          onClick={() => setActiveTag(null)}
          className={activeTag === null ? "rounded-full bg-primary text-primary-foreground font-semibold text-sm" : "rounded-full text-muted-foreground hover:text-foreground text-sm"}
        >
          All
        </Button>
        {skillTags.slice(0, 10).map((tag) => (
          <Button
            key={tag}
            variant={activeTag === tag ? "default" : "ghost"}
            onClick={() => setActiveTag(tag)}
            className={activeTag === tag ? "rounded-full bg-primary text-primary-foreground font-semibold text-sm" : "rounded-full text-muted-foreground hover:text-foreground text-sm"}
          >
            {tag}
          </Button>
        ))}
      </section>

      {error ? (
        <div className="rounded-2xl bg-destructive/5 p-8 text-center">
          <h3 className="font-display text-lg font-bold text-destructive mb-2">Failed to load</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => void load()} className="rounded-full btn-gradient">Retry</Button>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-5">
          <Skeleton className="h-6 w-36 rounded-full bg-muted" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-64 w-full rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      ) : groupedCourses.length === 0 ? (
        <div className="rounded-2xl bg-card p-10 text-center" style={{ border: '1px dashed var(--border)' }}>
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
          <h3 className="font-display text-lg font-bold mb-2">No courses yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Complete onboarding to get personalized course recommendations.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {groupedCourses.map((group) => (
            <section key={group.tag} className="space-y-4">
              <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <h3 className="font-display text-xl font-bold">{group.tag}</h3>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {group.items.length} courses
                </span>
              </div>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 stagger-children">
                {group.items.map((course) => (
                  <div key={course.id} className="group overflow-hidden rounded-2xl bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 flex flex-col">
                    <div className="relative aspect-video w-full bg-muted overflow-hidden">
                      <Image
                        src={course.youtubeThumbnailUrl}
                        alt={course.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
                      {course.fillsSkillGap ? (
                        <div className="absolute top-3 right-3 rounded-full bg-secondary/20 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-secondary">
                          GAP FILL
                        </div>
                      ) : null}
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1">
                      <h4 className="font-display text-base font-bold line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">{course.title}</h4>
                      <p className="text-xs text-muted-foreground font-medium mb-4">
                        {course.channelName} <span className="mx-1 opacity-50">•</span> {course.durationLabel}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                        <Button variant="ghost" asChild className="rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-all">
                          <a href={course.url} target="_blank" rel="noreferrer">
                            Start Course
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted text-muted-foreground">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                        </Button>
                      </div>
                    </div>
                  </div>
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
