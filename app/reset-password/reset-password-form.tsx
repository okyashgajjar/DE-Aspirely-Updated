"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
        <div className="w-full max-w-md glass-panel rounded-2xl p-8 sm:p-10 relative z-10 animate-fade-in-up text-center">
          <h2 className="text-xl font-bold mb-4">Invalid Reset Link</h2>
          <p className="text-muted-foreground mb-6">
            The password reset link is invalid or missing the token. Please request a new one.
          </p>
          <Button asChild className="w-full rounded-full btn-gradient py-5 font-semibold">
            <Link href="/forgot-password">Request New Link</Link>
          </Button>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setStatus("error");
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage("Passwords do not match.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => {
          router.push("/login?reset=success");
        }, 3000);
      } else {
        const data = await res.json();
        setStatus("error");
        setErrorMessage(data.message || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again later.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-tertiary/6 blur-[120px] pointer-events-none" />

      <Link
        href="/login"
        className="absolute top-6 left-6 group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground z-10"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Login
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
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Create New Password</h1>
          <p className="text-sm text-muted-foreground">
            Please enter your new password below.
          </p>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-xl text-center space-y-3 animate-fade-in-up">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 className="font-display text-lg font-bold text-primary">Password Reset</h3>
            <p className="text-sm text-muted-foreground">
              Your password has been successfully reset. Redirecting to login...
            </p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">New Password</label>
              <input
                type="password"
                required
                className="block w-full rounded-xl bg-muted px-4 py-3 text-sm outline-none transition-all input-focus-glow border border-transparent focus:border-primary/30"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
              <input
                type="password"
                required
                className="block w-full rounded-xl bg-muted px-4 py-3 text-sm outline-none transition-all input-focus-glow border border-transparent focus:border-primary/30"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {status === "error" && (
              <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg">
                {errorMessage}
              </p>
            )}

            <Button
              type="submit"
              className="w-full rounded-full btn-gradient py-5 font-semibold shadow-md"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
