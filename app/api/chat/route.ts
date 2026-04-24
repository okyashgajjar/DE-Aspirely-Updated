import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { chatHistory, onboardingProfiles, skillGaps } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUserId } from "@/lib/session";
import { getServerEnv } from "@/lib/validations/env";
import { chatRequestSchema, type ChatRequest } from "@/lib/validations/chat";
import { fetchAdzunaJobs } from "@/lib/adzuna";
import type { ChatMessage, JobListing, LLMContext } from "@/types";

async function buildLLMContext(userId: string): Promise<LLMContext> {
  const [profile, gapRow] = await Promise.all([
    db.query.onboardingProfiles.findFirst({
      where: eq(onboardingProfiles.userId, userId),
      orderBy: [desc(onboardingProfiles.completed_at)],
    }),
    db.query.skillGaps.findFirst({
      where: eq(skillGaps.userId, userId),
      orderBy: [desc(skillGaps.computed_at)],
    }),
  ]);

  const current_skills = (profile?.skills as string[] ?? []);
  const missing_skills = (gapRow?.missing_skills as string[] ?? []);
  const goals = (profile?.goals as string[] ?? []);
  const experience_level = profile?.experience_level ?? "intermediate";
  const primaryGoal = [...current_skills, ...(profile?.interests as string[] ?? [])].slice(0, 2).join(" ") || "professional";

  let latest_jobs: JobListing[] = [];
  try {
    const { jobs } = await fetchAdzunaJobs({ what: primaryGoal, resultsPerPage: 10 });
    latest_jobs = jobs;
  } catch {
    latest_jobs = [];
  }

  return { current_skills, missing_skills, latest_jobs, goals, experience_level };
}

async function loadRecentMessages(userId: string): Promise<ChatMessage[]> {
  const rows = await db.query.chatHistory.findMany({
    where: eq(chatHistory.userId, userId),
    orderBy: [desc(chatHistory.created_at)],
    limit: 10,
  });
  return rows.reverse().map((r) => ({
    role: r.role as "user" | "assistant",
    content: r.content,
    model_used: r.model_used,
    created_at: r.created_at.toISOString(),
  }));
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  const messages = await loadRecentMessages(userId);
  return NextResponse.json({ messages });
}

export async function DELETE() {
  const userId = await getSessionUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  await db.delete(chatHistory).where(eq(chatHistory.userId, userId));
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

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
    buildLLMContext(userId),
    loadRecentMessages(userId),
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
    "1. FORMATTING: Use clean Markdown. Use bolding (**text**) sparingly for emphasis only. Use Bullet points for lists.",
    "2. TYPOS & QUALITY: Ensure perfect grammar and zero typos. Your tone should be authoritative, premium, and sleek.",
    "3. CONTENT: Be specific and personalized. Provide a strategic playbook for their next 30-90 days.",
    "4. PERSPECTIVE: Speak as a mentor. Encourage them while being brutally honest about market realities.",
    "5. PERSISTENCE: Remember past advice and build upon it.",
  ].join("\n");

  const messagesForLLM = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: input },
  ];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({ model, messages: messagesForLLM, stream: false }),
  });

  if (!response.ok) {
    console.error("OpenRouter API Error:", response.status, response.statusText);
    return new NextResponse("AI service error. Please try again later.", { status: 500 });
  }

  const json = (await response.json()) as { 
    choices?: { message?: { content?: string } }[] 
  };
  const content = json?.choices?.[0]?.message?.content ?? "Sorry, I could not generate a response right now.";

  const now = new Date();
  await db.insert(chatHistory).values([
    { id: crypto.randomUUID(), userId, role: "user", content: input, model_used: model, created_at: now },
    { id: crypto.randomUUID(), userId, role: "assistant", content, model_used: model, created_at: now },
  ]);

  const assistantMessage: ChatMessage = {
    role: "assistant",
    content,
    model_used: model,
    created_at: now.toISOString(),
  };

  return NextResponse.json({ message: assistantMessage });
}
