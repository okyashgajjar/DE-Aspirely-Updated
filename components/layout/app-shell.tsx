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
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar (desktop) - FIXED Position */}
      <aside className="hidden w-60 border-r border-border bg-card/10 px-4 py-6 md:fixed md:inset-y-0 md:left-0 md:flex md:flex-col md:gap-6">
        <div className="space-y-1">
          <Link href="/dashboard" className="block text-sm font-semibold">
            ASPIRELY
          </Link>
          <p className="text-xs text-muted-foreground">
            Your AI Career Advisor
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 text-sm">
          {primaryNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-2 py-1.5 transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <ThemeToggle />
          <Link
            href="/logout"
            className="rounded-md px-2 py-1 text-xs hover:bg-muted hover:text-foreground"
          >
            Logout
          </Link>
        </div>
      </aside>

      {/* Main content - ADJUSTED padding for fixed sidebar */}
      <div className="flex min-h-screen flex-1 flex-col pb-16 md:pb-0 md:pl-60">
        {/* Top bar + breadcrumbs */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
            <div className="flex flex-col">
              <nav className="text-xs text-muted-foreground">
                <ol className="flex items-center gap-1">
                  <li>
                    <Link
                      href="/dashboard"
                      className="hover:text-foreground hover:underline"
                    >
                      Home
                    </Link>
                  </li>
                  <li className="text-muted-foreground">/</li>
                  <li className="font-medium text-foreground">
                    {headerConfig.title}
                  </li>
                </ol>
              </nav>
              <div className="flex items-baseline gap-2">
                <h1 className="text-base font-semibold leading-tight">
                  {headerConfig.title}
                </h1>
                {headerConfig.description ? (
                  <p className="hidden text-xs text-muted-foreground sm:block">
                    {headerConfig.description}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6">
          {children}
        </main>

        {/* Bottom nav (mobile) */}
        <nav className="fixed inset-x-0 bottom-0 z-20 flex h-14 items-center justify-between border-t border-border bg-background/95 px-3 text-xs md:hidden">
          {primaryNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1 transition-colors",
                  active
                    ? "text-foreground"
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

