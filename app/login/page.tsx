"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    setError(null);
    setMagicLinkSent(false);

    if (isMagicLink) {
      const res = await signIn("email", {
        email: values.email,
        redirect: false,
        callbackUrl: redirectTo,
      });
      setSubmitting(false);
      if (res?.error) {
        setError("Could not send magic link. Please try again.");
      } else {
        setMagicLinkSent(true);
      }
      return;
    }

    if (!values.password || values.password.length < 6) {
      form.setError("password", { type: "manual", message: "Password must be at least 6 characters." });
      setSubmitting(false);
      return;
    }

    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    setSubmitting(false);

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function signInWithGoogle() {
    await signIn("google", { callbackUrl: redirectTo });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-tertiary/6 blur-[120px] pointer-events-none" />

      <Link
        href="/"
        className="absolute top-6 left-6 group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground z-10"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Home
      </Link>

      <div className="w-full max-w-md glass-panel rounded-2xl p-8 sm:p-10 relative z-10 animate-fade-in-up">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-display text-lg font-bold tracking-tight">Aspirely</span>
        </div>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to continue your career journey.
          </p>
        </div>

        {magicLinkSent ? (
          <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-xl text-center space-y-3 animate-fade-in-up mb-6">
            <h3 className="font-display text-lg font-bold text-primary">Check your email</h3>
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent a secure login link to <span className="font-semibold text-foreground">{form.getValues().email}</span>.
            </p>
            <Button type="button" onClick={() => setMagicLinkSent(false)} variant="ghost" className="mt-2 text-xs text-muted-foreground hover:text-foreground">
              Wrong email? Try again
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                className="block w-full rounded-xl bg-muted px-4 py-3 text-sm outline-none transition-all input-focus-glow border border-transparent focus:border-primary/30"
                placeholder="you@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {!isMagicLink && (
              <div className="space-y-2 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Password</label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline underline-offset-4 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  className="block w-full rounded-xl bg-muted px-4 py-3 text-sm outline-none transition-all input-focus-glow border border-transparent focus:border-primary/30"
                  placeholder="••••••••"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            )}

            {error && <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}

            <Button type="submit" className="w-full rounded-full btn-gradient py-5 font-semibold shadow-md" disabled={submitting}>
              {submitting ? "Signing in..." : isMagicLink ? "Send Magic Link" : "Sign In"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsMagicLink(!isMagicLink);
                setError(null);
                form.clearErrors("password");
              }}
              className="w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              disabled={submitting}
            >
              {isMagicLink ? "Use password instead" : "Use Magic Link instead"}
            </Button>
          </form>
        )}

        <div className="mt-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-5 w-full rounded-full py-5 border-border hover:bg-accent transition-colors"
          onClick={signInWithGoogle}
        >
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to Aspirely?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline underline-offset-4 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
