"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col animate-fade-in-up" style={{ height: 'calc(100dvh - 180px)' }}>
      {/* Title — compact on mobile */}
      <div className="mb-3 sm:mb-4 shrink-0">
        <h2 className="font-display text-xl sm:text-3xl font-bold tracking-tight">
          AI Career Coach
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5 hidden sm:block">
          Ask about roles, skills, interviews, and career strategy.
        </p>
      </div>

      {/* Chat Card — takes remaining space */}
      <div className="rounded-2xl flex flex-1 min-h-0 flex-col overflow-hidden bg-card">
        {/* Chat header — single row on mobile */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
            </span>
            <select
              className="h-7 rounded-full bg-muted px-2.5 text-[11px] font-medium outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
            >
              {CHAT_MODEL_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <Button variant="ghost" size="sm" onClick={() => void onClear()} className="rounded-full text-[11px] h-7 px-2.5 hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0">
            Clear
          </Button>
        </div>

        {/* Messages area — scrollable */}
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
          {error ? (
            <div className="rounded-xl bg-destructive/5 mx-3 mt-2 p-2.5 text-xs font-medium text-destructive text-center shrink-0">
              {error}
            </div>
          ) : null}

          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="space-y-3 max-w-2xl">
                <Skeleton className="h-14 w-[80%] rounded-2xl bg-muted" />
                <Skeleton className="h-16 w-[75%] rounded-2xl bg-muted ml-auto" />
                <Skeleton className="h-12 w-[70%] rounded-2xl bg-muted" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 rounded-2xl max-h-40" style={{ border: '1px dashed var(--border)' }}>
                <div className="mb-2 text-xl">💬</div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Start a conversation to get career advice.</p>
              </div>
            ) : (
              <>
                {messages.map((m, idx) => (
                  <div
                    key={`${m.role}_${idx}_${m.created_at ?? ""}`}
                    className={
                      m.role === "user"
                        ? "ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary/10 px-3 py-2.5 sm:px-4 sm:py-3"
                        : "mr-auto w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2.5 sm:px-4 sm:py-3"
                    }
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {m.role === "assistant" ? (
                        <Badge className="rounded-full bg-secondary/10 text-secondary border-0 text-[10px] h-4 px-1.5">AI</Badge>
                      ) : (
                        <Badge className="rounded-full bg-primary/20 text-primary border-0 text-[10px] h-4 px-1.5">You</Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground/60 font-mono">{formatTime(m.created_at)}</span>
                      <button
                        className="ml-auto text-[10px] text-muted-foreground/50 hover:text-muted-foreground font-semibold uppercase tracking-wider"
                        onClick={() => void copy(m.content)}
                      >
                        Copy
                      </button>
                    </div>
                    <div className={`text-xs sm:text-sm leading-relaxed markdown-content ${m.role === "assistant" ? "text-foreground" : "text-foreground font-medium"}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}

                {typing ? (
                  <div className="mr-auto w-fit max-w-[70%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2.5">
                    <Badge className="rounded-full bg-secondary/10 text-secondary border-0 text-[10px] animate-pulse mb-1">Thinking...</Badge>
                    <div className="flex items-center gap-1.5 h-4">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
                    </div>
                  </div>
                ) : null}

                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input — always at bottom, single row */}
          <div className="shrink-0 flex items-center gap-2 p-3 sm:p-4" style={{ borderTop: '1px solid var(--border)' }}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="h-10 sm:h-11 flex-1 rounded-full bg-muted px-4 font-medium border-transparent input-focus-glow text-xs sm:text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void onSend();
                }
              }}
            />
            <Button
              onClick={() => void onSend()}
              disabled={typing || !input.trim()}
              className="h-10 sm:h-11 rounded-full px-4 sm:px-6 btn-gradient font-semibold text-xs sm:text-sm shrink-0"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
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
  border: 1px solid var(--border);
  padding: 0.5rem;
  text-align: left;
}
.markdown-content th {
  background-color: var(--muted);
  font-weight: 600;
}
.markdown-content tr:nth-child(even) {
  background-color: var(--accent);
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
