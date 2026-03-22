"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface InterviewData {
  created_at: string;
  score: number;
}

export function DashboardChart({
  interviews,
}: {
  interviews: InterviewData[];
}) {
  const data = useMemo(() => {
    if (!interviews || interviews.length === 0) return [];
    // Sort chronology ascending for line chart (left to right)
    return [...interviews].reverse().map((i, idx) => {
      const d = new Date(i.created_at);
      return {
        name: `Attempt ${idx + 1}`,
        score: Math.round(i.score),
        dateStr: d.toLocaleDateString(),
      };
    });
  }, [interviews]);

  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-background/20 p-8 text-center">
        <div className="mb-3 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <p className="text-sm font-semibold text-foreground">Awaiting Analytics</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Complete mock interviews to generate your robust performance trajectory graph here.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
          <XAxis 
            dataKey="name" 
            stroke="currentColor" 
            className="text-xs text-muted-foreground"
            tick={{ fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="currentColor" 
            className="text-xs text-muted-foreground"
            tick={{ fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(10,10,10,0.8)", backdropFilter: "blur(8px)", color: "#fff" }}
            itemStyle={{ color: "#fff" }}
            formatter={(val: number | string | undefined) => [`${val ?? 0}/100`, "Yield"]}
            labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="hsl(var(--primary))" 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--background))", stroke: "hsl(var(--primary))" }}
            activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--primary))" }}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
