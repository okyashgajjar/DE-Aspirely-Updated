import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ASPIRELY — Your AI Career Advisor",
  description: "Personalized job matches, skill gap coaching, and career navigation.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      {/* Background Orbs — clamped to viewport */}
      <div className="fixed top-0 left-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[150px] pointer-events-none -translate-x-1/3 -translate-y-1/3" />
      <div className="fixed bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-tertiary/8 blur-[150px] pointer-events-none translate-x-1/3 translate-y-1/3" />

      {/* Floating Glass Navbar */}
      <nav className="fixed top-3 sm:top-5 left-1/2 z-50 flex w-[94%] max-w-5xl -translate-x-1/2 items-center justify-between rounded-2xl glass-panel px-3 sm:px-5 py-2.5 sm:py-3">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="font-display text-sm sm:text-base font-bold tracking-tight">ASPIRELY</span>
          </Link>
          <div className="hidden items-center gap-5 text-sm font-medium text-muted-foreground md:flex">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</Link>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Log In
          </Link>
          <Button asChild className="rounded-full btn-gradient px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold shadow-md">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto flex min-h-[85vh] sm:min-h-[90vh] max-w-7xl flex-col items-center justify-center px-4 sm:px-6 pt-24 sm:pt-32 lg:pt-40 text-center">
        <div className="inline-flex items-center rounded-full bg-primary/10 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold text-primary mb-6 sm:mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
          AI-Powered Career Navigation
        </div>
        
        <h1 className="font-display text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-extrabold tracking-tighter w-full max-w-5xl leading-[1.1]">
          Master Your Career.{" "}
          <br />
          <span className="bg-gradient-to-r from-primary via-tertiary to-primary bg-clip-text text-transparent">
            One Focus at a Time.
          </span>
        </h1>
        
        <p className="mt-5 sm:mt-8 max-w-xl sm:max-w-2xl text-sm sm:text-lg text-muted-foreground font-medium leading-relaxed px-2">
          Step into a hyperfocus environment where job matching, analytics, and mock interviews adapt instantly to your ambitions.
        </p>
        
        <div className="mt-8 sm:mt-12 flex flex-col items-center justify-center gap-3 sm:gap-4 w-full max-w-md sm:flex-row">
          <Button asChild size="lg" className="rounded-full btn-gradient px-6 sm:px-8 text-sm sm:text-base shadow-lg w-full sm:w-auto">
            <Link href="/signup">Begin Your Journey</Link>
          </Button>
          <Button variant="ghost" size="lg" asChild className="rounded-full px-6 sm:px-8 text-sm sm:text-base hover:bg-accent transition-colors w-full sm:w-auto border border-border">
            <Link href="#features">Explore Features &rarr;</Link>
          </Button>
        </div>

        {/* Hero Stats Card */}
        <div className="mt-12 sm:mt-20 w-full max-w-5xl glass-panel relative overflow-hidden rounded-2xl p-2 sm:p-3">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 pointer-events-none z-10" />
          <div className="rounded-xl bg-card/50 p-5 sm:p-10 text-left relative z-0">
            <div className="flex items-center justify-between pb-3 sm:pb-4 mb-4 sm:mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="font-display font-semibold text-sm sm:text-base">Live Trajectory</div>
              <div className="text-[10px] sm:text-xs text-secondary font-mono bg-secondary/10 px-2 sm:px-2.5 py-1 rounded-lg">SYNC: ACTIVE</div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-4">
              {[
                { label: "Jobs Matched", val: "18", color: "text-primary" },
                { label: "Skill Gap %", val: "24%", color: "text-tertiary" },
                { label: "Courses Active", val: "7", color: "text-secondary" },
                { label: "Interview Score", val: "76", color: "text-foreground" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-1 sm:gap-2">
                  <span className="text-[11px] sm:text-sm font-medium text-muted-foreground">{stat.label}</span>
                  <span className={`font-display text-2xl sm:text-4xl font-bold ${stat.color}`}>{stat.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-28 relative z-10">
        <div className="mb-10 sm:mb-14 flex flex-col items-start gap-3 sm:gap-4 md:flex-row md:items-end justify-between">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight">Powerful Features</h2>
            <p className="mt-3 sm:mt-4 text-muted-foreground max-w-xl text-sm sm:text-lg">
              Precision tools designed to architect your career with intention.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {[
            { tag: "01", title: "AI Job Matching", desc: "Find roles perfectly aligned with your skills, with AI-calculated match scores." },
            { tag: "02", title: "Smart Courses", desc: "Course recommendations that close skill gaps fast. Learn only what matters." },
            { tag: "03", title: "Growth Analytics", desc: "Track your momentum with visual skill radars, streak counters, and XP tracking." },
            { tag: "04", title: "Mock Interviews", desc: "Practice with an AI interviewer that adapts difficulty and gives detailed feedback." },
            { tag: "05", title: "AI Career Coach", desc: "Chat with a smart assistant for strategy, resume help, and negotiation tips." },
            { tag: "06", title: "Focus Mode", desc: "Distraction-free environment that keeps you in flow state while you work." },
          ].map((feature, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl bg-card p-5 sm:p-7 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
              <div className="mb-4 sm:mb-6 font-mono text-sm font-bold text-primary/40 group-hover:text-primary transition-colors">{feature.tag}</div>
              <h3 className="mb-2 font-display text-lg sm:text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{feature.desc}</p>
              <div className="absolute -right-8 -bottom-8 h-28 w-28 rounded-full bg-primary/3 blur-2xl group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" />
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-28 relative z-10">
        <div className="rounded-2xl sm:rounded-3xl bg-card p-6 sm:p-10 md:p-16 relative overflow-hidden flex flex-col md:flex-row gap-8 sm:gap-16 items-center">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/3 to-transparent pointer-events-none" />
          
          <div className="flex-1 space-y-5 sm:space-y-8 relative z-10 w-full">
            <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Built for<br />Deep Focus.
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-md">
              A hyperfocus environment where every pixel serves your career growth. No clutter, no noise — just pure momentum.
            </p>
            <div className="space-y-3 sm:space-y-4">
              {[
                { step: "1", text: "Complete your skill profile" },
                { step: "2", text: "Get AI-matched jobs & courses" },
                { step: "3", text: "Track progress & level up" },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3 sm:gap-4">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center text-xs sm:text-sm font-bold text-primary shrink-0">
                    {item.step}
                  </div>
                  <span className="text-xs sm:text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 w-full glass-panel rounded-2xl aspect-[4/3] relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-tertiary/3 rounded-2xl pointer-events-none" />
            <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-full bg-background flex items-center justify-center shadow-2xl relative">
              <span className="block h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-tr from-primary to-tertiary animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-40 duration-1000" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative mx-auto mt-6 sm:mt-10 max-w-7xl px-4 sm:px-6 pb-20 sm:pb-36 text-center">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-48 w-48 sm:h-60 sm:w-60 rounded-full bg-primary/8 blur-[100px]" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-6 sm:mb-8 relative z-10">Ready to Focus?</h2>
        <Button asChild size="lg" className="rounded-full btn-gradient px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg relative z-10 shadow-xl">
          <Link href="/signup">Start Now — It&apos;s Free</Link>
        </Button>
      </section>

      <footer className="relative z-10 bg-card py-6 sm:py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">A</span>
            </div>
            <span className="font-display font-bold text-sm">ASPIRELY</span>
          </div>
          <div className="text-[11px] sm:text-xs font-medium text-muted-foreground">
            © {new Date().getFullYear()} Aspirely Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-5 text-[11px] sm:text-xs text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
