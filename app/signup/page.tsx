"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignupValues) {
    setSubmitting(true);
    setError(null);

    // 1. Register the user
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Sign up failed. Please try again.");
      setSubmitting(false);
      return;
    }

    // 2. Auto sign-in after registration
    const signInRes = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    setSubmitting(false);

    if (signInRes?.error) {
      setError("Account created but auto-login failed. Please log in.");
      router.push("/login");
      return;
    }

    router.push("/onboarding");
    router.refresh();
  }

  async function signInWithGoogle() {
    await signIn("google", { callbackUrl: "/onboarding" });
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
            <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Ascend Today.</h1>
            <p className="text-sm text-muted-foreground">
              Create an account to start your personalized onboarding.
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
              <label className="text-sm font-medium text-muted-foreground">Password</label>
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
              {submitting ? "Provisioning Sandbox..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-6 w-full rounded-full py-6 border-border hover:bg-surface-container-low transition-colors"
            onClick={signInWithGoogle}
          >
            Sign up with Google
          </Button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side: Visual */}
      <div className="hidden md:flex w-1/2 relative bg-surface-container items-center justify-center overflow-hidden border-l border-border">
        <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 via-transparent to-primary/10" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-[120px] animate-pulse pointer-events-none mix-blend-screen" />
        <div className="glass-panel rounded-3xl p-12 max-w-md relative z-10 text-center border border-secondary/20 shadow-2xl">
          <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-bl from-secondary to-primary flex items-center justify-center shadow-inner">
            <div className="h-8 w-8 rounded-full bg-background/50 border border-background/20 backdrop-blur-md" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">Precision Driven.</h2>
          <p className="text-muted-foreground leading-relaxed text-sm">
            Stop guessing your next career move. Sign up to unlock skill gap analysis tailored specifically to the roles you actually want.
          </p>
        </div>
      </div>
    </main>
  );
}
