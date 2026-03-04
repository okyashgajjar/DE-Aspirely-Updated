import { NextResponse, type NextRequest } from "next/server";
import type { Settings } from "@/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  settingsUpdateSchema,
  type SettingsUpdateRequest,
} from "@/lib/validations/settings";

async function getAuthUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, userId: null as string | null };
  }

  return { supabase, userId: user.id as string };
}

export async function GET() {
  try {
    const { supabase, userId } = await getAuthUser();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data, error } = await supabase
      .from("settings")
      .select("user_id, email_alerts, job_notifications, weekly_digest, theme_preference")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed to load settings", error);
      return NextResponse.json(
        { error: "Failed to load settings" },
        { status: 500 },
      );
    }

    const settings: Settings = data
      ? {
        user_id: data.user_id,
        email_alerts: Boolean(data.email_alerts),
        job_notifications: Boolean(data.job_notifications),
        weekly_digest: Boolean(data.weekly_digest),
        theme_preference:
          (data.theme_preference as Settings["theme_preference"]) ??
          "system",
      }
      : {
        user_id: userId,
        email_alerts: true,
        job_notifications: true,
        weekly_digest: false,
        theme_preference: "system",
      };

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/settings error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { supabase, userId } = await getAuthUser();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return new NextResponse("Invalid JSON body", { status: 400 });
    }

    const parsed = settingsUpdateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const body: SettingsUpdateRequest = parsed.data;

    const { data: existing, error: existingError } = await supabase
      .from("settings")
      .select(
        "user_id, email_alerts, job_notifications, weekly_digest, theme_preference",
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (existingError) {
      console.error("Failed to load existing settings", existingError);
      return NextResponse.json(
        { error: "Failed to load settings" },
        { status: 500 },
      );
    }

    const next: Settings = {
      user_id: userId,
      email_alerts:
        body.email_alerts ?? Boolean(existing?.email_alerts ?? true),
      job_notifications:
        body.job_notifications ??
        Boolean(existing?.job_notifications ?? true),
      weekly_digest:
        body.weekly_digest ?? Boolean(existing?.weekly_digest ?? false),
      theme_preference:
        body.theme_preference ??
        ((existing?.theme_preference as Settings["theme_preference"]) ??
          "system"),
    };

    let upsertError;
    if (existing) {
      const { error } = await supabase
        .from("settings")
        .update({
          email_alerts: next.email_alerts,
          job_notifications: next.job_notifications,
          weekly_digest: next.weekly_digest,
          theme_preference: next.theme_preference,
        })
        .eq("user_id", next.user_id);
      upsertError = error;
    } else {
      const { error } = await supabase
        .from("settings")
        .insert({
          user_id: next.user_id,
          email_alerts: next.email_alerts,
          job_notifications: next.job_notifications,
          weekly_digest: next.weekly_digest,
          theme_preference: next.theme_preference,
        });
      upsertError = error;
    }

    if (upsertError) {
      console.error("Failed to save settings", upsertError);
      return NextResponse.json(
        { error: "Failed to save settings" },
        { status: 500 },
      );
    }

    return NextResponse.json(next);
  } catch (error) {
    console.error("PATCH /api/settings error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

