"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0">
      <circle
        cx="48"
        cy="48"
        r={r}
        stroke="hsl(var(--color-border))"
        strokeWidth="10"
        fill="none"
      />
      <circle
        cx="48"
        cy="48"
        r={r}
        stroke="hsl(var(--color-accent))"
        strokeWidth="10"
        fill="none"
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
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
    <div className="grid gap-6 md:grid-cols-2">
      <div className="glass-panel rounded-3xl p-6 border border-border/50">
        <div className="flex items-center gap-6">
          <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface-container shadow-inner">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              MIC
            </span>
            <span className="absolute -inset-2 animate-ping rounded-full border border-primary/20" />
            <span className="absolute -inset-4 animate-pulse rounded-full border border-primary/10" />
          </div>
          <div className="flex h-12 items-end gap-1.5 flex-1">
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
      <div className="glass-panel rounded-3xl p-6 border border-border/50 flex flex-col justify-center">
        <p className="font-mono text-sm text-muted-foreground font-bold tracking-widest animate-pulse">
          INITIALIZING NEURAL INTERFACE...
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
        // ignore; analytics route is optional
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "start",
          role,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to start interview");
      }
      const data = (await res.json()) as { sessionId: string; firstQuestion: string };
      startSession(data.sessionId, data.firstQuestion);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start interview");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitTextAnswer() {
    // kept for backward compatibility – not used after VoiceUI refactor
    void sessionId;
  }

  async function end() {
    if (!sessionId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "end",
          sessionId,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to end interview");
      }
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
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <section className="space-y-2">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary/80">
          Mock Interview
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-4xl font-bold tracking-tight">
              Behavioral Simulator.
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Practice dynamically. AI generates strict questions tailored to your profile.
            </p>
          </div>
          <Badge variant="outline" className="rounded-full font-mono text-xs bg-surface-container border-border/50 text-muted-foreground px-4 py-1">
            {MOCK_INTERVIEW_MODEL_ID}
          </Badge>
        </div>
      </section>

      {error ? (
        <div className="glass-panel rounded-3xl p-6 border border-destructive/20 bg-destructive/5 text-destructive font-medium text-sm text-center">
            {error}
        </div>
      ) : null}

      <div className="glass-panel rounded-3xl border border-border/50 overflow-hidden shadow-lg shadow-background/5">
        <div className="p-6 md:p-8 border-b border-border/50 flex flex-col gap-6 md:flex-row md:items-center md:justify-between bg-surface-container-low/30">
          <div>
            <h3 className="font-display text-2xl font-bold tracking-tight">Active Session</h3>
            <p className="text-sm text-muted-foreground font-medium mt-1">Configure your target role and initialize.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Input
                className="h-12 w-full md:w-[280px] rounded-full border-border/50 bg-background px-6 font-medium placeholder:text-muted-foreground/50 shadow-inner"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Target Role (e.g. AI Researcher)"
                disabled={Boolean(sessionId)}
              />
            </div>
            {!sessionId ? (
              <Button onClick={() => void start()} disabled={submitting} className="h-12 rounded-full px-8 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                {submitting ? "Initializing..." : "Start Sequence"}
              </Button>
            ) : (
              <Button onClick={() => void end()} disabled={submitting} className="h-12 rounded-full px-8 bg-destructive text-destructive-foreground font-bold shadow-lg shadow-destructive/20 hover:scale-105 active:scale-95 transition-all">
                {submitting ? "Terminating..." : "End Sequence"}
              </Button>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8 bg-background/50">
          <div className="rounded-3xl border border-border/50 bg-surface-container-low p-6 shadow-inner relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary group-hover:bg-secondary transition-colors" />
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">System Prompt</p>
            <p className="text-lg font-display text-foreground leading-relaxed">
              {currentQuestion ?? "Awaiting session initialization..."}
            </p>
          </div>

          <VoiceUI />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="glass-panel rounded-3xl border border-border/50 p-6 md:p-8 h-full">
          <div className="mb-6">
            <h3 className="font-display text-2xl font-bold tracking-tight">Telemetry & Feedback</h3>
            <p className="text-sm text-muted-foreground font-medium mt-1">Evaluation metrics from your latest session.</p>
          </div>
          
          {post ? (
            <div className="grid gap-8">
              <div className="flex items-center gap-6">
                 <div className="bg-surface-container rounded-3xl p-4 border border-border shadow-inner">
                    <Ring score={post.score} />
                 </div>
                 <div>
                    <p className="font-display text-3xl font-bold text-foreground">{post.score}/100</p>
                    <p className="font-mono text-xs font-bold tracking-widest text-primary uppercase mt-1">Overall Rating</p>
                 </div>
              </div>
              
              <div className="space-y-6">
                <div className="rounded-2xl bg-secondary/10 border border-secondary/20 p-5">
                  <p className="font-mono text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-2 mb-3">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     Identified Strengths
                  </p>
                  <ul className="space-y-2 text-sm text-foreground/80 font-medium ml-1">
                    {post.strengths.map((s, i) => (
                      <li key={i} className="flex gap-3">
                         <span className="text-secondary mt-0.5">•</span> <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-5">
                  <p className="font-mono text-[10px] font-bold text-destructive uppercase tracking-widest flex items-center gap-2 mb-3">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                     Improvement Vectors
                  </p>
                  <ul className="space-y-2 text-sm text-foreground/80 font-medium ml-1">
                    {post.improvements.map((s, i) => (
                      <li key={i} className="flex gap-3">
                         <span className="text-destructive mt-0.5">•</span> <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="rounded-2xl border border-border/50 p-5 bg-surface-container-low">
                  <p className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Execution Summary</p>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">{post.summary}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center px-4 rounded-2xl border border-dashed border-border/50 bg-background/20">
               <div className="mb-4 h-12 w-12 rounded-full border-2 border-border flex items-center justify-center text-muted-foreground opacity-50">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
               </div>
               <p className="text-sm text-muted-foreground font-medium">Awaiting session data. Complete a sequence to process evaluation metrics.</p>
            </div>
          )}
        </div>

        <div className="glass-panel rounded-3xl border border-border/50 p-6 md:p-8 h-full flex flex-col">
          <div className="mb-6">
            <h3 className="font-display text-2xl font-bold tracking-tight">Archive Log</h3>
            <p className="text-sm text-muted-foreground font-medium mt-1">Historical simulation records.</p>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {past.length === 0 ? (
              <div className="h-full min-h-[12rem] flex flex-col items-center justify-center text-center px-4 rounded-2xl border border-dashed border-border/50 bg-background/20">
                 <p className="text-sm text-muted-foreground font-medium">Archive empty. Records will materialize post-simulation.</p>
              </div>
            ) : (
              past.map((p) => (
                <details
                  key={p.id ?? `${p.role_selected}_${p.score}`}
                  className="group rounded-2xl border border-border/50 bg-surface-container-low transition-all"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 hover:bg-background/20 rounded-2xl transition-colors">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-display text-lg font-bold">{p.role_selected}</span>
                      <Badge variant="outline" className={cn("rounded-full font-mono text-[10px] px-2 py-0.5 border shadow-sm", p.score >= 80 ? "bg-secondary/10 text-secondary border-secondary/20" : p.score >= 50 ? "bg-tertiary/10 text-tertiary border-tertiary/20" : "bg-destructive/10 text-destructive border-destructive/20")}>
                        Yield: {Math.round(p.score)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-mono text-muted-foreground">
                         {new Date().toLocaleDateString()}
                       </span>
                       <svg className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </summary>
                  <div className="px-5 pb-5 pt-2 border-t border-border/50 mt-1">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 mt-2">Raw JSON Output</p>
                    <pre className="overflow-auto rounded-xl border border-border/50 bg-background p-4 text-[11px] font-mono text-muted-foreground/80 max-h-64 custom-scrollbar">
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

