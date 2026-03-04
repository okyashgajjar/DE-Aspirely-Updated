import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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

  // Build recent activity from events
  const eventLabels: Record<string, string> = {
    onboarding_completed: "Onboarding completed",
    profile_updated: "Profile updated",
    job_clicked: "Job viewed",
    job_viewed: "Job viewed",
    course_clicked: "Course viewed",
    course_viewed: "Course viewed",
    mock_interview_completed: "Mock interview completed",
    chat_session_started: "Chat session started",
  };

  const activity = events.slice(0, 5).map((e, idx) => ({
    id: `evt_${idx}`,
    title: eventLabels[e.event_type as string] ?? (e.event_type as string),
    description: null as string | null,
    createdAt: (e.created_at as string) ?? new Date().toISOString(),
  }));

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
    activity,
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
  const { user, profile, stats, activity } = await getDashboardData();

  const dashStats = stats ?? {
    jobsMatched: 0,
    coursesSuggested: 0,
    interviewScore: 0,
    skillGapPercent: 0,
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Dashboard
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Hi {user?.name ?? "there"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Your next best moves, based on your skills and goals.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/profile">Edit profile</Link>
            </Button>
            <Button asChild>
              <Link href="/jobs">Explore jobs</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Jobs Matched", value: dashStats.jobsMatched },
          { label: "Courses Suggested", value: dashStats.coursesSuggested },
          { label: "Interview Score", value: dashStats.interviewScore },
          { label: "Skill Gap %", value: `${dashStats.skillGapPercent}%` },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardTitle className="text-sm">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <div className="rounded-lg border border-border bg-background/50 p-6 text-sm text-muted-foreground">
                No activity yet. Start by exploring jobs or running a mock interview.
              </div>
            ) : (
              <ul className="space-y-3">
                {activity.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-border bg-background/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{item.title}</p>
                      <Badge variant="outline">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    {item.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {[
                { href: "/jobs", label: "Jobs" },
                { href: "/courses", label: "Courses" },
                { href: "/analytics", label: "Analytics" },
                { href: "/chatbot", label: "Chatbot" },
                { href: "/mock-interview", label: "Mock interviews" },
                { href: "/settings", label: "Settings" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-md border border-border bg-background/50 px-3 py-2 text-sm hover:bg-muted"
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-border bg-background/50 p-4">
              <p className="text-sm font-medium">Profile snapshot</p>
              {profile ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {profile.experience_level ?? "—"} ·{" "}
                  {profile.skills.slice(0, 3).join(", ")}
                  {profile.skills.length > 3 ? "…" : ""}
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Complete onboarding to personalize Aspirely.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
