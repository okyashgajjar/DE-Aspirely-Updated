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
      <div className="space-y-4">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Profile
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          Your information
        </h2>
        <p className="text-sm text-muted-foreground">
          Update your onboarding fields to improve recommendations.
        </p>
      </section>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Profile error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Avatar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Supabase Storage</Badge>
            <p className="text-sm text-muted-foreground">
              Upload a profile photo to Supabase Storage.
            </p>
          </div>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => void onAvatarChange(e.target.files?.[0] ?? null)}
            disabled={avatarUploading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Onboarding fields</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Skills (comma-separated)</label>
            <Textarea
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="React, TypeScript, SQL"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Experience</label>
            <Input
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              placeholder="e.g. junior, mid, senior"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Education</label>
            <Input
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. BSc Computer Science"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="location">Location</Label>
            <LocationAutocomplete
              id="location"
              className="w-full"
              defaultValue={location}
              onLocationSelect={(loc) => setLocation(loc)}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">
              Interests (comma-separated)
            </label>
            <Textarea
              value={interestsText}
              onChange={(e) => setInterestsText(e.target.value)}
              placeholder="Frontend Engineering, Data & AI"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Goals (comma-separated)</label>
            <Textarea
              value={goalsText}
              onChange={(e) => setGoalsText(e.target.value)}
              placeholder="Prepare for interviews, Grow into senior"
            />
          </div>

          <div className="mt-2 flex items-center justify-end gap-2 md:col-span-2">
            <Button variant="outline" onClick={() => router.push("/onboarding")}>
              Re-run onboarding
            </Button>
            <Button onClick={() => void onSave()} disabled={saving || !profile}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
          <Button variant="outline" onClick={() => setConfirmDeleteOpen(true)}>
            Delete account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogHeader>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            Type <span className="font-medium">delete</span> to confirm. This is
            irreversible.
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-3">
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="delete"
          />
        </DialogContent>
        <DialogFooter
          onClose={() => {
            setConfirmDeleteOpen(false);
            setConfirmText("");
          }}
        >
          <Button
            variant="destructive"
            onClick={() => void onDeleteAccount()}
            disabled={!deleteEnabled || saving}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

