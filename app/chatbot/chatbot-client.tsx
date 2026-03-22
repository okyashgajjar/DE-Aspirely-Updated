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
    <div className="flex h-[calc(100vh-140px)] flex-col gap-6 animate-fade-in-up">
      <div className="flex flex-col gap-2">
         <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary/80">
            Secure Communications
         </p>
         <h2 className="font-display text-4xl font-bold tracking-tight">
            AI Career Chatbot.
         </h2>
         <p className="text-sm text-muted-foreground font-medium">
            Ask about roles, skills, interviews, and career strategy.
         </p>
      </div>

      <div className="glass-panel rounded-3xl flex h-full flex-col overflow-hidden border border-border/50 shadow-inner bg-surface-container-low/30 backdrop-blur-2xl">
        <div className="flex flex-col gap-4 border-b border-border/50 p-6 bg-background/40 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
             <div className="relative flex h-3 w-3 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
             </div>
             <span className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Uplink Active
             </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
               <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Model</label>
               <select
                 className="h-10 rounded-full border border-border/50 bg-surface-container px-4 text-xs font-medium outline-none focus-visible:ring-1 focus-visible:ring-primary/50 shadow-inner"
                 value={modelId}
                 onChange={(e) => setModelId(e.target.value)}
               >
                 {CHAT_MODEL_OPTIONS.map((m) => (
                   <option key={m.id} value={m.id}>
                     {m.id}
                   </option>
                 ))}
               </select>
               <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 text-[10px]">
                 {activeModelLabel}
               </Badge>
            </div>
            
            <Button variant="outline" size="sm" onClick={() => void onClear()} className="rounded-full border-border/50 bg-background hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors">
              Clear Log
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden p-6 md:p-8">
          {error ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive text-center">
              {error}
            </div>
          ) : null}

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="space-y-4 max-w-2xl">
                <Skeleton className="h-20 w-[80%] rounded-2xl rounded-bl-none bg-surface-container" />
                <Skeleton className="h-24 w-[90%] rounded-2xl rounded-bl-none bg-surface-container ml-auto" />
                <Skeleton className="h-16 w-[70%] rounded-2xl rounded-bl-none bg-surface-container" />
              </div>
            ) : messages.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center px-4 rounded-3xl border border-dashed border-border/50 bg-background/20 mt-4 max-h-64">
                   <div className="mb-4 h-12 w-12 rounded-full border-2 border-border/50 flex items-center justify-center text-muted-foreground opacity-50">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                   </div>
                   <p className="text-sm text-muted-foreground font-medium">Comm-link established. Input query to begin.</p>
               </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={`${m.role}_${idx}_${m.created_at ?? ""}`}
                  className={
                    m.role === "user"
                      ? "ml-auto w-full max-w-[85%] rounded-3xl rounded-br-sm border border-primary/20 bg-primary/10 shadow-sm p-5"
                      : "mr-auto w-full max-w-[85%] rounded-3xl rounded-bl-sm border border-border/50 bg-surface-container-low p-5 shadow-sm"
                  }
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                        {m.role === "assistant" ? (
                             <Badge variant="outline" className="rounded-full bg-secondary/10 text-secondary border-secondary/20 text-[10px]">
                                AI SYSTEM
                             </Badge>
                        ) : (
                             <Badge variant="outline" className="rounded-full bg-primary/20 text-primary border-primary/30 text-[10px]">
                                USER
                             </Badge>
                        )}
                        <span className="font-mono text-[10px] text-muted-foreground/70">
                            {formatTime(m.created_at)}
                        </span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:bg-surface-container rounded-full"
                      onClick={() => void copy(m.content)}
                    >
                      Copy
                    </Button>
                  </div>
                  <div
                    className={`text-sm leading-relaxed markdown-content ${m.role === "assistant" ? "text-foreground" : "text-foreground font-medium"
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
              <div className="mr-auto w-full max-w-[70%] rounded-3xl rounded-bl-sm border border-border/50 bg-surface-container-low p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="outline" className="rounded-full bg-secondary/10 text-secondary border-secondary/20 text-[10px] animate-pulse">
                     PROCESSING
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 h-6">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
                </div>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>

          <div className="mt-2 flex flex-col gap-3 md:flex-row relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Awaiting query input..."
              className="h-14 rounded-full border-border/50 bg-background/50 px-6 font-medium shadow-inner backdrop-blur focus-visible:ring-primary/50 text-base"
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
                className="h-14 rounded-full px-8 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 md:w-auto w-full transition-all"
             >
                <span className="tracking-wider uppercase text-xs">Transmit</span>
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

