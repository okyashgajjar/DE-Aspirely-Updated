"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAIStore } from "@/lib/ai-store";

function Waveform({ color = "bg-accent/70" }: { color?: string }) {
  return (
    <div className="flex h-10 items-end gap-1">
      {Array.from({ length: 12 }).map((_, idx) => (
        <div
          key={idx}
          className={`w-1 rounded-full ${color}`}
          style={{
            height: `${10 + ((idx * 11) % 22)}px`,
            animation: "pulse 1.2s ease-in-out infinite",
            animationDelay: `${idx * 80}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function VoiceUI() {
  const [answer, setAnswer] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const recognitionRef = useRef<any | null>(null);
  const speakingRef = useRef(false);

  const {
    sessionId,
    currentQuestion,
    transcript,
    submitting,
    setError,
    setSubmitting,
    addTranscriptLine,
    setCurrentQuestion,
  } = useAIStore();

  const voiceSupported = useMemo(() => {
    if (typeof window === "undefined") return false;
    const w = window as Window & {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
      speechSynthesis?: unknown;
    };
    return Boolean(
      w.SpeechRecognition || w.webkitSpeechRecognition || w.speechSynthesis,
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setMicOn(true);
    };

    recognition.onspeechstart = () => {
      setUserSpeaking(true);
      // FASTER INTERRUPTION: If AI is talking, stop it the moment sound is detected
      if (speakingRef.current && w.speechSynthesis?.speaking) {
        w.speechSynthesis.cancel();
        speakingRef.current = false;
        setAiSpeaking(false);
      }
    };

    recognition.onspeechend = () => {
      setUserSpeaking(false);
    };

    recognition.onresult = (event: any) => {
      // Backup interruption in case onspeechstart was missed
      if (speakingRef.current && w.speechSynthesis?.speaking) {
        w.speechSynthesis.cancel();
        speakingRef.current = false;
        setAiSpeaking(false);
      }

      const transcriptText = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join(" ");

      setAnswer(transcriptText);

      // Simple silence detection to submit
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        void submitTextAnswer(result[0].transcript);
      }
    };

    recognition.onend = () => {
      // Keep mic on if micOn state is true
      if (micOn) {
        try {
          recognition.start();
        } catch {
          setMicOn(false);
        }
      } else {
        setMicOn(false);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return;
      console.error("Speech Recognition Error:", event.error);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micOn, sessionId]);

  useEffect(() => {
    if (!currentQuestion || typeof window === "undefined") return;
    const w = window as any;
    if (!w.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(currentQuestion);
    utterance.onstart = () => {
      setAiSpeaking(true);
      speakingRef.current = true;
    };
    utterance.onend = () => {
      setAiSpeaking(false);
      speakingRef.current = false;
    };

    w.speechSynthesis.cancel();
    w.speechSynthesis.speak(utterance);
  }, [currentQuestion]);

  async function submitTextAnswer(finalAnswer?: string) {
    const textToSubmit = finalAnswer || answer.trim();
    if (!sessionId || !textToSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "answer",
          sessionId,
          answer: textToSubmit,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to submit answer");
      }
      const data = (await res.json()) as {
        nextQuestion: string;
        transcriptLine: string;
      };
      addTranscriptLine(data.transcriptLine);
      setAnswer("");
      setCurrentQuestion(data.nextQuestion ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border border-border bg-background/40">
        <CardContent className="space-y-3 p-4">
          <p className="text-sm font-medium">Voice UI</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {voiceSupported
              ? "Voice supported on this device."
              : "Voice not supported—text input will be used."}
          </p>

          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              className={`relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-border transition-all duration-300 ${micOn ? "bg-accent text-accent-foreground scale-110 shadow-lg" : "bg-background"
                }`}
              onClick={() => {
                const next = !micOn;
                setMicOn(next);
                if (next && recognitionRef.current && sessionId) {
                  try {
                    recognitionRef.current.start();
                  } catch {
                    setMicOn(false);
                  }
                } else if (!next && recognitionRef.current) {
                  recognitionRef.current.stop();
                }
              }}
              disabled={!sessionId}
            >
              <span className="text-sm font-semibold">{micOn ? "ON" : "OFF"}</span>
              {micOn ? (
                <span className="absolute -inset-2 animate-pulse rounded-full border border-accent/40" />
              ) : null}
            </button>
            <div className="flex gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">User Listening</p>
                {userSpeaking ? <Waveform color="bg-blue-400" /> : <div className="h-10 w-24 border-b border-dashed border-border/30" />}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">AI Speaking</p>
                {aiSpeaking ? <Waveform color="bg-accent/70" /> : <div className="h-10 w-24 border-b border-dashed border-border/30" />}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border bg-background/40">
        <CardContent className="space-y-3 p-4">
          <p className="text-sm font-medium">Your answer transcript</p>
          <div className="mt-2 space-y-2">
            {transcript.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Empty state: your answers will appear here.
              </p>
            ) : (
              transcript.slice(-4).map((line, idx) => (
                <p key={idx} className="text-sm">
                  {line}
                </p>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border bg-background/40 md:col-span-2">
        <CardContent className="space-y-3 p-4">
          <p className="text-sm font-medium">Text input fallback</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Auto-show when voice is unsupported (always available for now).
          </p>
          <div className="mt-3 flex flex-col gap-2 md:flex-row">
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer…"
              disabled={!sessionId || submitting}
            />
            <Button
              onClick={() => void submitTextAnswer()}
              disabled={!sessionId || submitting || !answer.trim()}
            >
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

