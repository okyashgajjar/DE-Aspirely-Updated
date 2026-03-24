import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, onboardingProfiles, skillGaps, mockInterviews } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardChart } from "@/components/dashboard/dashboard-chart";
import { DashboardCoursesPreview } from "@/components/dashboard/dashboard-courses";
import { DashboardJobsPreview } from "@/components/dashboard/dashboard-jobs";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id!;

  const [user, profile, gap, interviewList] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, userId),
    }),
    db.query.onboardingProfiles.findFirst({
      where: eq(onboardingProfiles.userId, userId),
      orderBy: [desc(onboardingProfiles.completed_at)],
    }),
    db.query.skillGaps.findFirst({
      where: eq(skillGaps.userId, userId),
      orderBy: [desc(skillGaps.computed_at)],
    }),
    db.query.mockInterviews.findMany({
      where: eq(mockInterviews.userId, userId),
      orderBy: [desc(mockInterviews.created_at)],
      limit: 10,
    }),
  ]);

  if (!profile) redirect("/onboarding");

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        {/* Welcome Block */}
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary to-primary-container p-8 text-primary-foreground shadow-2xl shadow-primary/20">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-background/10 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                Ready to ascend, {user?.name?.split(' ')[0] || "Explorer"}?
              </h2>
              <p className="text-sm text-muted-foreground font-medium">Analyze your journey and identify your footprint&apos;s growth.</p>
              <p className="max-w-md text-sm font-medium opacity-80 leading-relaxed">
                You're currently matching <span className="text-secondary-foreground font-bold">{gap?.similarity_score || 0}%</span> of your target role profile.
              </p>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Performance Trajectory */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-display text-lg font-bold">Performance Trajectory</h3>
            </div>
            <div className="rounded-[32px] border border-border/50 bg-surface-container-low/50 backdrop-blur-sm p-6 shadow-sm">
              <DashboardChart interviews={interviewList as any} />
            </div>
          </div>

          {/* Quick Actions / Stats */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold px-2">Profile Overview</h3>
            <div className="grid gap-4">
              <div className="rounded-3xl border border-border/30 bg-surface-container-lowest p-6 transition-all hover:bg-surface-container-low">
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1">Target Match</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-primary">{gap?.similarity_score || 0}%</span>
                </div>
              </div>
              <div className="rounded-3xl border border-border/30 bg-surface-container-lowest p-6 transition-all hover:bg-surface-container-low">
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1">Skills Identified</p>
                <span className="text-4xl font-bold text-secondary">{(profile.skills as string[]).length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Jobs Preview */}
          <div className="space-y-4 flex flex-col h-full">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-display text-lg font-bold">Top Job Targets</h3>
            </div>
            <div className="flex-1 rounded-[32px] border border-border/50 bg-surface-container-low/50 backdrop-blur-sm p-6 shadow-sm flex flex-col">
              <DashboardJobsPreview />
            </div>
          </div>

          {/* Courses Preview */}
          <div className="space-y-4 flex flex-col h-full">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-display text-lg font-bold">Accelerated Learning</h3>
            </div>
            <div className="flex-1 rounded-[32px] border border-border/50 bg-surface-container-low/50 backdrop-blur-sm p-6 shadow-sm flex flex-col">
              <DashboardCoursesPreview />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
