import { z } from "zod";

const serverEnvSchema = z.object({
  GOOGLE_AUTH_CLIENT_ID: z.string().min(1),
  GOOGLE_AUTH_CLIENT_SECRET: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  OPENROUTER_API_KEY: z.string().min(1),
  ADZUNA_API_KEY: z.string().min(1),
  ADZUNA_APP_ID: z.string().min(1),
  YOUTUBE_DATA_API: z.string().min(1),
  YOUTUBE_ANALYTICS_SERVICE_ACCOUNT_NAME: z.string().min(1),
  YOUTUBE_ANALYTICS_SERVICE_KEY: z.string().min(1),
  YOUTUBE_ANALYTICS_EMAIL: z.string().min(1),
  DATABASE_URL: z.string().min(1).optional(),
  DATABASE_DIRECT_URL: z.string().min(1).optional(),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

let serverEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (!serverEnv) {
    const parsed = serverEnvSchema.safeParse(process.env);
    if (!parsed.success) {
      const formatted = parsed.error.issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");
      throw new Error(`Invalid server environment variables:\n${formatted}`);
    }
    serverEnv = parsed.data;
  }

  return serverEnv;
}
