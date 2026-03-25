"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setStatus("error");
      setErrorMessage("Please enter an email address.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
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
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-xl text-center space-y-3 animate-fade-in-up">
            <h3 className="font-display text-lg font-bold text-primary">Check your email</h3>
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent a password reset link to <span className="font-semibold text-foreground">{email}</span>.
            </p>
            <Button
              type="button"
              onClick={() => {
                setStatus("idle");
                setEmail("");
              }}
              variant="ghost"
              className="mt-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Didn&apos;t receive the email? Try again
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                required
                className="block w-full rounded-xl bg-muted px-4 py-3 text-sm outline-none transition-all input-focus-glow border border-transparent focus:border-primary/30"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {status === "submitting" ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
