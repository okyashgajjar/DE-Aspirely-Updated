import { z } from "zod";

export const chatRequestSchema = z.object({
  message: z.string().min(1, "message is required"),
  model: z.string().min(1, "model is required"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

