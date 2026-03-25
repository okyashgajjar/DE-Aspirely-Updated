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
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-tertiary/8 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/6 blur-[120px] pointer-events-none" />

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
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Create Account</h1>
          <p className="text-sm text-muted-foreground">
            Start your personalized career journey today.
          </p>
        </div>

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

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Password</label>
            <input
              type="password"
              className="block w-full rounded-xl bg-muted px-4 py-3 text-sm outline-none transition-all input-focus-glow border border-transparent focus:border-primary/30"
              placeholder="Minimum 6 characters"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {error && <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}

          <Button type="submit" className="w-full rounded-full btn-gradient py-5 font-semibold shadow-md" disabled={submitting}>
            {submitting ? "Creating Account..." : "Get Started"}
          </Button>
        </form>

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
          Sign up with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
