import { z } from "zod";
import type { OnboardingProfile, SkillGap } from "@/types";

export const onboardingRequestSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().optional(),
  education: z.string().optional(),
  skills: z.array(z.string()).default([]),
  experience_level: z.string().optional(),
  experience_history: z.string().optional(),
  interests: z.array(z.string()).default([]),
  goals: z.array(z.string()).default([]),
});

export type OnboardingRequest = z.infer<typeof onboardingRequestSchema>;

export const onboardingResponseSchema = z.object({
  onboarding_profile: z.custom<OnboardingProfile>(),
  skill_gap: z.custom<SkillGap>().nullable(),
});

export type OnboardingResponse = z.infer<typeof onboardingResponseSchema>;

