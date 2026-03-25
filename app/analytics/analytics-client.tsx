"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { MarketAnalyticsSnapshot } from "@/types";

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
  const salaryHistory = Object.entries(snapshot.marketData.salaryHistory)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, salary]) => ({ month, salary }));

  const skillDemand = snapshot.marketData.skillDemand;

  const regionalDemand = snapshot.marketData.regionalDemand.map((d) => ({
    city: d.location.display_name.split(",")[0],
    count: d.count,
  }));

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
          <Skeleton key={idx} className="h-64 w-full rounded-2xl bg-muted" />
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
      <div className="space-y-5 animate-fade-in-up">
        <Skeleton className="h-8 w-44 rounded-full bg-muted" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24 w-full rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-64 w-full rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-destructive/5 p-10 text-center max-w-2xl mx-auto mt-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mb-4">
          ⚠️
        </div>
        <h3 className="font-display text-xl font-bold text-destructive mb-2">Analytics Unavailable</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <section className="space-y-1.5">
        <h2 className="font-display text-3xl font-bold tracking-tight">
          {data.summary.role} Analytics
        </h2>
        <p className="text-sm text-muted-foreground font-medium">
          Salary trends and vacancy demand for your primary stack.
        </p>
      </section>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4 stagger-children">
        <div className="rounded-2xl bg-card p-5 transition-all hover:shadow-md">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Jobs Viewed</h3>
          <p className="font-display text-3xl font-bold text-primary">{data.summary.activity.jobs}</p>
        </div>
        <div className="rounded-2xl bg-card p-5 transition-all hover:shadow-md">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Courses Tracked</h3>
          <p className="font-display text-3xl font-bold text-secondary">{data.summary.activity.courses}</p>
        </div>
        <div className="rounded-2xl bg-card p-5 transition-all hover:shadow-md">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Interviews</h3>
          <p className="font-display text-3xl font-bold text-tertiary">{data.summary.activity.interviews}</p>
        </div>
        <div className="rounded-2xl bg-card p-5 transition-all hover:shadow-md">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Avg Score</h3>
          <p className="font-display text-3xl font-bold text-foreground">{data.summary.activity.score}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="rounded-2xl bg-card p-5 lg:p-7">
        <AnalyticsCharts data={data} />
      </div>
    </div>
  );
}
