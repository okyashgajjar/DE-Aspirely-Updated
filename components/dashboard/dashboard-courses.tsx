"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Course } from "@/types";

export function DashboardCoursesPreview() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses");
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        setCourses(data.courses || []);
      } catch (err) {
        console.error("Dashboard courses fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 w-full rounded-2xl bg-surface-container/50 border border-border/20" />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-background/20 text-center">
        <p className="text-sm font-semibold text-foreground">No courses found</p>
        <p className="mt-1 text-xs text-muted-foreground">Adjust your skills to find learning paths.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 flex-1">
      {courses.slice(0, 3).map((course) => (
        <a
          key={course.id}
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-2xl border border-border/30 bg-surface-container-low/30 p-4 transition-all hover:-translate-y-1 hover:border-secondary/30 hover:bg-surface-container-low hover:shadow-lg hover:shadow-secondary/5 relative overflow-hidden"
        >
          <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-secondary/10 blur-2xl group-hover:bg-secondary/20 transition-colors" />
          <div className="relative z-10 flex flex-col gap-2">
            <h4 className="font-display font-bold text-base leading-tight group-hover:text-secondary transition-colors line-clamp-2">
              {course.title}
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1 font-semibold">
                <svg className="h-3.5 w-3.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {course.provider}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {course.level || "Beginner"}
              </span>
            </div>
          </div>
        </a>
      ))}
      <Button asChild variant="ghost" className="mt-2 w-full justify-center group/btn hover:bg-secondary/5 hover:text-secondary transition-colors text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <Link href="/courses">
          View Learning Paths
          <span className="ml-1 inline-block transition-transform group-hover/btn:translate-x-1">&rarr;</span>
        </Link>
      </Button>
    </div>
  );
}
