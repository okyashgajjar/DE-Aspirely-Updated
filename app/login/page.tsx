"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    setSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push(redirectTo);
  }

  async function signInWithGoogle() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
  }

  return (
    <main className="flex min-h-screen w-full bg-background text-foreground">
      {/* Left Side: Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2 md:px-12 lg:px-24 xl:px-32 relative z-10 shadow-2xl shadow-black/50">
        <Link
          href="/"
          className="absolute top-8 left-6 md:left-12 group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Home
        </Link>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10">
            <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Welcome Back.</h1>
            <p className="text-sm text-muted-foreground">
              Continue architecting your career.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                className="block w-full rounded-xl border border-border bg-surface-container-low px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline underline-offset-4 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                className="block w-full rounded-xl border border-border bg-surface-container-low px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {error && <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</p>}

            <Button type="submit" className="w-full rounded-full bg-gradient-to-r from-primary to-primary-container py-6 text-primary-foreground shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all font-semibold" disabled={submitting}>
              {submitting ? "Authenticating..." : "Log in"}
            </Button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              or
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-6 w-full rounded-full py-6 border-border hover:bg-surface-container-low transition-colors"
            onClick={signInWithGoogle}
          >
            Continue with Google
          </Button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            New to Aspirely?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary underline-offset-4 hover:underline transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side: Visual */}
      <div className="hidden md:flex w-1/2 relative bg-surface-container items-center justify-center overflow-hidden border-l border-border">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse pointer-events-none mix-blend-screen" />
        
        {/* Glassmorphic Badge */}
        <div className="glass-panel rounded-3xl p-12 max-w-md relative z-10 text-center border border-primary/20 shadow-2xl">
          <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-inner">
             <div className="h-6 w-6 rounded-full bg-background" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">The Digital Curator</h2>
          <p className="text-muted-foreground leading-relaxed text-sm">
            Log in to access your deeply personalized mastery feed, advanced market analytics, and adaptive AI mock interviews.
          </p>
        </div>
      </div>
    </main>
  );
}

