"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CHAT_MODEL_OPTIONS } from "@/lib/constants";
import { useAIStore } from "@/lib/ai-store";
import type { ChatMessage } from "@/types";

function formatTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatbotClient() {
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const {
    modelId,
    messages,
    typing,
    error,
    setModelId,
    setMessages,
    setTyping,
    setError,
    addMessage,
    clearChat,
  } = useAIStore();

  const activeModelLabel = useMemo(
    () => CHAT_MODEL_OPTIONS.find((m) => m.id === modelId)?.label ?? modelId,
    [modelId],
  );

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/chat", {
          method: "GET",
        });
        if (!res.ok) {
          throw new Error("Failed to load chat history");
        }
        const data = (await res.json()) as { messages: ChatMessage[] };
        const history = data.messages ?? [];
        if (!mounted) return;
        setMessages(history);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load chat");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    void run();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function onSend() {
    const content = input.trim();
    if (!content || typing) return;
    setInput("");
    setError(null);

    const userMessage: ChatMessage = {
      role: "user",
      content,
      model_used: modelId,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          model: modelId,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to send message");
      }
      const data = (await res.json()) as { message: ChatMessage };
      const assistant = data.message;
      addMessage(assistant);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setTyping(false);
    }
  }

  async function onClear() {
    setTyping(false);
    setError(null);
    setMessages([]);
    try {
      await fetch("/api/chat", {
        method: "DELETE",
      });
      clearChat();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to clear chat");
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex h-[calc(100vh-160px)] flex-col gap-4">
      <Card className="flex h-full flex-col overflow-hidden border-border bg-card/50">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Career chatbot</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ask about roles, skills, interviews, and career strategy.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-muted-foreground">Model</label>
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
            >
              {CHAT_MODEL_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id}
                </option>
              ))}
            </select>
            <Badge variant="accent">{activeModelLabel}</Badge>
            <Button variant="outline" onClick={() => void onClear()}>
              Clear chat
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden">
          {error ? (
            <div className="rounded-lg border border-border bg-background/50 p-3 text-sm text-muted-foreground">
              {error}
            </div>
          ) : null}

          <div className="flex flex-1 flex-col gap-3 overflow-auto rounded-lg border border-border bg-background/30 p-3">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-3/4" />
                <Skeleton className="h-16 w-2/3" />
                <Skeleton className="h-16 w-1/2" />
              </div>
            ) : messages.length === 0 ? (
              <div className="rounded-lg border border-border bg-background/50 p-6 text-sm text-muted-foreground">
                Empty state: ask a question to begin.
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={`${m.role}_${idx}_${m.created_at ?? ""}`}
                  className={
                    m.role === "user"
                      ? "ml-auto w-full max-w-[85%] rounded-xl border border-border bg-card p-3"
                      : "mr-auto w-full max-w-[85%] rounded-xl border border-border bg-background/60 p-3"
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline">
                      {m.role === "assistant" ? "Assistant" : "You"}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(m.created_at)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void copy(m.content)}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div
                    className={`mt-2 text-sm leading-relaxed markdown-content ${m.role === "assistant" ? "font-medium" : ""
                      }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))
            )}

            {typing ? (
              <div className="mr-auto w-full max-w-[70%] rounded-xl border border-border bg-background/60 p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Assistant</Badge>
                  <span className="text-xs text-muted-foreground">
                    Typing…
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/60" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
                </div>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>

          <div className="flex flex-col gap-2 md:flex-row">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about roles, skills, interviews…"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void onSend();
                }
              }}
            />
            <Button onClick={() => void onSend()} disabled={typing || !input.trim()}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const tableStyles = `
.markdown-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}
.markdown-content th, .markdown-content td {
  border: 1px solid hsl(var(--border));
  padding: 0.5rem;
  text-align: left;
}
.markdown-content th {
  background-color: hsl(var(--muted)/0.5);
  font-weight: 600;
}
.markdown-content tr:nth-child(even) {
  background-color: hsl(var(--muted)/0.2);
}
.markdown-content p {
  margin-bottom: 0.5rem;
}
.markdown-content ul, .markdown-content ol {
    margin-bottom: 0.5rem;
    padding-left: 1.25rem;
}
.markdown-content li {
    margin-bottom: 0.25rem;
}
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = tableStyles;
  document.head.append(style);
}

