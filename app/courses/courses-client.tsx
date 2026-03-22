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
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <section className="space-y-2">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary/80">
          Courses
        </p>
        <h2 className="font-display text-4xl font-bold tracking-tight">
          Fill your skill gaps.
        </h2>
        <p className="text-sm text-muted-foreground font-medium">
          Filter by skill tag. Curated courses grouped by the precise gap they cover.
        </p>
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-3xl border border-border/50 bg-surface-container-low/30 p-4 shadow-inner">
        <Button
          variant={activeTag === null ? "default" : "outline"}
          onClick={() => setActiveTag(null)}
          className={activeTag === null ? "rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20" : "rounded-full border-border hover:bg-surface-container text-muted-foreground hover:text-foreground transition-all"}
        >
          Master List
        </Button>
        {skillTags.slice(0, 10).map((tag) => (
          <Button
            key={tag}
            variant={activeTag === tag ? "default" : "outline"}
            onClick={() => setActiveTag(tag)}
            className={activeTag === tag ? "rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold" : "rounded-full border-border hover:bg-surface-container text-muted-foreground hover:text-foreground transition-all"}
          >
            {tag}
          </Button>
        ))}
      </section>

      {error ? (
        <div className="glass-panel rounded-3xl p-8 border border-destructive/20 text-center">
            <h3 className="font-display text-xl font-bold text-destructive mb-2">Sync Failed</h3>
            <p className="text-sm text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => void load()} className="rounded-full">Retry Connection</Button>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-44 rounded-full bg-surface-container" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-72 w-full rounded-3xl bg-surface-container" />
            ))}
          </div>
        </div>
      ) : groupedCourses.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-border/50">
           <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-surface-container flex items-center justify-center border border-border">
              <span className="text-2xl opacity-50">?</span>
           </div>
           <h3 className="font-display text-xl font-bold mb-2">No active curriculums</h3>
           <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Complete onboarding to unlock your personalized course suggestions. Only the most effective material will be surfaced.
           </p>
        </div>
      ) : (
        <div className="space-y-12">
          {groupedCourses.map((group) => (
            <section key={group.tag} className="space-y-6">
              <div className="flex items-center gap-4 border-b border-border/50 pb-4">
                <h3 className="font-display text-2xl font-bold">{group.tag}</h3>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {group.items.length} Modules
                </span>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {group.items.map((course) => (
                  <div key={course.id} className="group glass-panel overflow-hidden rounded-3xl border border-border/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 flex flex-col">
                    <div className="relative aspect-video w-full bg-surface-container overflow-hidden">
                      <Image
                        src={course.youtubeThumbnailUrl}
                        alt={course.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent pointer-events-none" />
                      {course.fillsSkillGap ? (
                        <div className="absolute top-4 right-4 rounded-full bg-secondary/20 backdrop-blur-md border border-secondary/30 px-3 py-1 font-mono text-[10px] font-bold text-secondary shadow-lg">
                          GAP FOCUS
                        </div>
                      ) : null}
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h4 className="font-display text-lg font-bold line-clamp-2 mb-2 group-hover:text-primary transition-colors">{course.title}</h4>
                      <p className="text-xs text-muted-foreground font-medium mb-6">
                        {course.channelName} <span className="mx-1 opacity-50">•</span> {course.durationLabel}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/30">
                        <Button variant="ghost" asChild className="rounded-full border border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-all">
                          <a href={course.url} target="_blank" rel="noreferrer">
                            Begin Module
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface-container hover:text-primary transition-colors text-muted-foreground">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
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
