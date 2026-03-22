"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import type { Settings } from "@/types";

export function SettingsClient() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [confirm, setConfirm] = useState("");

  const [settings, setSettings] = useState<Settings | null>(null);

  const deleteEnabled = useMemo(
    () => confirm.trim().toLowerCase() === "delete",
    [confirm],
  );

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) {
          throw new Error("Failed to load settings");
        }
        const s = (await res.json()) as Settings;
        if (!mounted) return;
        setSettings(s);
        if (s.theme_preference) {
          setTheme(s.theme_preference === "system" ? "system" : s.theme_preference);
        }
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load settings");
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

  async function save() {
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_alerts: settings.email_alerts,
          job_notifications: settings.job_notifications,
          weekly_digest: settings.weekly_digest,
          theme_preference: settings.theme_preference ?? "system",
        }),
      });
      if (!res.ok) {
        const errJson = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errJson?.error ?? "Failed to save settings");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount() {
    if (!deleteEnabled) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
      });
      if (!res.ok) {
        const errJson = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errJson?.error ?? "Failed to delete account");
      }
      router.push("/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete account");
    } finally {
      setSaving(false);
      setOpenDelete(false);
      setConfirm("");
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="space-y-4 max-w-2xl">
           <Skeleton className="h-6 w-32 rounded-full bg-surface-container" />
           <Skeleton className="h-10 w-64 rounded-xl bg-surface-container" />
        </div>
        <Skeleton className="h-44 w-full rounded-3xl bg-surface-container" />
        <Skeleton className="h-[400px] w-full rounded-3xl bg-surface-container" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <section className="space-y-2">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary/80">
          Global Parameters
        </p>
        <h2 className="font-display text-4xl font-bold tracking-tight">
          System Preferences.
        </h2>
        <p className="text-sm text-muted-foreground font-medium">
          Control application telemetry, notifications, and cosmetic overrides.
        </p>
      </section>

      {error ? (
        <div className="glass-panel rounded-3xl p-6 border border-destructive/20 bg-destructive/5 text-destructive font-medium text-sm text-center">
            {error}
        </div>
      ) : null}

      <div className="glass-panel rounded-3xl border border-border/50 shadow-inner bg-surface-container-low/30 backdrop-blur-2xl overflow-hidden relative">
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
         
         <div className="p-6 md:p-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border/50 bg-background/40">
           <div className="space-y-1 relative">
             <h3 className="font-display text-2xl font-bold tracking-tight">Aesthetics Override</h3>
             <p className="text-sm text-muted-foreground font-medium">
                Switch visual parameters between ocular modes.
             </p>
           </div>
           
           <div className="flex items-center gap-4 bg-surface-container p-2 rounded-2xl border border-border/50 shadow-inner">
              <Badge variant="outline" className="rounded-full bg-background border-border/50 font-mono text-[10px] px-3 py-1 text-foreground">
                 STATUS: {theme?.toUpperCase() ?? "SYSTEM"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full font-bold tracking-widest uppercase text-[10px] shadow-sm hover:scale-105 active:scale-95 transition-all"
                onClick={() => {
                  const next = settings?.theme_preference === "dark" ? "light" : "dark";
                  setSettings((s) => s ? { ...s, theme_preference: next } : s);
                  setTheme(next);
                  void save();
                }}
              >
                Toggle Optics
              </Button>
           </div>
         </div>

         <div className="p-6 md:p-8 space-y-6 bg-background/20">
            <h3 className="font-display text-xl font-bold tracking-tight mb-4">Telemetry Config</h3>
            
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-surface-container p-5 hover:bg-surface-container-low transition-colors group">
              <div>
                <p className="font-display text-lg font-bold">Email Alerts</p>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                  Important account and security telemetry packets.
                </p>
              </div>
              <Switch
                className="data-[state=checked]:bg-primary"
                checked={settings?.email_alerts ?? false}
                onCheckedChange={(v) =>
                  setSettings((s) => {
                    const next = s ? { ...s, email_alerts: v } : s;
                    void (async () => {
                      if (!next) return;
                      try { await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email_alerts: v }) }); } catch {}
                    })();
                    return next;
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-surface-container p-5 hover:bg-surface-container-low transition-colors group">
              <div>
                <p className="font-display text-lg font-bold">Opportunity Ping</p>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                  Immediate alerts for high-probability job matches.
                </p>
              </div>
              <Switch
                className="data-[state=checked]:bg-secondary"
                checked={settings?.job_notifications ?? false}
                onCheckedChange={(v) =>
                  setSettings((s) => {
                    const next = s ? { ...s, job_notifications: v } : s;
                    void (async () => {
                      if (!next) return;
                      try { await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ job_notifications: v }) }); } catch {}
                    })();
                    return next;
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-surface-container p-5 hover:bg-surface-container-low transition-colors group">
              <div>
                <p className="font-display text-lg font-bold">Weekly Diagnostics</p>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                  Executive summary of simulation results and analytics.
                </p>
              </div>
              <Switch
                className="data-[state=checked]:bg-tertiary"
                checked={settings?.weekly_digest ?? false}
                onCheckedChange={(v) =>
                  setSettings((s) => {
                    const next = s ? { ...s, weekly_digest: v } : s;
                    void (async () => {
                      if (!next) return;
                      try { await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weekly_digest: v }) }); } catch {}
                    })();
                    return next;
                  })
                }
              />
            </div>

            <div className="pt-6 border-t border-border/50 flex justify-end">
              <Button asChild className="h-12 rounded-full px-8 bg-destructive/10 text-destructive font-bold hover:bg-destructive hover:text-destructive-foreground transition-all">
                <Link href="/logout">Logout Uplink</Link>
              </Button>
            </div>
         </div>
      </div>

      <div className="glass-panel rounded-3xl border border-destructive/20 bg-destructive/5 overflow-hidden">
         <div className="p-6 md:p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
           <div className="space-y-1">
             <h3 className="font-display text-2xl font-bold tracking-tight text-destructive">System Erase</h3>
             <p className="text-sm font-medium opacity-80 text-foreground">
               Permanently wipe telemetry and neural profiles from sector.
             </p>
           </div>
           <Button variant="destructive" onClick={() => setOpenDelete(true)} className="rounded-full shadow-lg shadow-destructive/20 font-bold tracking-wide">
             Initialize Protocol
           </Button>
         </div>
      </div>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="glass-panel border-border/50 bg-background/90 backdrop-blur-2xl rounded-3xl p-8 max-w-md shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-display text-2xl font-bold text-destructive">Wipe Protocol Authorized</DialogTitle>
            <DialogDescription className="text-sm font-medium text-foreground/80 mt-2">
              Type <span className="font-mono font-bold text-destructive select-all">delete</span> to override safety protocols.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
                 value={confirm} 
                 onChange={(e) => setConfirm(e.target.value)} 
                 placeholder="Awaiting override sequence..."
                 className="h-12 rounded-full border-destructive/30 bg-destructive/5 text-destructive font-mono font-bold text-center tracking-widest focus-visible:ring-destructive/50 placeholder:text-destructive/30"
            />
          </div>
          <DialogFooter className="mt-2 outline-none border-none">
             <div className="flex items-center gap-3 w-full">
                <Button
                  variant="ghost"
                  className="flex-1 rounded-full text-foreground hover:bg-surface-container"
                  onClick={() => {
                    setOpenDelete(false);
                    setConfirm("");
                  }}
                >
                  Abort
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 rounded-full font-bold shadow-lg shadow-destructive/20"
                  onClick={() => void deleteAccount()}
                  disabled={!deleteEnabled || saving}
                >
                  Confirm Erase
                </Button>
             </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

