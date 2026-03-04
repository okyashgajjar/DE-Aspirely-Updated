"use client";

import dynamic from "next/dynamic";
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
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border border-border bg-background/40">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
            <span className="text-sm font-semibold text-muted-foreground">
              Mic
            </span>
            <span className="absolute -inset-2 animate-pulse rounded-full border border-accent/30" />
          </div>
          <div className="flex h-10 items-end gap-1">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
                className="w-1 rounded-full bg-accent/30"
                style={{
                  height: `${10 + ((idx * 7) % 24)}px`,
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border border-border bg-background/40">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Loading voice interface…
          </p>
        </CardContent>
      </Card>
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
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Mock interview
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Practice with realistic prompts
            </h2>
            <p className="text-sm text-muted-foreground">
              Practice with voice or text. AI generates questions tailored to your profile.
            </p>
          </div>
          <Badge variant="outline">{MOCK_INTERVIEW_MODEL_ID}</Badge>
        </div>
      </section>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Interview error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">Session</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-muted-foreground">Role</label>
            <Input
              className="h-10 w-full max-w-[200px]"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. AI Researcher"
              disabled={Boolean(sessionId)}
            />
            {!sessionId ? (
              <Button onClick={() => void start()} disabled={submitting}>
                Start
              </Button>
            ) : (
              <Button variant="outline" onClick={() => void end()} disabled={submitting}>
                End session
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <p className="text-sm font-medium">Current question</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {currentQuestion ?? "Empty state: start a session to receive a question."}
            </p>
          </div>

          <VoiceUI />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Post-session feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {post ? (
            <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
              <Ring score={post.score} />
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Strengths</p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                    {post.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium">Improvements</p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                    {post.improvements.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium">Summary</p>
                  <p className="mt-2 text-sm text-muted-foreground">{post.summary}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Empty state: finish a session to see a score and feedback.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Past interviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {past.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Empty state: completed sessions will show up here.
            </p>
          ) : (
            past.map((p) => (
              <details
                key={p.id ?? `${p.role_selected}_${p.score}`}
                className="rounded-xl border border-border bg-background/40 p-4"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{p.role_selected}</span>
                    <Badge variant="outline">
                      Score {Math.round(p.score)}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </span>
                </summary>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>Full feedback</p>
                  <pre className="overflow-auto rounded-lg border border-border bg-background p-3 text-xs">
                    {JSON.stringify(p.ai_feedback, null, 2)}
                  </pre>
                </div>
              </details>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

