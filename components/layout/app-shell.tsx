"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/utils/cn";

type NavItem = {
  href: string;
  label: string;
};

const primaryNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
  { href: "/courses", label: "Courses" },
  { href: "/analytics", label: "Analytics" },
  { href: "/chatbot", label: "Chatbot" },
  { href: "/mock-interview", label: "Mock Interview" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

const shellRoutes = new Set<string>([
  "/dashboard",
  "/jobs",
  "/courses",
  "/analytics",
  "/chatbot",
  "/mock-interview",
  "/profile",
  "/settings",
]);

const routeTitles: Record<string, { title: string; description?: string }> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Your personalized AI career overview.",
  },
  "/jobs": {
    title: "Job Matches",
    description: "Roles tailored to your skills and goals.",
  },
  "/courses": {
    title: "Courses",
    description: "Targeted learning to close your skill gaps.",
  },
  "/analytics": {
    title: "Analytics",
    description: "See how your effort compounds over time.",
  },
  "/chatbot": {
    title: "AI Career Chatbot",
    description: "Ask anything about your career journey.",
  },
  "/mock-interview": {
    title: "Mock Interviews",
    description: "Practice interviews with realtime AI feedback.",
  },
  "/profile": {
    title: "Profile",
    description: "Keep your skills, goals, and experience up to date.",
  },
  "/settings": {
    title: "Settings",
    description: "Control notifications, theme, and account safety.",
  },
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isShellRoute = pathname ? shellRoutes.has(pathname) : false;

  if (!isShellRoute) {
    return children;
  }

  const headerConfig = routeTitles[pathname ?? ""] ?? {
    title: "Aspirely",
    description: "Your AI career companion.",
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Sidebar (desktop) - FIXED Position */}
      <aside className="hidden w-64 border-r border-border/50 bg-surface-container-low/50 backdrop-blur-xl px-4 py-6 md:fixed md:inset-y-0 md:left-0 md:flex md:flex-col md:gap-8 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="space-y-1 pl-2">
          <Link href="/dashboard" className="block font-display text-2xl font-bold tracking-tight text-primary hover:opacity-80 transition-opacity">
            Aspirely<span className="text-foreground">.</span>
          </Link>
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
            AI Career Advisor
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-2 text-sm font-medium">
          {primaryNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-xl px-4 py-3 transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                    : "text-muted-foreground hover:bg-surface-container hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center justify-between gap-3 rounded-2xl bg-surface-container p-3 border border-border/50">
          <ThemeToggle />
          <Link
            href="/logout"
            className="flex-1 text-center rounded-xl bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
          >
            Logout
          </Link>
        </div>
      </aside>

      {/* Main content - ADJUSTED padding for fixed sidebar */}
      <div className="flex min-h-screen flex-1 flex-col pb-20 md:pb-0 md:pl-64">
        {/* Top bar + breadcrumbs */}
        <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 pt-2">
            <div className="flex flex-col">
              <nav className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1">
                <ol className="flex items-center gap-2">
                  <li>
                    <Link
                      href="/dashboard"
                      className="hover:text-primary transition-colors hover:underline"
                    >
                      Home
                    </Link>
                  </li>
                  <li className="text-border">/</li>
                  <li className="text-foreground">
                    {headerConfig.title}
                  </li>
                </ol>
              </nav>
              <div className="flex items-baseline gap-3">
                <h1 className="font-display text-xl font-bold leading-tight relative top-0.5">
                  {headerConfig.title}
                </h1>
                {headerConfig.description ? (
                  <p className="hidden text-xs font-medium text-muted-foreground sm:block relative top-0.5">
                    {headerConfig.description}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 md:px-8">
          {children}
        </main>

        {/* Bottom nav (mobile) */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-between border-t border-border/50 bg-background/80 backdrop-blur-xl px-2 text-[10px] font-bold uppercase tracking-wider md:hidden shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
          {primaryNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl p-2 transition-all duration-200",
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

