export type User = {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  created_at: string;
  deleted_at?: string | null;
};

export type OnboardingProfile = {
  id: string;
  user_id: string;
  skills: string[];
  interests: string[];
  experience_level?: string | null;
  education?: string | null;
  goals: string[];
  completed_at?: string | null;
};

export type SkillGap = {
  user_id: string;
  user_skills: string[];
  job_skills: string[];
  missing_skills: string[];
  similarity_score: number;
  source_job_ids: string[];
  computed_at: string;
};

export type JobListing = {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  description: string;
  url: string;
  source?: string | null;
  published_at?: string | null;
  skills?: string[] | null;
  matchScore?: number;
  matchingSkills?: string[];
  missingSkills?: string[];
  requiredSkills?: string[];
};

export type Course = {
  id: string;
  title: string;
  provider: string;
  url: string;
  description?: string | null;
  level?: string | null;
  duration_hours?: number | null;
  skills?: string[] | null;
};

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
  model_used: string;
  created_at?: string;
};

export type MockInterview = {
  id?: string;
  user_id?: string;
  role_selected: string;
  transcript: unknown; // JSONB in DB
  ai_feedback: unknown; // JSONB in DB
  score: number;
  duration: number;
};

export type Settings = {
  user_id: string;
  email_alerts: boolean;
  job_notifications: boolean;
  weekly_digest: boolean;
  theme_preference?: "light" | "dark" | "system" | null;
};

export type AnalyticsEvent = {
  id?: string;
  user_id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at?: string;
};

export type LLMContext = {
  current_skills: string[];
  missing_skills: string[];
  latest_jobs: JobListing[];
  goals: string[];
  experience_level: string;
};

export type JobsApiResponse = {
  jobs: JobListing[];
  total: number;
  page: number;
};

export type CoursesApiResponse = {
  courses: Course[];
  groupedBySkill: Record<string, Course[]>;
  message?: string;
};

export type SkillCoverageSummary = {
  current: number;
  missing: number;
  percentage: number;
};

export type InterviewScorePoint = {
  date: string;
  score: number;
  role: string;
};

export type MarketAnalyticsSnapshot = {
  marketData: {
    salaryHistory: Record<string, number>;
    regionalDemand: Array<{
      count: number;
      location: {
        display_name: string;
        area: string[];
      };
    }>;
    salaryDistribution: Record<string, number>;
    skillDemand: Array<{ skill: string; count: number }>;
  };
  activitySummary: {
    jobsViewed: number;
    coursesViewed: number;
    interviewsDone: number;
    avgInterviewScore: number;
  };
  context: {
    primaryRole: string;
    location: string;
    country: string;
  };
};


