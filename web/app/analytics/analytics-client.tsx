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
      <div className="space-y-4">
        <Skeleton className="h-8 w-44" />
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Couldn&apos;t load analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Market Intelligence
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          {data.summary.role} insights
        </h2>
        <p className="text-sm text-muted-foreground">
          Real-time salary trends and vacancy demand for your primary stack.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Jobs Viewed</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-2xl font-bold">{data.summary.activity.jobs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Courses Tracked</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-2xl font-bold">{data.summary.activity.courses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Interviews</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-2xl font-bold">{data.summary.activity.interviews}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Interview Score</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-2xl font-bold">{data.summary.activity.score}%</p>
          </CardContent>
        </Card>
      </div>

      <AnalyticsCharts data={data} />
    </div>
  );
}
