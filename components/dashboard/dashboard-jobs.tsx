"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { JobListing } from "@/types";

export function DashboardJobsPreview() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/jobs/matched");
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err) {
        console.error("Dashboard jobs fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
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

  if (jobs.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-background/20 text-center">
        <p className="text-sm font-semibold text-foreground">No jobs found</p>
        <p className="mt-1 text-xs text-muted-foreground">Adjust your skills or location to find matches.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 flex-1">
      {jobs.slice(0, 3).map((job) => (
        <a
          key={job.id}
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-2xl border border-border/30 bg-surface-container-low/30 p-4 transition-all hover:-translate-y-1 hover:border-primary/30 hover:bg-surface-container-low hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden"
        >
          <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-colors" />
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-display font-bold text-base leading-tight group-hover:text-primary transition-colors">
                {job.title}
              </h4>
              <Badge variant="outline" className="bg-primary/10 text-primary hover:bg-primary/20 border-0 shadow-none shrink-0 font-mono text-[10px] tracking-wider uppercase px-2 py-0.5">
                {job.matchScore ? `${job.matchScore}% Match` : "New"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                {job.company}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {job.location || "Remote"}
              </span>
            </div>
          </div>
        </a>
      ))}
      <Button asChild variant="ghost" className="mt-2 w-full justify-center group/btn hover:bg-primary/5 hover:text-primary transition-colors text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <Link href="/jobs">
          View All Job Matches
          <span className="ml-1 inline-block transition-transform group-hover/btn:translate-x-1">&rarr;</span>
        </Link>
      </Button>
    </div>
  );
}
