import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, onboardingProfiles, skillGaps, mockInterviews } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
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

  const matchScore = gap?.similarity_score
    ? Math.round(Number(gap.similarity_score) * 100) / 100 > 1
      ? Math.round(Number(gap.similarity_score))
      : Math.round(Number(gap.similarity_score) * 100)
    : 0;

  const skillCount = Array.isArray(profile.skills) ? (profile.skills as string[]).length : 0;
  const interviewCount = interviewList.length;
  const avgScore = interviewList.length > 0
    ? Math.round(interviewList.reduce((sum, i) => sum + (Number(i.score) || 0), 0) / interviewList.length)
    : 0;

  return (
    <div className="flex flex-col gap-4 sm:gap-5 animate-fade-in-up">
      {/* Welcome Block */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-container p-5 sm:p-7 text-white shadow-xl shadow-primary/15">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 space-y-1">
          <h2 className="font-display text-lg sm:text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || "Explorer"} 👋
          </h2>
          <p className="max-w-md text-xs sm:text-sm font-medium text-white/70 leading-relaxed">
            You&apos;re matching <span className="text-white font-bold">{matchScore}%</span> of your target role profile.
          </p>
        </div>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 stagger-children">
        <div className="rounded-2xl bg-card p-4 sm:p-5 transition-all hover:shadow-md">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1">Target Match</p>
          <span className="font-display text-2xl sm:text-3xl font-bold text-primary">{matchScore}%</span>
        </div>
        <div className="rounded-2xl bg-card p-4 sm:p-5 transition-all hover:shadow-md">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1">Skills</p>
          <span className="font-display text-2xl sm:text-3xl font-bold text-secondary">{skillCount}</span>
        </div>
        <div className="rounded-2xl bg-card p-4 sm:p-5 transition-all hover:shadow-md">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1">Interviews</p>
          <span className="font-display text-2xl sm:text-3xl font-bold text-tertiary">{interviewCount}</span>
        </div>
        <div className="rounded-2xl bg-card p-4 sm:p-5 transition-all hover:shadow-md">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1">Avg Score</p>
          <span className="font-display text-2xl sm:text-3xl font-bold text-foreground">{avgScore}%</span>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="space-y-2">
        <h3 className="font-display text-base font-bold px-1">Performance Trajectory</h3>
        <div className="rounded-2xl bg-card p-4 sm:p-5 shadow-sm">
          <DashboardChart interviews={interviewList} />
        </div>
      </div>

      {/* Job Targets + Courses */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 flex flex-col">
          <h3 className="font-display text-base font-bold px-1">Top Job Targets</h3>
          <div className="flex-1 rounded-2xl bg-card p-4 sm:p-5 shadow-sm flex flex-col min-h-[200px]">
            <DashboardJobsPreview />
          </div>
        </div>

        <div className="space-y-2 flex flex-col">
          <h3 className="font-display text-base font-bold px-1">Accelerated Learning</h3>
          <div className="flex-1 rounded-2xl bg-card p-4 sm:p-5 shadow-sm flex flex-col min-h-[200px]">
            <DashboardCoursesPreview />
          </div>
        </div>
      </div>
    </div>
  );
}
