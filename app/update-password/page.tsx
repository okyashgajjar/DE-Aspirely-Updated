"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: UpdatePasswordValues) {
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const supabase = getSupabaseBrowserClient();

    const { error: updateError } = await supabase.auth.updateUser({
      password: values.password,
    });

    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    
    // Auto redirect after 3 seconds
    setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
  }

  return (
    <main className="flex min-h-screen w-full bg-background text-foreground justify-center relative items-center">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none mix-blend-screen" />
      
      <div className="w-full max-w-lg px-6 py-12 relative z-10 glass-panel border border-border/50 rounded-3xl m-4 shadow-2xl">
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="mb-6 h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-inner">
             <ShieldCheck className="h-8 w-8 text-background" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Create New Password</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your identity has been verified. Please choose a strong new password for your account.
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center p-8 bg-primary/5 border border-primary/20 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500">
             <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <CheckCircle2 className="h-8 w-8" />
             </div>
             <h3 className="font-display text-xl font-bold text-primary">Password Updated</h3>
             <p className="text-sm text-muted-foreground">
               Your password has been successfully reset. Redirecting you to your dashboard...
             </p>
             <Button onClick={() => router.push("/dashboard")} variant="outline" className="mt-4 rounded-full border-border hover:bg-surface-container-low transition-colors">
               Go to Dashboard now
             </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-border bg-surface-container-low px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-border bg-surface-container-low px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest"
                  {...form.register("confirmPassword")}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {error && <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</p>}

            <Button type="submit" className="w-full rounded-full bg-gradient-to-r from-primary to-primary-container py-6 text-primary-foreground shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all font-semibold" disabled={submitting}>
              {submitting ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
