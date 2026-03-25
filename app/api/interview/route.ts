import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { mockInterviews } from "@/db/schema";
import { getSessionUserId } from "@/lib/session";
import { eq, desc } from "drizzle-orm";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function getAIResponse(messages: ChatMessage[]) {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://aspirely.ai",
        "X-Title": "Aspirely",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001", // Using a stable flash model
        messages,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[OpenRouter Error] Status: ${res.status}`, errorText);
      throw new Error(`AI API Error: ${res.status}`);
    }

    const data = await res.json();
    if (!data.choices || !data.choices[0]) {
      console.error("[OpenRouter Error] No choices in response:", data);
      throw new Error("AI API returned empty response");
    }
    return data.choices[0].message.content;
  } catch (err) {
    console.error("[getAIResponse] Failed:", err);
    return "I'm having trouble connecting to my neural interface. Let's proceed with a general question: Can you tell me about your most challenging project?";
  }
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const interviews = await db.query.mockInterviews.findMany({
    where: eq(mockInterviews.userId, userId),
    orderBy: [desc(mockInterviews.created_at)],
  });

  return NextResponse.json({ interviews });
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { action, role, sessionId, answer } = body;

  if (action === "start") {
    const firstQuestion = await getAIResponse([
      { role: "system", content: "You are an expert interviewer for " + (role || "Software Engineering") + " roles. Ask one brief, high-impact behavioral or technical question to start the interview." }
    ]);

    const id = crypto.randomUUID();
    await db.insert(mockInterviews).values({
      id,
      userId,
      role_selected: role || "General",
      transcript: [{ role: "assistant", content: firstQuestion }],
      ai_feedback: {},
      score: 0,
      duration: 0,
      created_at: new Date(),
    });

    return NextResponse.json({ sessionId: id, firstQuestion }, { status: 201 });
  }

  if (action === "answer") {
    if (!sessionId || !answer) return new NextResponse("Missing data", { status: 400 });

    const interview = await db.query.mockInterviews.findFirst({
      where: eq(mockInterviews.id, sessionId),
    });

    if (!interview) return new NextResponse("Session not found", { status: 404 });

    const currentTranscript = (interview.transcript as ChatMessage[]) || [];
    const nextTranscript = [...currentTranscript, { role: "user", content: answer }];

    const nextQuestion = await getAIResponse([
      { role: "system", content: "Continue the interview. Based on the previous transcript, ask the next logically following question. Keep it brief." },
      ...nextTranscript.map(m => ({ role: m.role as "user" | "assistant" | "system", content: m.content }))
    ]);

    await db.update(mockInterviews)
      .set({ transcript: [...nextTranscript, { role: "assistant", content: nextQuestion }] })
      .where(eq(mockInterviews.id, sessionId));

    return NextResponse.json({ 
      nextQuestion, 
      transcriptLine: `You: ${answer}` 
    });
  }

  if (action === "end") {
    if (!sessionId) return new NextResponse("Missing sessionId", { status: 400 });

    const interview = await db.query.mockInterviews.findFirst({
      where: eq(mockInterviews.id, sessionId),
    });

    if (!interview) return new NextResponse("Session not found", { status: 404 });

    const transcript = (interview.transcript as ChatMessage[]) || [];
    const feedbackRaw = await getAIResponse([
      { role: "system", content: "The interview is over. Evaluate the following transcript. Provide a JSON response with: score (0-100), strengths (array of strings), improvements (array of strings), and a brief summary string. ONLY JSON." },
      ...transcript
    ]);

    interface Feedback {
      score: number;
      strengths: string[];
      improvements: string[];
      summary: string;
    }
    let feedback: Feedback;
    try {
      feedback = JSON.parse(feedbackRaw.replace(/```json|```/g, ""));
    } catch {
      feedback = { score: 70, strengths: ["Good attempt"], improvements: ["Be more specific"], summary: "Evaluation completed." };
    }

    await db.update(mockInterviews)
      .set({ 
        ai_feedback: feedback, 
        score: feedback.score || 0 
      })
      .where(eq(mockInterviews.id, sessionId));

    const allPast = await db.query.mockInterviews.findMany({
      where: eq(mockInterviews.userId, userId),
      orderBy: [desc(mockInterviews.created_at)],
    });

    return NextResponse.json({ feedback, past: allPast });
  }

  return new NextResponse("Action not found", { status: 404 });
}
