import { z } from "zod";

const startSchema = z.object({
  action: z.literal("start"),
  role: z.string().min(1, "role is required"),
});

const answerSchema = z.object({
  action: z.literal("answer"),
  sessionId: z.string().min(1, "sessionId is required"),
  answer: z.string().min(1, "answer is required"),
});

const endSchema = z.object({
  action: z.literal("end"),
  sessionId: z.string().min(1, "sessionId is required"),
});

export const interviewRequestSchema = z.discriminatedUnion("action", [
  startSchema,
  answerSchema,
  endSchema,
]);

export type InterviewRequest = z.infer<typeof interviewRequestSchema>;

