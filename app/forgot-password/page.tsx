"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    const supabase = getSupabaseBrowserClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });

    setSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSuccess(true);
  }

  return (
    <main className="flex min-h-screen w-full bg-background text-foreground justify-center relative items-center">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none mix-blend-screen" />
      
      <div className="w-full max-w-lg px-6 py-12 relative z-10 glass-panel border border-border/50 rounded-3xl m-4 shadow-2xl">
        <Link
          href="/login"
          className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to login
        </Link>

        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Reset Password</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center p-8 bg-primary/5 border border-primary/20 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500">
             <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <CheckCircle2 className="h-8 w-8" />
             </div>
             <h3 className="font-display text-xl font-bold text-primary">Check your email</h3>
             <p className="text-sm text-muted-foreground">
               We've sent a password reset link to <span className="font-semibold text-foreground">{form.getValues().email}</span>. Please check your inbox and click the link to continue.
             </p>
             <Button asChild variant="outline" className="mt-4 rounded-full border-border hover:bg-surface-container-low transition-colors">
               <Link href="/login">Return to login</Link>
             </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="block w-full rounded-xl border border-border bg-surface-container-low px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {error && <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</p>}

            <Button type="submit" className="w-full rounded-full bg-gradient-to-r from-primary to-primary-container py-6 text-primary-foreground shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all font-semibold" disabled={submitting}>
              {submitting ? "Sending Reset Link..." : "Send Reset Link"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
