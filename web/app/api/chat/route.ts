import { NextResponse, type NextRequest } from "next/server";
import type { ChatMessage, JobListing, LLMContext } from "@/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getServerEnv } from "@/lib/validations/env";
import { chatRequestSchema, type ChatRequest } from "@/lib/validations/chat";
import { fetchAdzunaJobs } from "@/lib/adzuna";

async function getAuthUserId() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return { supabase, userId: user.id };
}

async function buildLLMContext(supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>, userId: string): Promise<LLMContext> {
  const [{ data: profile }, { data: gapRow }] = await Promise.all([
    supabase
      .from("onboarding_profiles")
      .select("skills, goals, experience_level")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("skill_gaps")
      .select("missing_skills")
      .eq("user_id", userId)
      .order("computed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const current_skills = (profile?.skills ?? []) as string[];
  const missing_skills = (gapRow?.missing_skills ?? []) as string[];
  const goals = (profile?.goals ?? []) as string[];
  const experience_level = profile?.experience_level ?? "intermediate";

  const primaryGoal = goals[0] ?? "software engineer";

  let latest_jobs: JobListing[] = [];

  try {
    const { jobs } = await fetchAdzunaJobs({
      what: primaryGoal,
      resultsPerPage: 10,
    });
    latest_jobs = jobs;
  } catch {
    latest_jobs = [];
  }

  return {
    current_skills,
    missing_skills,
    latest_jobs,
    goals,
    experience_level
  };
}

async function loadRecentMessages(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  userId: string,
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_history")
    .select("role, content, model_used, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !data) {
    return [];
  }

  return data.reverse() as ChatMessage[];
}

export async function GET() {
  const auth = await getAuthUserId();
  if (!auth) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { supabase, userId } = auth;
  const messages = await loadRecentMessages(supabase, userId);
  return NextResponse.json({ messages });
}

export async function DELETE() {
  const auth = await getAuthUserId();
  if (!auth) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { supabase, userId } = auth;
  await supabase.from("chat_history").delete().eq("user_id", userId);
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUserId();
  if (!auth) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { supabase, userId } = auth;

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const body: ChatRequest = parsed.data;
  const input = body.message.trim();
  const model = body.model.trim();

  const env = getServerEnv();

  const [context, history] = await Promise.all([
    buildLLMContext(supabase, userId),
    loadRecentMessages(supabase, userId),
  ]);

  const { current_skills, missing_skills, latest_jobs, goals, experience_level } = context;

  const systemPrompt = [
    "You are ASPIRELY, a professional and elite personal AI career advisor. Your mission is to provide high-end, actionable career strategy.",
    "USER PROFILE CONTEXT:",
    `- Current Skills: ${current_skills.join(", ") || "None listed"}`,
    `- Missing Skills: ${missing_skills.join(", ") || "None identified"}`,
    `- Career Goals: ${goals.join(", ") || "General career growth"}`,
    `- Experience Level: ${experience_level}`,
    `- Recent Relevant Jobs (Sample): ${JSON.stringify(latest_jobs.slice(0, 3))}`,
    "",
    "RESPONSE GUIDELINES:",
    "1. FORMATTING: Use clean Markdown. Use bolding (**text**) sparingly for emphasis only. Use Bullet points for lists. Use tables for comparisons. Avoid 'esterics' or messy symbols.",
    "2. TYPOS & QUALITY: Ensure perfect grammar and zero typos. Your tone should be 'OG'—authoritative, premium, and sleek.",
    "3. CONTENT: Be specific and personalized. Don't just list facts; provide a strategic 'playbook' for their next 30-90 days.",
    "4. PERSPECTIVE: Speak as a mentor. Encourage them while being brutally honest about market realities.",
  ].join("\n");

  const messagesForLLM = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: input },
  ];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: messagesForLLM,
      stream: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("OpenRouter API Error:", {
      status: response.status,
      statusText: response.statusText,
      body: text
    });
    return new NextResponse("AI service error. Please try again later.", { status: 500 });
  }

  const json = (await response.json()) as any;
  const content: string =
    json?.choices?.[0]?.message?.content ??
    "Sorry, I could not generate a response right now.";

  const createdAt = new Date().toISOString();

  const userRow = {
    user_id: userId,
    role: "user",
    content: input,
    model_used: model,
    created_at: createdAt,
  };

  const assistantRow = {
    user_id: userId,
    role: "assistant",
    content,
    model_used: model,
    created_at: createdAt,
  };

  await supabase.from("chat_history").insert([userRow, assistantRow]);

  const assistantMessage: ChatMessage = {
    role: "assistant",
    content,
    model_used: model,
    created_at: createdAt,
  };

  return NextResponse.json({ message: assistantMessage });
}

