"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/utils/cn";
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  BarChart3,
  MessageSquare,
  Mic,
  User,
  Settings,
  LogOut,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const primaryNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/chatbot", label: "Chatbot", icon: MessageSquare },
  { href: "/mock-interview", label: "Interview", icon: Mic },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
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
      {/* Sidebar (desktop) */}
      <aside className="hidden w-[240px] bg-sidebar px-3 py-5 md:fixed md:inset-y-0 md:left-0 md:flex md:flex-col md:gap-6 z-30">
        {/* Logo */}
        <div className="px-3 py-2">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              Aspirely
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 text-sm font-medium">
          {primaryNav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group",
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span className="truncate">{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto space-y-2 px-1">
          <div className="flex items-center justify-between rounded-xl bg-accent/50 p-2.5">
            <ThemeToggle />
            <Link
              href="/logout"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col pb-24 md:pb-0 md:pl-[240px]">
        {/* Top header */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-lg font-bold tracking-tight">
                {headerConfig.title}
              </h1>
              {headerConfig.description ? (
                <p className="hidden text-xs font-medium text-muted-foreground sm:block">
                  {headerConfig.description}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="h-px bg-border" />
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-4 md:px-8 md:py-6">
          {children}
        </main>

        {/* Bottom nav (mobile) */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-start overflow-x-auto scrollbar-hide bg-background/90 backdrop-blur-xl px-2 md:hidden shadow-[0_-1px_0_var(--border)]">
          {primaryNav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl p-2 px-3 transition-all duration-200 min-w-[64px]",
                  active
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-primary")} />
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-wider truncate",
                  active ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
