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
      <div className="space-y-4">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Settings
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          Notifications and preferences
        </h2>
        <p className="text-sm text-muted-foreground">
          Keep control over alerts and your theme.
        </p>
      </section>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Settings error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">Preferences</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Theme: {theme ?? "system"}</Badge>
            <Button
              variant="outline"
              onClick={() => {
                const next =
                  settings?.theme_preference === "dark" ? "light" : "dark";
                setSettings((s) =>
                  s ? { ...s, theme_preference: next } : s,
                );
                setTheme(next);
                void save();
              }}
            >
              Toggle theme
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-4">
            <div>
              <p className="text-sm font-medium">Email Alerts</p>
              <p className="text-xs text-muted-foreground">
                Important account and security notifications.
              </p>
            </div>
            <Switch
              checked={settings?.email_alerts ?? false}
              onCheckedChange={(v) =>
                setSettings((s) => {
                  const next = s ? { ...s, email_alerts: v } : s;
                  void (async () => {
                    if (!next) return;
                    try {
                      await fetch("/api/settings", {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email_alerts: v }),
                      });
                    } catch {
                      // silent fail, UI already updated
                    }
                  })();
                  return next;
                })
              }
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-4">
            <div>
              <p className="text-sm font-medium">Job Notifications</p>
              <p className="text-xs text-muted-foreground">
                New job matches based on your profile.
              </p>
            </div>
            <Switch
              checked={settings?.job_notifications ?? false}
              onCheckedChange={(v) =>
                setSettings((s) => {
                  const next = s ? { ...s, job_notifications: v } : s;
                  void (async () => {
                    if (!next) return;
                    try {
                      await fetch("/api/settings", {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ job_notifications: v }),
                      });
                    } catch {
                      // silent fail
                    }
                  })();
                  return next;
                })
              }
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-4">
            <div>
              <p className="text-sm font-medium">Weekly Digest</p>
              <p className="text-xs text-muted-foreground">
                A weekly summary of progress and suggested next steps.
              </p>
            </div>
            <Switch
              checked={settings?.weekly_digest ?? false}
              onCheckedChange={(v) =>
                setSettings((s) => {
                  const next = s ? { ...s, weekly_digest: v } : s;
                  void (async () => {
                    if (!next) return;
                    try {
                      await fetch("/api/settings", {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ weekly_digest: v }),
                      });
                    } catch {
                      // silent fail
                    }
                  })();
                  return next;
                })
              }
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/logout">Logout</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <Button variant="outline" onClick={() => setOpenDelete(true)}>
            Delete account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogHeader>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            Type <span className="font-medium">delete</span> to confirm.
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-3">
          <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </DialogContent>
        <DialogFooter
          onClose={() => {
            setOpenDelete(false);
            setConfirm("");
          }}
        >
          <Button
            variant="destructive"
            onClick={() => void deleteAccount()}
            disabled={!deleteEnabled || saving}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

