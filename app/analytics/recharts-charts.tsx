"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

function ChartShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="h-72 pb-6">{children}</CardContent>
    </Card>
  );
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value);

const COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)'
];

export function AnalyticsCharts({ data }: { data: AnalyticsBundle }) {
  // Calculate Growth Percentage
  const startSalary = data.salaryHistory[0]?.salary || 0;
  const endSalary = data.salaryHistory[data.salaryHistory.length - 1]?.salary || 0;
  const growth = startSalary ? ((endSalary - startSalary) / startSalary * 100).toFixed(1) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* 1. Average Salary Over Time */}
      <ChartShell
        title="Average Salary Over Time"
        description={`Historical salary trends for ${data.summary.role}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.salaryHistory}>
            <defs>
              <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `£${Math.round(val / 1000)}k`}
            />
            <Tooltip
              formatter={(val: number | undefined) => [val ? formatCurrency(val) : "£0", "Avg Salary"]}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Area
              type="monotone"
              dataKey="salary"
              stroke="var(--color-chart-2)"
              fillOpacity={1}
              fill="url(#colorSalary)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartShell>

      {/* 2. Skill-wise Job Demand */}
      <ChartShell
        title="Skill-wise Job Demand"
        description="Vacancy counts for your top skills"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.skillDemand} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="skill"
              type="category"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none' }}
            />
            <Bar dataKey="count" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>

      {/* 3. Career Growth Trajectory */}
      <ChartShell
        title="Career Growth Trajectory"
        description={`Your market value grew by ${growth}% in the last year`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.salaryHistory}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
            <Tooltip formatter={(val: number | undefined) => val ? formatCurrency(val) : "£0"} />
            <Line
              type="stepAfter"
              dataKey="salary"
              stroke="var(--color-chart-4)"
              strokeWidth={3}
              dot={{ r: 4, fill: 'var(--color-chart-4)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartShell>

      {/* 4. Jobs by City */}
      <ChartShell
        title="Jobs by City"
        description="Top regions for your primary role"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.regionalDemand}
              dataKey="count"
              nameKey="city"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
            >
              {data.regionalDemand.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartShell>

      {/* 5. Career Analytics Breakdown */}
      <ChartShell
        title="Salary Distribution Breakdown"
        description={`Market distribution for ${data.summary.role}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.salaryDistribution}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
            <XAxis dataKey="range" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="count" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>
    </div>
  );
}

