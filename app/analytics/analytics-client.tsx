"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MarketAnalyticsSnapshot } from "@/types";

// Transform MarketAnalyticsSnapshot into the format expected by our new charts
export type AnalyticsBundle = {
  salaryHistory: Array<{ month: string; salary: number }>;
  skillDemand: Array<{ skill: string; count: number }>;
  regionalDemand: Array<{ city: string; count: number }>;
  salaryDistribution: Array<{ range: string; count: number }>;
  summary: {
    role: string;
    location: string;
    activity: {
      jobs: number;
      courses: number;
      interviews: number;
      score: number;
    };
  };
};

function snapshotToBundle(snapshot: MarketAnalyticsSnapshot): AnalyticsBundle {
  // Sort months YYYY-MM
  const salaryHistory = Object.entries(snapshot.marketData.salaryHistory)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, salary]) => ({ month, salary }));

  const skillDemand = snapshot.marketData.skillDemand;

  const regionalDemand = snapshot.marketData.regionalDemand.map((d) => ({
    city: d.location.display_name.split(",")[0],
    count: d.count,
  }));

  // Sort histogram keys numerically
  const salaryDistribution = Object.entries(snapshot.marketData.salaryDistribution)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([range, count]) => ({
      range: `${Number(range) / 1000}k`,
      count,
    }));

  return {
    salaryHistory,
    skillDemand,
    regionalDemand,
    salaryDistribution,
    summary: {
      role: snapshot.context.primaryRole,
      location: snapshot.context.location || "Global (Remote)",
      activity: {
        jobs: snapshot.activitySummary.jobsViewed,
        courses: snapshot.activitySummary.coursesViewed,
        interviews: snapshot.activitySummary.interviewsDone,
        score: snapshot.activitySummary.avgInterviewScore,
      },
    },
  };
}

const AnalyticsCharts = dynamic(
  () =>
    import("@/app/analytics/recharts-charts").then((m) => m.AnalyticsCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-72 w-full rounded-xl" />
        ))}
      </div>
    ),
  },
);

export function AnalyticsClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsBundle | null>(null);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/analytics");
        if (!res.ok) {
          throw new Error("Failed to load market analytics");
        }
        const snapshot = (await res.json()) as MarketAnalyticsSnapshot;
        if (!mounted) return;
        const bundle = snapshotToBundle(snapshot);
        setData(bundle);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load analytics");
        setData(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    void run();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <Skeleton className="h-10 w-48 rounded-full bg-surface-container" />
        <div className="grid gap-6 md:grid-cols-4">
           {Array.from({ length: 4 }).map((_, idx) => (
             <Skeleton key={idx} className="h-28 w-full rounded-3xl bg-surface-container" />
           ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-80 w-full rounded-3xl bg-surface-container" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel rounded-3xl p-12 border border-destructive/20 text-center text-muted-foreground max-w-2xl mx-auto mt-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-6 border border-destructive/20 text-destructive">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h3 className="font-display text-2xl font-bold text-destructive mb-2">Telemetry Disconnected</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <section className="space-y-2">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary/80">
          Market Intelligence
        </p>
        <h2 className="font-display text-4xl font-bold tracking-tight">
          {data.summary.role} Insights.
        </h2>
        <p className="text-sm text-muted-foreground font-medium">
          Real-time salary trends and vacancy demand for your primary stack.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass-panel rounded-3xl p-6 border border-border/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Jobs Viewed</h3>
          <p className="font-display text-4xl font-bold text-primary">{data.summary.activity.jobs}</p>
        </div>
        <div className="glass-panel rounded-3xl p-6 border border-border/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-secondary/5">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Courses Tracked</h3>
          <p className="font-display text-4xl font-bold text-secondary">{data.summary.activity.courses}</p>
        </div>
        <div className="glass-panel rounded-3xl p-6 border border-border/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-tertiary/5">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Interviews</h3>
          <p className="font-display text-4xl font-bold text-tertiary">{data.summary.activity.interviews}</p>
        </div>
        <div className="glass-panel rounded-3xl p-6 border border-border/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-foreground/5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-foreground/5 blur-2xl group-hover:bg-foreground/10 transition-colors" />
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Interview Score</h3>
          <p className="font-display text-4xl font-bold text-foreground">{data.summary.activity.score}%</p>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-border/50 shadow-inner bg-surface-container-low/30 backdrop-blur-2xl">
        <AnalyticsCharts data={data} />
      </div>
    </div>
  );
}
