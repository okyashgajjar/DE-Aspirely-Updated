"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function SettingsClient() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!mounted) return;
        setEmail(data.user?.email ?? "");
        setName(data.user?.name ?? "");
      } catch {
        // fallback
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void run();
    return () => { mounted = false; };
  }, []);

  async function onSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      if (!res.ok) throw new Error("Deletion failed");
      router.push("/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
      setConfirmText("");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up max-w-3xl">
        <Skeleton className="h-8 w-36 rounded-full bg-muted" />
        <Skeleton className="h-[300px] w-full rounded-2xl bg-muted" />
        <Skeleton className="h-[120px] w-full rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up max-w-3xl">
      <section className="space-y-1.5">
        <h2 className="font-display text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground font-medium">Account, theme, and application preferences.</p>
      </section>

      {error && (
        <div className="rounded-2xl bg-destructive/5 p-4 text-sm font-medium text-destructive text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-2xl bg-secondary/5 p-4 text-sm font-medium text-secondary text-center">
          Settings saved successfully.
        </div>
      )}

      {/* Account */}
      <div className="rounded-2xl bg-card overflow-hidden">
        <div className="p-5 md:p-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-display text-lg font-bold">Account</h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage your identity and login credentials.</p>
        </div>
        <div className="p-5 md:p-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-full bg-muted px-5 border-transparent input-focus-glow font-medium text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</label>
              <Input
                value={email}
                disabled
                className="h-11 rounded-full bg-muted px-5 border-transparent font-medium text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => void onSave()} disabled={saving} className="rounded-full btn-gradient px-6 font-semibold">
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-2xl bg-card overflow-hidden">
        <div className="p-5 md:p-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-display text-lg font-bold">Appearance</h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Choose your visual mode.</p>
        </div>
        <div className="p-5 md:p-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 rounded-xl p-4 text-center transition-all ${
                isDark
                  ? "bg-primary/10 ring-2 ring-primary font-semibold text-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              <div className="text-xl mb-1.5">🌙</div>
              <span className="text-xs font-semibold">Dark</span>
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 rounded-xl p-4 text-center transition-all ${
                !isDark
                  ? "bg-primary/10 ring-2 ring-primary font-semibold text-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              <div className="text-xl mb-1.5">☀️</div>
              <span className="text-xs font-semibold">Light</span>
            </button>
          </div>
        </div>
      </div>

      {/* Session */}
      <div className="rounded-2xl bg-card overflow-hidden">
        <div className="p-5 md:p-6 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold">Session</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Sign out of your current session.</p>
          </div>
          <Button variant="outline" onClick={() => void signOut({ callbackUrl: "/login" })} className="rounded-full border-border font-semibold text-sm">
            Sign Out
          </Button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl bg-destructive/5 overflow-hidden">
        <div className="p-5 md:p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-destructive">Danger Zone</h3>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">Permanently delete your account and all data.</p>
          </div>
          <Button variant="destructive" onClick={() => setConfirmDeleteOpen(true)} className="rounded-full font-semibold">
            Delete Account
          </Button>
        </div>
      </div>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="bg-card rounded-2xl p-6 max-w-md shadow-2xl">
          <DialogHeader className="mb-3">
            <DialogTitle className="font-display text-xl font-bold text-destructive">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground mt-1.5">
              Type <span className="font-mono font-bold text-destructive select-all">delete</span> to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type 'delete'"
              className="h-11 rounded-full bg-destructive/5 border-destructive/20 text-destructive font-mono font-bold text-center tracking-widest input-focus-glow"
            />
          </div>
          <DialogFooter className="mt-1 flex items-center gap-3 w-full">
            <Button variant="ghost" className="flex-1 rounded-full" onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1 rounded-full font-semibold" onClick={() => void onDelete()} disabled={confirmText.trim().toLowerCase() !== "delete" || deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
