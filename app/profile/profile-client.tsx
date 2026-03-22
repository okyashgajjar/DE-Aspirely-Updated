"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
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
  const [avatarUploading, setAvatarUploading] = useState(false);
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
        if (!res.ok) {
          throw new Error("Failed to load profile");
        }
        const data = (await res.json()) as {
          user: {
            location?: string | null;
          } | null;
          onboarding_profile: OnboardingProfile | null;
        };
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
    return () => {
      mounted = false;
    };
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errJson = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errJson?.error ?? "Failed to save profile");
      }
      const updated = (await res.json()) as {
        onboarding_profile: OnboardingProfile | null;
      };
      setProfile(updated.onboarding_profile);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function onAvatarChange(file: File | null) {
    if (!file) return;
    setAvatarUploading(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const fileExt = file.name.split(".").pop() ?? "jpg";
      const filePath = `avatars/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatar: publicUrl }),
      });

      if (!res.ok) {
        throw new Error("Failed to save avatar URL");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function onDeleteAccount() {
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
      setConfirmDeleteOpen(false);
      setConfirmText("");
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="space-y-4 max-w-2xl">
           <Skeleton className="h-6 w-32 rounded-full bg-surface-container" />
           <Skeleton className="h-10 w-64 rounded-xl bg-surface-container" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-3xl bg-surface-container" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <section className="space-y-2">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary/80">
          User Matrix
        </p>
        <h2 className="font-display text-4xl font-bold tracking-tight">
          Profile Information.
        </h2>
        <p className="text-sm text-muted-foreground font-medium">
          Control your identity parameters to calibrate AI recommendations.
        </p>
      </section>

      {error ? (
        <div className="glass-panel rounded-3xl p-6 border border-destructive/20 bg-destructive/5 text-destructive font-medium text-sm text-center">
            {error}
        </div>
      ) : null}

      <div className="glass-panel rounded-3xl border border-border/50 shadow-inner bg-surface-container-low/30 backdrop-blur-2xl overflow-hidden">
         <div className="p-6 md:p-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border/50 bg-background/40">
           <div className="space-y-1 relative">
             <h3 className="font-display text-2xl font-bold tracking-tight">Avatar Configuration</h3>
             <p className="text-sm text-muted-foreground font-medium">
                Upload a primary visual identifier to Supabase Storage.
             </p>
           </div>
           <div className="flex items-center gap-4">
              <Badge variant="outline" className="rounded-full bg-secondary/10 text-secondary border-secondary/20 font-mono text-[10px] px-3 py-1">
                 SUPABASE LINK ACTIVE
              </Badge>
              <div className="relative">
                 <Input
                   type="file"
                   accept="image/*"
                   className="absolute inset-0 opacity-0 cursor-pointer w-[120px] h-10"
                   onChange={(e) => void onAvatarChange(e.target.files?.[0] ?? null)}
                   disabled={avatarUploading}
                 />
                 <Button variant="outline" disabled={avatarUploading} className="rounded-full bg-background border-border/50 hover:bg-surface-container w-[120px]">
                    {avatarUploading ? "Uplinking..." : "Select File"}
                 </Button>
              </div>
           </div>
         </div>

         <div className="p-6 md:p-8 space-y-8 bg-background/20 relative">
             <div className="absolute top-0 right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

             <div className="grid gap-8 md:grid-cols-2">
               <div className="space-y-3 md:col-span-2 relative">
                 <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Technical Arsenal (Comma-separated)</label>
                 <Textarea
                   value={skillsText}
                   onChange={(e) => setSkillsText(e.target.value)}
                   className="min-h-[100px] rounded-2xl border-border/50 bg-surface-container text-foreground p-4 focus-visible:ring-primary/50 shadow-inner resize-none font-medium text-sm"
                   placeholder="React, TypeScript, Go, Machine Learning"
                 />
               </div>

               <div className="space-y-3">
                 <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Experience Vector</label>
                 <Input
                   value={experienceLevel}
                   onChange={(e) => setExperienceLevel(e.target.value)}
                   className="h-12 rounded-full border-border/50 bg-surface-container px-5 focus-visible:ring-primary/50 shadow-inner font-medium"
                   placeholder="e.g. Senior, L5, Lead"
                 />
               </div>

               <div className="space-y-3">
                 <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Academic Credentials</label>
                 <Input
                   value={education}
                   onChange={(e) => setEducation(e.target.value)}
                   className="h-12 rounded-full border-border/50 bg-surface-container px-5 focus-visible:ring-primary/50 shadow-inner font-medium"
                   placeholder="e.g. MS Computer Science"
                 />
               </div>

               <div className="space-y-3 sm:col-span-2">
                 <Label htmlFor="location" className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Geographic Coordinates</Label>
                 <div className="relative flex items-center bg-surface-container rounded-full shadow-inner border border-border/50 focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 px-2">
                     <LocationAutocomplete
                       id="location"
                       className="w-full h-12 bg-transparent border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 px-3 font-medium shadow-none"
                       defaultValue={location}
                       onLocationSelect={(loc) => setLocation(loc)}
                       onChange={(e) => setLocation(e.target.value)}
                       placeholder="e.g. Seattle, WA"
                     />
                 </div>
               </div>

               <div className="space-y-3 md:col-span-2">
                 <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                   Domains of Interest
                 </label>
                 <Textarea
                   value={interestsText}
                   onChange={(e) => setInterestsText(e.target.value)}
                   className="min-h-[100px] rounded-2xl border-border/50 bg-surface-container text-foreground p-4 focus-visible:ring-primary/50 shadow-inner resize-none font-medium text-sm"
                   placeholder="Distributed Systems, Real-time rendering"
                 />
               </div>

               <div className="space-y-3 md:col-span-2">
                 <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Career Targets</label>
                 <Textarea
                   value={goalsText}
                   onChange={(e) => setGoalsText(e.target.value)}
                   className="min-h-[100px] rounded-2xl border-border/50 bg-surface-container text-foreground p-4 focus-visible:ring-primary/50 shadow-inner resize-none font-medium text-sm"
                   placeholder="Master system design, transition to management"
                 />
               </div>
             </div>

             <div className="pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
                <Button variant="ghost" onClick={() => router.push("/onboarding")} className="text-muted-foreground hover:text-foreground hover:bg-surface-container rounded-full text-xs font-bold uppercase tracking-widest">
                  Reset Matrix
                </Button>
                <Button 
                   onClick={() => void onSave()} 
                   disabled={saving || !profile}
                   className="h-12 rounded-full px-8 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
                >
                  {saving ? "Synchronizing..." : "Commit Data"}
                </Button>
             </div>
         </div>
      </div>

      <div className="glass-panel rounded-3xl border border-destructive/20 bg-destructive/5 overflow-hidden">
         <div className="p-6 md:p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
           <div className="space-y-1">
             <h3 className="font-display text-2xl font-bold tracking-tight text-destructive">Termination Protocol</h3>
             <p className="text-sm font-medium opacity-80 text-foreground">
               Permanently purge your identity matrix and all associated telemetry.
             </p>
           </div>
           <Button variant="destructive" onClick={() => setConfirmDeleteOpen(true)} className="rounded-full shadow-lg shadow-destructive/20 font-bold tracking-wide">
             Initiate Purge
           </Button>
         </div>
      </div>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="glass-panel border-border/50 bg-background/90 backdrop-blur-2xl rounded-3xl p-8 max-w-md shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-display text-2xl font-bold text-destructive">Confirm Termination</DialogTitle>
            <DialogDescription className="text-sm font-medium text-foreground/80 mt-2">
              Type <span className="font-mono font-bold text-destructive select-all">delete</span> to authorize total core purge. This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Awaiting authorization code..."
              className="h-12 rounded-full border-destructive/30 bg-destructive/5 text-destructive font-mono font-bold text-center tracking-widest focus-visible:ring-destructive/50 placeholder:text-destructive/30"
            />
          </div>
          <DialogFooter className="mt-2 outline-none border-none">
             <div className="flex items-center gap-3 w-full">
                <Button
                  variant="ghost"
                  className="flex-1 rounded-full text-foreground hover:bg-surface-container"
                  onClick={() => {
                    setConfirmDeleteOpen(false);
                    setConfirmText("");
                  }}
                >
                  Abort
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 rounded-full font-bold shadow-lg shadow-destructive/20"
                  onClick={() => void onDeleteAccount()}
                  disabled={!deleteEnabled || saving}
                >
                  Execute
                </Button>
             </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

