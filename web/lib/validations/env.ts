import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_PROJECT_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GOOGLE_AUTH_CLIENT_ID: z.string().min(1),
  GOOGLE_AUTH_CLIENT_SECRET: z.string().min(1),
  OPENROUTER_API_KEY: z.string().min(1),
  ADZUNA_API_KEY: z.string().min(1),
  ADZUNA_APP_ID: z.string().min(1),
  YOUTUBE_DATA_API: z.string().min(1),
  YOUTUBE_ANALYTICS_SERVICE_ACCOUNT_NAME: z.string().min(1),
  YOUTUBE_ANALYTICS_SERVICE_KEY: z.string().min(1),
  YOUTUBE_ANALYTICS_EMAIL: z.string().min(1),
  DATABASE_URL: z.string().url().optional(),
  DATABASE_DIRECT_URL: z.string().url().optional(),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;
type ClientEnv = z.infer<typeof clientEnvSchema>;

let serverEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (!serverEnv) {
    const parsed = serverEnvSchema.safeParse(process.env);
    if (!parsed.success) {
      // Throw a clear aggregated error on startup
      const formatted = parsed.error.issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");
      throw new Error(`Invalid server environment variables:\n${formatted}`);
    }
    serverEnv = parsed.data;
  }

  return serverEnv;
}

export function getClientEnv(): ClientEnv {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("\n");
    throw new Error(`Invalid client environment variables:\n${formatted}`);
  }

  return parsed.data;
}

