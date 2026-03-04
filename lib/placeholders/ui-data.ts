import type {
  ChatMessage,
  Course,
  JobListing,
  MockInterview,
  OnboardingProfile,
  Settings,
  User,
} from "@/types";

export type DashboardStats = {
  jobsMatched: number;
  coursesSuggested: number;
  interviewScore: number;
  skillGapPercent: number;
};

export type ActivityItem = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
};

export type JobCard = JobListing & {
  salary?: string | null;
  matchLabel?: string;
};

export type CourseCard = Course & {
  youtubeThumbnailUrl: string;
  channelName: string;
  durationLabel: string;
  skillTag: string;
  fillsSkillGap: boolean;
};

export type AnalyticsBundle = {
  heatmap: Array<{ date: string; value: number }>;
  skillsRadar: Array<{ skill: string; current: number; missing: number }>;
  interviewScores: Array<{ date: string; score: number }>;
  funnel: Array<{ stage: string; value: number }>;
  weeklySummary: {
    highlights: string[];
    focus: string;
  };
};

export type ChatModelOption = {
  id: string;
  label: string;
};

export const CHAT_MODEL_OPTIONS: ChatModelOption[] = [
  { id: "google/gemini-2.0-flash-exp", label: "Gemini 2.0 Flash (exp)" },
  {
    id: "meta-llama/llama-3.2-3b-instruct:free",
    label: "Llama 3.2 3B (free)",
  },
  {
    id: "nousresearch/hermes-3-llama-3.1-405b:free",
    label: "Hermes 3 405B (free)",
  },
];

export const MOCK_INTERVIEW_MODEL_ID =
  "mistralai/mistral-small-3.1-24b-instruct:free";

export async function placeholderGetCurrentUser(): Promise<User | null> {
  // Placeholder: wire to Supabase auth session.
  return {
    id: "user_demo",
    email: "demo@aspirely.ai",
    name: "Alex",
    avatar: null,
    bio: null,
    location: "Remote",
    created_at: new Date().toISOString(),
    deleted_at: null,
  };
}

export async function placeholderGetOnboardingProfile(): Promise<OnboardingProfile | null> {
  // Placeholder: fetch latest onboarding profile from DB.
  return {
    id: "onboarding_demo",
    user_id: "user_demo",
    skills: ["React", "TypeScript", "SQL"],
    interests: ["Frontend Engineering", "Data & AI"],
    experience_level: "mid",
    education: "BSc",
    goals: ["Prepare for interviews", "Grow into senior / lead"],
    completed_at: new Date().toISOString(),
  };
}

export async function placeholderGetDashboardStats(): Promise<DashboardStats> {
  // Placeholder: computed stats based on job matches, course recs, interviews.
  return {
    jobsMatched: 18,
    coursesSuggested: 7,
    interviewScore: 76,
    skillGapPercent: 24,
  };
}

export async function placeholderGetRecentActivity(): Promise<ActivityItem[]> {
  // Placeholder: recent actions/events feed.
  return [
    {
      id: "a1",
      title: "Skill gap updated",
      description: "New gaps identified from recent job analysis.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: "a2",
      title: "Course saved",
      description: "Added “TypeScript Patterns” to your plan.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    },
    {
      id: "a3",
      title: "Mock interview completed",
      description: "Role: Frontend Engineer · Score 76",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 54).toISOString(),
    },
  ];
}

export async function placeholderListJobs(params: {
  pageSize: number;
  cursor?: string | null;
  mode?: "default" | "by_skills" | "by_profile" | "by_location";
  locationQuery?: string;
}): Promise<{ items: JobCard[]; nextCursor: string | null }> {
  // Placeholder: fetch from DB/API and compute match badges.
  const items: JobCard[] = Array.from({ length: params.pageSize }).map((_, i) => ({
    id: `job_${params.cursor ?? "0"}_${i}`,
    title: ["Frontend Engineer", "Full Stack Developer", "Data Analyst"][i % 3],
    company: ["NovaLabs", "KiteWorks", "Sable Health"][i % 3],
    location: ["Remote", "Berlin, DE", "Austin, TX"][i % 3],
    salary: ["$120k–$160k", "$90k–$130k", "$110k–$150k"][i % 3],
    matchLabel: ["Strong match", "Good match", "Stretch"][i % 3],
    description: "Placeholder job description.",
    url: "#",
    source: "placeholder",
    published_at: new Date().toISOString(),
    skills: ["React", "TypeScript", "SQL"],
  }));
  return { items, nextCursor: null };
}

export async function placeholderListSkillTags(): Promise<string[]> {
  // Placeholder: list skill tags from DB.
  return ["React", "TypeScript", "SQL", "System Design", "Python"];
}

