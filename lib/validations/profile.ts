import { z } from "zod";

export const profileUpdateSchema = z.object({
  // Core user fields (all optional for partial update)
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  location: z.string().nullable().optional(),
  avatar: z.string().url().optional(),

  // Onboarding/profile fields (all optional)
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  experience_level: z.string().optional(),
  education: z.string().optional(),
  goals: z.array(z.string()).optional(),
});

export type ProfileUpdateRequest = z.infer<typeof profileUpdateSchema>;

