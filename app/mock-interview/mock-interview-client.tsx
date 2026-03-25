"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_INTERVIEW_MODEL_ID } from "@/lib/constants";
import { useAIStore } from "@/lib/ai-store";
import type { MockInterview } from "@/types";

const VoiceUI = dynamic(
  () => import("@/components/interview/voice-ui").then((m) => m.VoiceUI),
  {
    ssr: false,
    loading: () => <VoiceUISkeletonLoader />,
  },
);

function Ring({ score }: { score: number }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const offset = c - (pct / 100) * c;
  const color = pct >= 80 ? "var(--secondary)" : pct >= 50 ? "var(--primary)" : "var(--destructive)";
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0">
      <circle
        cx="48"
        cy="48"
        r={r}
        stroke="var(--muted)"
        strokeWidth="10"
        fill="none"
      />
      <circle
        cx="48"
        cy="48"
        r={r}
        stroke={color}
        strokeWidth="10"
        fill="none"
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
        style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
      />
      <text
        x="48"
        y="52"
        textAnchor="middle"
        fontSize="18"
        fontWeight="700"
        fill="currentColor"
      >
        {pct}
      </text>
    </svg>
  );
}

function VoiceUISkeletonLoader() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-2xl bg-muted p-5">
        <div className="flex items-center gap-5">
          <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-card">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">MIC</span>
            <span className="absolute -inset-2 animate-ping rounded-full border border-primary/20" />
          </div>
          <div className="flex h-10 items-end gap-1.5 flex-1">
            {Array.from({ length: 16 }).map((_, idx) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
                className="w-1.5 rounded-full bg-primary/20"
                style={{
                  height: `${15 + ((idx * 9) % 30)}px`,
                  opacity: 0.3 + (((idx * 7) % 10) / 10) * 0.7
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-muted p-5 flex items-center">
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          Initializing...
        </p>
      </div>
    </div>
  );
}

export function MockInterviewClient() {
  const {
    role,
    sessionId,
    currentQuestion,
    feedback: post,
    past,
    error,
    submitting,
    setRole,
    startSession,
    addTranscriptLine,
    setCurrentQuestion,
    endSession,
    setPast,
    setError,
    setSubmitting,
    resetSession,
  } = useAIStore();

  useEffect(() => {
    let mounted = true;
    async function run() {
      try {
        const res = await fetch("/api/analytics", { method: "GET" });
        if (!mounted || !res.ok) return;
        const data = (await res.json()) as { pastMockInterviews?: MockInterview[] };
        if (data.pastMockInterviews) {
          setPast(data.pastMockInterviews);
        }
      } catch {
        // ignore
      }
    }
    void run();
    return () => {
      mounted = false;
    };
  }, []);

  async function start() {
    setError(null);
    setSubmitting(true);
    resetSession();
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", role }),
      });
      if (!res.ok) throw new Error("Failed to start interview");
      const data = (await res.json()) as { sessionId: string; firstQuestion: string };
      startSession(data.sessionId, data.firstQuestion);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start interview");
    } finally {
      setSubmitting(false);
    }
  }

  async function end() {
    if (!sessionId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end", sessionId }),
      });
      if (!res.ok) throw new Error("Failed to end interview");
      const data = (await res.json()) as {
        feedback: {
          score: number;
          strengths: string[];
          improvements: string[];
          summary: string;
        };
        past: MockInterview[];
      };
      endSession(data.feedback);
      setPast(data.past);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to end interview");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <section className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">
              Mock Interview
            </h2>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              Practice with AI-generated questions tailored to your profile.
            </p>
          </div>
          <Badge className="rounded-full bg-muted text-muted-foreground border-0 text-[10px] font-mono">
            {MOCK_INTERVIEW_MODEL_ID}
          </Badge>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl bg-destructive/5 p-4 text-sm font-medium text-destructive text-center">
          {error}
        </div>
      ) : null}

      {/* Session controller */}
      <div className="rounded-2xl bg-card overflow-hidden">
        <div className="p-5 md:p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 className="font-display text-lg font-bold">Active Session</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Set your target role and begin.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              className="h-11 w-full md:w-[240px] rounded-full bg-muted px-5 font-medium border-transparent input-focus-glow text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. AI Researcher"
              disabled={Boolean(sessionId)}
            />
            {!sessionId ? (
              <Button onClick={() => void start()} disabled={submitting} className="h-11 rounded-full px-6 btn-gradient font-semibold">
                {submitting ? "Starting..." : "Begin"}
              </Button>
            ) : (
              <Button onClick={() => void end()} disabled={submitting} className="h-11 rounded-full px-6 bg-destructive text-destructive-foreground font-semibold shadow-md hover:bg-destructive/90 transition-colors">
                {submitting ? "Ending..." : "End Session"}
              </Button>
            )}
          </div>
        </div>

        <div className="p-5 md:p-6 space-y-5">
          {/* Current question */}
          <div className="rounded-2xl bg-muted/50 p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-tertiary" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 pl-3">Current Question</p>
            <p className="text-base font-medium text-foreground leading-relaxed pl-3">
              {currentQuestion ?? "Awaiting session start..."}
            </p>
          </div>

          <VoiceUI />
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Feedback */}
        <div className="rounded-2xl bg-card p-5 md:p-6 h-full">
          <div className="mb-4">
            <h3 className="font-display text-lg font-bold">Session Feedback</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Latest session evaluation.</p>
          </div>
          
          {post ? (
            <div className="space-y-5">
              <div className="flex items-center gap-5">
                <div className="bg-muted rounded-2xl p-3">
                  <Ring score={post.score} />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold">{post.score}/100</p>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mt-0.5">Overall Score</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="rounded-xl bg-secondary/5 p-4">
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    ✓ Strengths
                  </p>
                  <ul className="space-y-1.5 text-sm text-foreground/80 font-medium">
                    {post.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-secondary mt-0.5">•</span> <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="rounded-xl bg-destructive/5 p-4">
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    ⚠ Improvements
                  </p>
                  <ul className="space-y-1.5 text-sm text-foreground/80 font-medium">
                    {post.improvements.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-destructive mt-0.5">•</span> <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="rounded-xl bg-muted p-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Summary</p>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">{post.summary}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-center rounded-xl" style={{ border: '1px dashed var(--border)' }}>
              <p className="text-sm text-muted-foreground font-medium">Complete a session to see feedback.</p>
            </div>
          )}
        </div>

        {/* Past sessions */}
        <div className="rounded-2xl bg-card p-5 md:p-6 h-full flex flex-col">
          <div className="mb-4">
            <h3 className="font-display text-lg font-bold">Past Sessions</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Historical records.</p>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {past.length === 0 ? (
              <div className="h-full min-h-[10rem] flex flex-col items-center justify-center text-center rounded-xl" style={{ border: '1px dashed var(--border)' }}>
                <p className="text-sm text-muted-foreground font-medium">No past sessions yet.</p>
              </div>
            ) : (
              past.map((p) => (
                <details
                  key={p.id ?? `${p.role_selected}_${p.score}`}
                  className="group rounded-xl bg-muted transition-all"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 hover:bg-accent rounded-xl transition-colors">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-display text-sm font-bold">{p.role_selected}</span>
                      <Badge className={cn("rounded-full border-0 text-[10px] font-semibold px-2 py-0.5", p.score >= 80 ? "bg-secondary/10 text-secondary" : p.score >= 50 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive")}>
                        {Math.round(p.score)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {new Date().toLocaleDateString()}
                      </span>
                      <svg className="w-3.5 h-3.5 text-muted-foreground group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </summary>
                  <div className="px-4 pb-4 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 mt-2">Feedback Data</p>
                    <pre className="overflow-auto rounded-lg bg-card p-3 text-[11px] font-mono text-muted-foreground/80 max-h-52 custom-scrollbar">
                      {JSON.stringify(p.ai_feedback, null, 2)}
                    </pre>
                  </div>
                </details>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
