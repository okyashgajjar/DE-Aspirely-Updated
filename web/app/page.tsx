import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ASPIRELY — Your AI Career Advisor",
  description:
    "AI career advisor for personalized job recommendations, skill gap analysis, and mock interviews.",
  keywords: [
    "AI career advisor",
    "job recommendations",
    "skill gap analysis",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ASPIRELY — Your AI Career Advisor",
    description:
      "AI career advisor for personalized job recommendations, skill gap analysis, and mock interviews.",
    url: "/",
    type: "website",
    images: [
      {
        url: "/api/og?title=Your%20AI%20Career%20Advisor&description=Personalized%20job%20matches%2C%20skill%20gap%20learning%2C%20analytics%2C%20and%20mock%20interviews.",
      },
    ],
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "ASPIRELY",
              url: process.env.NEXT_PUBLIC_APP_URL ?? "https://aspirely.app",
              description:
                "AI career advisor for personalized job recommendations, skill gap analysis, and mock interviews.",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              keywords: [
                "AI career advisor",
                "job recommendations",
                "skill gap analysis",
              ],
            }),
          }}
        />
        <header className="flex flex-col gap-10">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-sm font-semibold tracking-tight">
              ASPIRELY
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-5">
              <Badge variant="outline">Career · AI · Skill Gaps</Badge>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Your AI Career Advisor
              </h1>
              <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
                Get job matches, targeted courses, analytics, and mock interviews
                that adapt to your skills and goals.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/signup">Get started</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/login">I already have an account</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Built for focus: fewer tabs, clearer next steps.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { k: "Jobs Matched", v: "18" },
                  { k: "Skill Gap %", v: "24%" },
                  { k: "Courses Suggested", v: "7" },
                  { k: "Interview Score", v: "76" },
                ].map((item) => (
                  <div
                    key={item.k}
                    className="rounded-xl border border-border bg-background/50 p-4"
                  >
                    <p className="text-xs text-muted-foreground">{item.k}</p>
                    <p className="mt-2 text-2xl font-semibold">{item.v}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Example dashboard metrics—personalized after onboarding.
              </p>
            </div>
          </div>
        </header>

        <section className="mt-16">
          <h2 className="text-xl font-semibold tracking-tight">Features</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Everything you need to move from “I should apply” to “I’m ready.”
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Skill-based job matching",
                desc: "Find roles aligned to your current strengths and gaps.",
              },
              {
                title: "Course recommendations",
                desc: "Learn only what moves the needle for your next role.",
              },
              {
                title: "Analytics that matter",
                desc: "Track momentum with weekly summaries and trends.",
              },
              {
                title: "Mock interviews",
                desc: "Practice with structured questions and actionable feedback.",
              },
              {
                title: "Career chatbot",
                desc: "Ask for plans, resume help, or negotiation scripts.",
              },
              {
                title: "Profile + settings",
                desc: "Keep your goals up to date and stay in control.",
              },
            ].map((f) => (
              <Card key={f.title}>
                <CardHeader>
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-20 rounded-lg bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Onboard once",
                desc: "Share your skills, experience, and goals.",
              },
              {
                step: "02",
                title: "Get a focused plan",
                desc: "Jobs + courses optimized for your skill gaps.",
              },
              {
                step: "03",
                title: "Practice and iterate",
                desc: "Mock interviews and analytics keep you improving.",
              },
            ].map((s) => (
              <Card key={s.step}>
                <CardHeader>
                  <p className="text-xs font-medium text-muted-foreground">
                    Step {s.step}
                  </p>
                  <CardTitle className="mt-2">{s.title}</CardTitle>
                  <CardDescription>{s.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-10 w-24 rounded-full bg-accent/10" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-xl font-semibold tracking-tight">Testimonials</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                quote:
                  "I stopped doom-scrolling job boards and started applying with confidence.",
                name: "Sam · Frontend",
              },
              {
                quote:
                  "The course suggestions were exactly what I needed for interviews.",
                name: "Priya · Data",
              },
              {
                quote:
                  "Mock interviews helped me get consistent, measurable improvement.",
                name: "Jordan · Full Stack",
              },
            ].map((t) => (
              <Card key={t.name}>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">
                    “{t.quote}”
                  </CardTitle>
                  <CardDescription className="mt-2">{t.name}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-border bg-card p-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                Ready to level up?
              </h2>
              <p className="text-sm text-muted-foreground">
                Create an account and get your first personalized plan in minutes.
              </p>
            </div>
            <Button asChild>
              <Link href="/signup">Start free</Link>
            </Button>
          </div>
        </section>

        <footer className="mt-14 border-t border-border pt-8 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ASPIRELY</p>
        </footer>
      </div>
    </main>
  );
}

