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
    <main className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Background Orbs / Glow */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-secondary/10 blur-[150px] pointer-events-none" />

      {/* Floating Glass Navbar */}
      <nav className="fixed top-6 left-1/2 z-50 flex w-[90%] max-w-5xl -translate-x-1/2 items-center justify-between rounded-full glass-panel px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display text-lg font-bold tracking-tight">
            ASPIRELY
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <Link href="#features" className="hover:text-foreground transition-colors">Experience</Link>
            <Link href="#philosophy" className="hover:text-foreground transition-colors">Philosophy</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Log In
          </Link>
          <Button asChild className="rounded-full bg-gradient-to-br from-primary to-primary-container text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 active:scale-95">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center justify-center px-6 pt-32 text-center lg:pt-40">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
          The Digital Curator of Careers
        </div>
        
        <h1 className="font-display text-5xl font-extrabold tracking-tighter sm:text-7xl lg:text-8xl w-full max-w-5xl leading-[1.1]">
          Unveil the <br /> <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">Extraordinary.</span>
        </h1>
        
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl font-medium leading-relaxed">
          Step into a high-agency environment where job matching, analytics, and mock interviews adapt instantly to your ambitions. Navigate your career like a masterpiece.
        </p>
        
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="rounded-full bg-gradient-to-br from-primary to-primary-container px-8 text-base shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto">
            <Link href="/signup">Begin Your Journey</Link>
          </Button>
          <Button variant="ghost" size="lg" asChild className="rounded-full px-8 text-base hover:bg-surface-container-low transition-colors w-full sm:w-auto border border-border">
            <Link href="#features">Explore Curations &rarr;</Link>
          </Button>
        </div>

        {/* Hero Visual Glass Card */}
        <div className="mt-20 w-full max-w-5xl glass-panel relative overflow-hidden rounded-3xl border border-border/50 bg-background/40 p-2 sm:p-4">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 pointer-events-none z-10" />
          <div className="rounded-2xl bg-surface-container-low/50 p-6 sm:p-10 text-left relative z-0">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <div className="font-display font-semibold">Live Trajectory</div>
              <div className="text-xs text-secondary font-mono bg-secondary/10 px-2 py-1 rounded">SYNC: ACTIVE</div>
            </div>
            <div className="grid gap-6 sm:grid-cols-4">
              {[
                { label: "Jobs Matched", val: "18", color: "text-primary" },
                { label: "Skill Gap %", val: "24%", color: "text-secondary" },
                { label: "Courses Suggested", val: "7", color: "text-tertiary" },
                { label: "Interview Score", val: "76", color: "text-foreground" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                  <span className={`font-display text-4xl font-bold ${stat.color}`}>{stat.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-32 relative z-10">
        <div className="mb-16 flex flex-col items-start gap-4 md:flex-row md:items-end justify-between">
          <div>
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Pillars of Curation</h2>
            <p className="mt-4 text-muted-foreground max-w-xl text-lg">
              Precision tools designed not just to track your career, but to architect it with intention.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { tag: "01", title: "Precision Matching", desc: "Find roles perfectly aligned with your current strengths and closing skill gaps." },
            { tag: "02", title: "Intelligent Learning", desc: "Course recommendations that move the needle. Learn only what matters." },
            { tag: "03", title: "Impact Analytics", desc: "Track your momentum with deeply visual, gamified weekly insights." },
            { tag: "04", title: "Voice AI Simulator", desc: "Practice mock interviews against an adapting, high-fidelity AI persona." },
            { tag: "05", title: "Career Concierge", desc: "A smart chatbot for instant strategy, resume rewrites, and negotiation." },
            { tag: "06", title: "Sovereign Control", desc: "Absolute command over your data, goals, and visibility settings." }
          ].map((feature, i) => (
            <div key={i} className="group relative overflow-hidden rounded-3xl glass-panel p-8 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10">
              <div className="mb-8 font-mono text-sm font-bold text-primary/50 group-hover:text-primary transition-colors">{feature.tag}</div>
              <h3 className="mb-3 font-display text-2xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              
              <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/20 transition-all duration-500 pointer-events-none" />
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy / The Curator Section */}
      <section id="philosophy" className="mx-auto max-w-7xl px-6 py-32 relative z-10">
        <div className="rounded-[40px] bg-surface-container-low p-10 sm:p-20 relative overflow-hidden flex flex-col md:flex-row gap-16 items-center">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          
          <div className="flex-1 space-y-8 relative z-10">
            <h2 className="font-display text-4xl sm:text-6xl font-bold leading-tight">The Digital <br/>Curator.</h2>
            <p className="text-lg text-muted-foreground max-w-md">
              We reject the cluttered, boxy layouts of standard career platforms. Aspirely is built like a high-end gallery space—where your potential is the art, and the interface is the sophisticated atmosphere that empowers you to reach it.
            </p>
            <Button variant="outline" className="rounded-full rounded-tr-none px-6 py-6 border-border hover:bg-surface-container-highest">
              Read Our Manifesto
            </Button>
          </div>
          
          <div className="flex-1 w-full glass-panel rounded-3xl aspect-[4/3] relative flex items-center justify-center border-border/50">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl pointer-events-none" />
             <div className="h-32 w-32 rounded-full bg-background flex items-center justify-center shadow-2xl relative">
                <span className="block h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-secondary animate-pulse" />
                <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-50 duration-1000" />
             </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="relative mx-auto mt-20 max-w-7xl px-6 pb-40 text-center">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
        </div>
        <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-tight mb-8 relative z-10">Ready to Ascend?</h2>
        <Button asChild size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-10 py-6 text-lg relative z-10 shadow-2xl hover:scale-105 transition-transform">
          <Link href="/signup">Enter the Dashboard</Link>
        </Button>
      </section>

      <footer className="relative z-10 border-t border-border bg-background py-10 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display font-bold text-lg">ASPIRELY</div>
          <div className="text-sm font-medium text-muted-foreground">
            © {new Date().getFullYear()} Aspirely Inc. The Sovereign Console.
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
