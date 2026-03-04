import { z } from "zod";

export const settingsUpdateSchema = z.object({
  email_alerts: z.boolean().optional(),
  job_notifications: z.boolean().optional(),
  weekly_digest: z.boolean().optional(),
  theme_preference: z.enum(["dark", "light", "system"]).optional(),
});

export type SettingsUpdateRequest = z.infer<typeof settingsUpdateSchema>;

