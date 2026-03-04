import { NextResponse, type NextRequest } from "next/server";
import type { JobListing, LLMContext } from "@/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getServerEnv } from "@/lib/validations/env";
import { interviewRequestSchema, type InterviewRequest } from "@/lib/validations/interview";
import { fetchAdzunaJobs } from "@/lib/adzuna";
import { MOCK_INTERVIEW_MODEL_ID } from "@/lib/constants";

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

  const parsed = interviewRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const body: InterviewRequest = parsed.data;

  const env = getServerEnv();
  const context = await buildLLMContext(supabase, userId);
  const { current_skills, missing_skills, latest_jobs, goals, experience_level } = context;

  if (body.action === "start") {
    const role = body.role.trim();
    if (!role) {
      return new NextResponse("Missing role", { status: 400 });
    }

    const systemPrompt = [
      `You are a professional interviewer for the role of ${role}.`,
      "Candidate profile context:",
      `- Skills: ${current_skills.join(", ")}`,
      `- Missing Skills: ${missing_skills.join(", ")}`,
      `- Goals: ${goals.join(", ")}`,
      `- Experience Level: ${experience_level}`,
      `- Sample Relevant Jobs: ${JSON.stringify(latest_jobs.slice(0, 3))}`,
      "",
      "Ask one realistic interview question at a time. Tailor questions to their experience level and target role. Be professional and rigorous.",
    ].join("\n");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: MOCK_INTERVIEW_MODEL_ID,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: "Start the interview and ask the first question only.",
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenRouter Interview Start Error:", text);
      return new NextResponse("Failed to start AI interview. Please try again.", { status: 500 });
    }

    const json = (await response.json()) as any;
    const firstQuestion: string =
      json?.choices?.[0]?.message?.content ??
      `Tell me about yourself and why you’re a fit for ${role}.`;

    const { data, error } = await supabase
      .from("mock_interviews")
      .insert({
        user_id: userId,
        role_selected: role,
        transcript: [],
        ai_feedback: {},
        score: 0,
        duration: 0,
      })
      .select("id")
      .single();

    if (error || !data) {
      return new NextResponse("Failed to create session", { status: 500 });
    }

    return NextResponse.json({
      sessionId: data.id as string,
      firstQuestion,
    });
  }

  if (body.action === "answer") {
    const sessionId = body.sessionId.trim();
    const answer = body.answer.trim();
    if (!sessionId || !answer) {
      return new NextResponse("Missing sessionId or answer", { status: 400 });
    }

    const { data: session, error } = await supabase
      .from("mock_interviews")
      .select("transcript, role_selected")
      .eq("user_id", userId)
      .eq("id", sessionId)
      .maybeSingle();

    if (error || !session) {
      return new NextResponse("Session not found", { status: 404 });
    }

    const transcript = (session.transcript as any[]) ?? [];
    transcript.push({ from: "candidate", text: answer });

    const systemPrompt = [
      `You are a professional interviewer for the role of ${session.role_selected}.`,
      "Candidate profile context:",
      `- Skills: ${current_skills.join(", ")}`,
      `- Missing Skills: ${missing_skills.join(", ")}`,
      `- Goals: ${goals.join(", ")}`,
      `- Experience Level: ${experience_level}`,
      `- Sample Relevant Jobs: ${JSON.stringify(latest_jobs.slice(0, 3))}`,
      "",
      "Ask one realistic interview question at a time. Tailor questions to their experience level and target role. Be professional and rigorous.",
    ].join("\n");

    const transcriptText = transcript
      .map((t) => `${t.from === "candidate" ? "Candidate" : "Interviewer"}: ${t.text}`)
      .join("\n");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: MOCK_INTERVIEW_MODEL_ID,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content:
              "Continue the interview. Based on the transcript below, ask the next realistic interview question only.\n\n" +
              transcriptText,
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenRouter Interview Answer Error:", text);
      return new NextResponse("AI service error during interview.", { status: 500 });
    }

    const json = (await response.json()) as any;
    const nextQuestion: string =
      json?.choices?.[0]?.message?.content ??
      "Walk me through a challenging bug you debugged recently.";

    transcript.push({ from: "interviewer", text: nextQuestion });

    await supabase
      .from("mock_interviews")
      .update({ transcript })
      .eq("user_id", userId)
      .eq("id", sessionId);

    return NextResponse.json({
      nextQuestion,
      transcriptLine: answer,
    });
  }

  if (body.action === "end") {
    const sessionId = body.sessionId.trim();
    if (!sessionId) {
      return new NextResponse("Missing sessionId", { status: 400 });
    }

    const { data: session, error } = await supabase
      .from("mock_interviews")
      .select("transcript, role_selected, created_at")
      .eq("user_id", userId)
      .eq("id", sessionId)
      .maybeSingle();

    if (error || !session) {
      return new NextResponse("Session not found", { status: 404 });
    }

    const transcript = (session.transcript as any[]) ?? [];

    const systemPrompt = [
      `You are a professional interviewer for the role of ${session.role_selected}.`,
      "Candidate profile context:",
      `- Skills: ${current_skills.join(", ")}`,
      `- Missing Skills: ${missing_skills.join(", ")}`,
      `- Goals: ${goals.join(", ")}`,
      `- Experience Level: ${experience_level}`,
      `- Sample Relevant Jobs: ${JSON.stringify(latest_jobs.slice(0, 3))}`,
      "",
      "After receiving all answers generate ONLY valid JSON:",
      "{",
      '  "score": number (0-100),',
      '  "strengths": string[],',
      '  "improvements": string[],',
      '  "summary": string',
      "}",
    ].join("\n");

    const transcriptText = transcript
      .map((t) => `${t.from === "candidate" ? "Candidate" : "Interviewer"}: ${t.text}`)
      .join("\n");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: MOCK_INTERVIEW_MODEL_ID,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content:
              "The interview is complete. Using the transcript below, respond ONLY with the JSON object described.\n\n" +
              transcriptText,
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenRouter Interview Feedback Error:", text);
      return new NextResponse("Failed to generate AI feedback.", { status: 500 });
    }

    const json = (await response.json()) as any;
    const raw = json?.choices?.[0]?.message?.content ?? "";

    let parsed: {
      score: number;
      strengths: string[];
      improvements: string[];
      summary: string;
    };

    try {
      parsed = JSON.parse(raw);
    } catch {
      return new NextResponse("Failed to parse interviewer JSON", { status: 500 });
    }

    const startedAt = session.created_at ? new Date(session.created_at as string) : new Date();
    const durationSeconds = Math.max(
      0,
      Math.floor((Date.now() - startedAt.getTime()) / 1000),
    );

    await supabase
      .from("mock_interviews")
      .update({
        ai_feedback: parsed,
        score: parsed.score,
        duration: durationSeconds,
      })
      .eq("user_id", userId)
      .eq("id", sessionId);

    const { data: pastRows } = await supabase
      .from("mock_interviews")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      feedback: parsed,
      past: pastRows ?? [],
    });
  }

  return new NextResponse("Unsupported action", { status: 400 });
}

