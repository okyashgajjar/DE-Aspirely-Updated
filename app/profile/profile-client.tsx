"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { OnboardingProfile } from "@/types";

function parseList(value: string) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ProfileClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [skillsText, setSkillsText] = useState("");
  const [interestsText, setInterestsText] = useState("");
  const [goalsText, setGoalsText] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [education, setEducation] = useState("");
  const [location, setLocation] = useState("");

  const deleteEnabled = useMemo(
    () => confirmText.trim().toLowerCase() === "delete",
    [confirmText],
  );

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        const p = data.onboarding_profile;
        if (!mounted) return;
        setProfile(p);
        setSkillsText((p?.skills ?? []).join(", "));
        setInterestsText((p?.interests ?? []).join(", "));
        setGoalsText((p?.goals ?? []).join(", "));
        setExperienceLevel(p?.experience_level ?? "");
        setEducation(p?.education ?? "");
        setLocation(data.user?.location ?? "");
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    void run();
    return () => { mounted = false; };
  }, []);

  async function onSave() {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const body = {
        skills: parseList(skillsText),
        interests: parseList(interestsText),
        goals: parseList(goalsText),
        experience_level: experienceLevel || null,
        education: education || null,
        location: location || null,
      };
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error ?? "Failed to save profile");
      }
      const updated = await res.json();
      setProfile(updated.onboarding_profile);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteAccount() {
    if (!deleteEnabled) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error ?? "Failed to delete account");
      }
      router.push("/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete account");
    } finally {
      setSaving(false);
      setConfirmDeleteOpen(false);
      setConfirmText("");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="space-y-3 max-w-2xl">
          <Skeleton className="h-6 w-28 rounded-full bg-muted" />
          <Skeleton className="h-8 w-52 rounded-xl bg-muted" />
        </div>
        <Skeleton className="h-[450px] w-full rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <section className="space-y-1.5">
        <h2 className="font-display text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground font-medium">Update your skills and goals to improve AI recommendations.</p>
      </section>

      {error && (
        <div className="rounded-2xl bg-destructive/5 p-4 text-sm font-medium text-destructive text-center">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-card overflow-hidden">
        <div className="p-5 md:p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 className="font-display text-lg font-bold">Profile Configuration</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Adjust your parameters for better matchmaking.</p>
          </div>
          <Badge className="rounded-full bg-primary/10 text-primary border-0 text-[10px] font-semibold">
            SYNCED
          </Badge>
        </div>

        <div className="p-5 md:p-6 space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Skills (comma-separated)</label>
              <Textarea
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                className="min-h-[80px] rounded-xl bg-muted text-foreground p-4 border-transparent input-focus-glow resize-none text-sm font-medium"
                placeholder="React, TypeScript, Go, Machine Learning"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Experience Level</label>
              <Input
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="h-11 rounded-full bg-muted px-5 border-transparent input-focus-glow font-medium text-sm"
                placeholder="e.g. Senior, L5, Lead"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Education</label>
              <Input
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="h-11 rounded-full bg-muted px-5 border-transparent input-focus-glow font-medium text-sm"
                placeholder="e.g. MS Computer Science"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="location" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Location</Label>
              <LocationAutocomplete
                id="location"
                className="w-full h-11 bg-muted border-transparent rounded-full px-5 font-medium text-sm"
                defaultValue={location}
                onLocationSelect={(loc) => setLocation(loc)}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Seattle, WA"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Interests</label>
              <Textarea
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
                className="min-h-[80px] rounded-xl bg-muted text-foreground p-4 border-transparent input-focus-glow resize-none text-sm font-medium"
                placeholder="Distributed Systems, Real-time rendering"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Career Goals</label>
              <Textarea
                value={goalsText}
                onChange={(e) => setGoalsText(e.target.value)}
                className="min-h-[80px] rounded-xl bg-muted text-foreground p-4 border-transparent input-focus-glow resize-none text-sm font-medium"
                placeholder="Master system design, transition to management"
              />
            </div>
          </div>
          <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid var(--border)' }}>
            <Button variant="ghost" onClick={() => router.push("/onboarding")} className="text-muted-foreground hover:text-foreground rounded-full text-xs font-semibold">
              Redo Onboarding
            </Button>
            <Button onClick={() => void onSave()} disabled={saving || !profile} className="h-11 rounded-full px-8 btn-gradient font-semibold w-full md:w-auto">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl bg-destructive/5 overflow-hidden">
        <div className="p-5 md:p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-destructive">Delete Account</h3>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">Permanently remove your account and all data.</p>
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
            <Button variant="destructive" className="flex-1 rounded-full font-semibold" onClick={() => void onDeleteAccount()} disabled={!deleteEnabled || saving}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