export async function placeholderListCourses(params: {
  skillTag?: string | null;
}): Promise<CourseCard[]> {
  // Placeholder: YouTube/API-backed course recommendations.
  const skillTag = params.skillTag ?? "TypeScript";
  return [
    {
      id: "c1",
      title: "Advanced TypeScript Patterns",
      provider: "YouTube",
      url: "#",
      description: "Placeholder course description.",
      level: "Intermediate",
      duration_hours: null,
      skills: [skillTag],
      youtubeThumbnailUrl:
        "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      channelName: "Aspirely Academy",
      durationLabel: "1h 12m",
      skillTag,
      fillsSkillGap: true,
    },
    {
      id: "c2",
      title: "SQL for Analytics",
      provider: "YouTube",
      url: "#",
      description: "Placeholder course description.",
      level: "Beginner",
      duration_hours: null,
      skills: ["SQL"],
      youtubeThumbnailUrl:
        "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      channelName: "Data Snacks",
      durationLabel: "55m",
      skillTag: "SQL",
      fillsSkillGap: true,
    },
  ];
}

export async function placeholderGetAnalytics(): Promise<AnalyticsBundle> {
  // Placeholder: computed analytics bundle.
  const today = new Date();
  const heatmap = Array.from({ length: 42 }).map((_, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (41 - idx));
    return { date: d.toISOString().slice(0, 10), value: (idx * 7) % 5 };
  });
  return {
    heatmap,
    skillsRadar: [
      { skill: "React", current: 85, missing: 15 },
      { skill: "TypeScript", current: 70, missing: 30 },
      { skill: "SQL", current: 55, missing: 45 },
      { skill: "System Design", current: 30, missing: 70 },
      { skill: "Interviewing", current: 60, missing: 40 },
    ],
    interviewScores: [
      { date: "2026-02-02", score: 62 },
      { date: "2026-02-16", score: 71 },
      { date: "2026-03-01", score: 76 },
    ],
    funnel: [
      { stage: "Viewed", value: 120 },
      { stage: "Saved", value: 42 },
      { stage: "Applied", value: 18 },
      { stage: "Interviewed", value: 6 },
      { stage: "Offers", value: 1 },
    ],
    weeklySummary: {
      highlights: ["+2 skill gaps closed", "3 jobs saved", "1 mock interview"],
      focus: "Spend 30 minutes on system design and apply to 5 roles.",
    },
  };
}

export async function placeholderLoadChatHistory(): Promise<ChatMessage[]> {
  // Placeholder: fetch last N messages from DB.
  return [
    {
      role: "assistant",
      content: "Tell me your target role and I’ll build a plan.",
      model_used: CHAT_MODEL_OPTIONS[0].id,
      created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
  ];
}

export async function placeholderSendChatMessage(params: {
  modelId: string;
  content: string;
}): Promise<ChatMessage> {
  // Placeholder: call streaming AI + persist.
  return {
    role: "assistant",
    content: `Placeholder response for: "${params.content}"`,
    model_used: params.modelId,
    created_at: new Date().toISOString(),
  };
}

export async function placeholderClearChat(): Promise<void> {
  // Placeholder: clear persisted chat history.
}

export async function placeholderStartMockInterview(params: {
  role: string;
  modelId: string;
}): Promise<{ sessionId: string; firstQuestion: string }> {
  // Placeholder: create session + generate first question.
  return {
    sessionId: "mi_demo",
    firstQuestion: `Tell me about yourself and why you’re a fit for ${params.role}.`,
  };
}

export async function placeholderSubmitMockAnswer(params: {
  sessionId: string;
  answer: string;
}): Promise<{ nextQuestion?: string; transcriptLine: string }> {
  // Placeholder: stream ASR + judge answer.
  return {
    nextQuestion: "Walk me through a challenging bug you debugged recently.",
    transcriptLine: params.answer,
  };
}

export async function placeholderEndMockInterview(_params: {
  sessionId: string;
}): Promise<{
  score: number;
  strengths: string[];
  improvements: string[];
  summary: string;
}> {
  // Placeholder: summarize full session.
  void _params.sessionId;
  return {
    score: 76,
    strengths: ["Clear structure", "Good examples", "Strong product thinking"],
    improvements: ["Be more concise", "Quantify impact", "Clarify trade-offs"],
    summary:
      "Solid performance overall. Focus on tightening answers and adding metrics.",
  };
}

export async function placeholderListPastMockInterviews(): Promise<MockInterview[]> {
  // Placeholder: fetch past interviews from DB.
  return [
    {
      id: "mi1",
      user_id: "user_demo",
      role_selected: "Frontend Engineer",
      transcript: [],
      ai_feedback: {},
      score: 76,
      duration: 840,
    },
  ];
}

export async function placeholderGetSettings(): Promise<Settings> {
  // Placeholder: fetch settings row from DB.
  return {
    user_id: "user_demo",
    email_alerts: true,
    job_notifications: true,
    weekly_digest: false,
    theme_preference: "system",
  };
}

export async function placeholderSaveSettings(_settings: Settings): Promise<void> {
  // Placeholder: persist settings.
  void _settings;
}

export async function placeholderUploadAvatar(_file: File): Promise<string> {
  // Placeholder: upload to Supabase Storage and return public URL.
  void _file;
  return "";
}

export async function placeholderUpdateProfile(_profile: OnboardingProfile): Promise<void> {
  // Placeholder: update onboarding profile fields.
  void _profile;
}

export async function placeholderDeleteAccount(): Promise<void> {
  // Placeholder: delete user row and revoke session.
}

export async function placeholderClearSession(): Promise<void> {
  // Placeholder: call Supabase signOut and clear cookies.
}

