import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardChart } from "@/components/dashboard/dashboard-chart";
import { DashboardJobsPreview } from "@/components/dashboard/dashboard-jobs";
import { DashboardCoursesPreview } from "@/components/dashboard/dashboard-courses";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, profile: null, stats: null, activity: [] };
  }

  const [userRow, onboardingRow, gapRow, interviewsRow, eventsRow] =
    await Promise.all([
      supabase
        .from("users")
        .select("id, email, name, avatar, bio, location, created_at")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("onboarding_profiles")
        .select(
          "id, user_id, skills, interests, experience_level, education, goals, completed_at",
        )
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("skill_gaps")
        .select("missing_skills, similarity_score")
        .eq("user_id", user.id)
        .order("computed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("mock_interviews")
        .select("score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("analytics_events")
        .select("event_type, metadata, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const userData = userRow.data;
  const profileData = onboardingRow.data;
  const gapData = gapRow.data;
  const interviews = interviewsRow.data ?? [];
  const events = eventsRow.data ?? [];

  // Compute stats
  const userSkillsCount = (profileData?.skills as string[] | null)?.length ?? 0;
  const missingSkills =
    (gapData?.missing_skills as string[] | null) ?? [];
  const total = userSkillsCount + missingSkills.length;
  const skillGapPercent =
    total === 0
      ? 0
      : Math.round((missingSkills.length / total) * 100);

  const latestInterviewScore =
    interviews.length > 0 ? Math.round(interviews[0].score as number) : 0;

  const jobEvents = events.filter(
    (e) =>
      e.event_type === "job_clicked" || e.event_type === "job_viewed",
  );
  const courseEvents = events.filter(
    (e) =>
      e.event_type === "course_clicked" || e.event_type === "course_viewed",
  );

  const stats = {
    jobsMatched: jobEvents.length,
    coursesSuggested: courseEvents.length,
    interviewScore: latestInterviewScore,
    skillGapPercent,
  };

  return {
    user: userData
      ? {
        name: userData.name as string | null,
      }
      : null,
    profile: profileData
      ? {
        experience_level: profileData.experience_level as string | null,
        skills: (profileData.skills as string[] | null) ?? [],
      }
      : null,
    stats,
    interviews,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { user } = await getDashboardData();
  const name = user?.name ?? "there";
  const title = `Dashboard — Hi ${name}`;
  const description = "Your Aspirely dashboard: stats, activity, and quick links.";
  return {
    title,
    description,
    alternates: {
      canonical: "/dashboard",
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(
            title,
          )}&description=${encodeURIComponent(description)}`,
        },
      ],
    },
  };
}

export default async function DashboardPage() {
  const { user, profile, stats, interviews } = await getDashboardData();

  const dashStats = stats ?? {
    jobsMatched: 0,
    coursesSuggested: 0,
    interviewScore: 0,
    skillGapPercent: 0,
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <section className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary/80">
              Dashboard
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight">
              Hi, {user?.name ?? "there"}.
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Your next best moves, based on your skills and goals.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild className="rounded-full border-border hover:bg-surface-container-low transition-colors">
              <Link href="/profile">Edit profile</Link>
            </Button>
            <Button asChild className="rounded-full bg-gradient-to-br from-primary to-primary-container text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 active:scale-95">
              <Link href="/jobs">Explore jobs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Overview Cards */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Jobs Matched", value: dashStats.jobsMatched, color: "text-primary" },
          { label: "Courses Suggested", value: dashStats.coursesSuggested, color: "text-secondary" },
          { label: "Interview Score", value: dashStats.interviewScore, color: "text-tertiary" },
          { label: "Skill Gap %", value: `${dashStats.skillGapPercent}%`, color: "text-foreground" },
        ].map((s, i) => (
          <div key={s.label} className="glass-panel overflow-hidden rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 relative group">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
            <h3 className="text-sm font-medium text-muted-foreground mb-4">{s.label}</h3>
            <div className={`font-display text-4xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </section>

      {/* Main Content Grid */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Analytics Chart & Jobs */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Performance Analytics */}
          <div className="glass-panel rounded-3xl p-6 flex flex-col border border-border/50">
            <h3 className="font-display text-xl font-bold mb-2">Performance Trajectory</h3>
            <p className="text-sm text-muted-foreground mb-4">Your mock interview scores over time.</p>
            <DashboardChart interviews={interviews as any} />
          </div>

          {/* Job Previews */}
          <div className="glass-panel rounded-3xl p-6 border border-border/50">
            <h3 className="font-display text-xl font-bold mb-2">Recommended Opportunities</h3>
            <p className="text-sm text-muted-foreground mb-6">Jobs precisely matched to your current skill profile.</p>
            <DashboardJobsPreview />
          </div>
        </div>

        {/* Right Column: Profile & Courses */}
        <div className="flex flex-col gap-6">
          {/* Profile Snapshot */}
          <div className="glass-panel rounded-3xl p-6 border border-border/50 relative overflow-hidden text-center">
             <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
             <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-surface-container-highest border-2 border-primary/20 flex items-center justify-center shadow-inner">
                 <span className="text-2xl font-display font-bold text-primary">{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
             </div>
             <h3 className="font-display text-lg font-bold">Profile Snapshot</h3>
             {profile ? (
                <>
                  <p className="mt-2 text-sm text-primary font-medium">{profile.experience_level ?? "—"}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                     {profile.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="rounded-md bg-secondary/10 px-2 py-1 text-xs font-semibold text-secondary">
                          {skill}
                        </span>
                     ))}
                     {profile.skills.length > 3 && (
                        <span className="rounded-md bg-surface-container px-2 py-1 text-xs font-medium text-muted-foreground">
                          +{profile.skills.length - 3}
                        </span>
                     )}
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Complete onboarding to personalize Aspirely.
                </p>
              )}
          </div>

          {/* Courses Previews */}
          <div className="glass-panel rounded-3xl p-6 border border-border/50 flex-1">
            <h3 className="font-display text-xl font-bold mb-2">Skill Builders</h3>
            <p className="text-sm text-muted-foreground mb-6">Courses to close your skill gaps.</p>
            <DashboardCoursesPreview />
          </div>
        </div>
      </section>
    </div>
  );
}
