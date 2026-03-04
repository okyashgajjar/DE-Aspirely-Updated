import { create } from "zustand";
import type { ChatMessage, MockInterview } from "@/types";
import { CHAT_MODEL_OPTIONS, MOCK_INTERVIEW_MODEL_ID } from "@/lib/constants";

type ChatState = {
  modelId: string;
  messages: ChatMessage[];
  typing: boolean;
  error: string | null;
  setModelId: (id: string) => void;
  setMessages: (
    messages: ChatMessage[] | ((previous: ChatMessage[]) => ChatMessage[]),
  ) => void;
  addMessage: (message: ChatMessage) => void;
  setTyping: (value: boolean) => void;
  setError: (message: string | null) => void;
  clearChat: () => void;
};

type InterviewFeedback = {
  score: number;
  strengths: string[];
  improvements: string[];
  summary: string;
} | null;

type InterviewState = {
  role: string;
  sessionId: string | null;
  currentQuestion: string | null;
  transcript: string[];
  feedback: InterviewFeedback;
  past: MockInterview[];
  error: string | null;
  submitting: boolean;
  setRole: (role: string) => void;
  startSession: (sessionId: string, firstQuestion: string) => void;
  addTranscriptLine: (line: string) => void;
  setCurrentQuestion: (question: string | null) => void;
  endSession: (feedback: NonNullable<InterviewFeedback>) => void;
  setPast: (items: MockInterview[]) => void;
  setSubmitting: (value: boolean) => void;
  resetSession: () => void;
};

type AIState = ChatState & InterviewState;

export const useAIStore = create<AIState>((set) => ({
  // Chat
  modelId: CHAT_MODEL_OPTIONS[0]?.id ?? "nvidia/nemotron-3-nano-30b-a3b:free",
  messages: [],
  typing: false,
  error: null,
  setModelId: (id) => set({ modelId: id }),
  setMessages: (messages) =>
    set((state) =>
      typeof messages === "function"
        ? { messages: messages(state.messages) }
        : { messages },
    ),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setTyping: (value) => set({ typing: value }),
  setError: (message) => set({ error: message }),
  clearChat: () => set({ messages: [], error: null, typing: false }),

  // Interview
  role: "Frontend Engineer",
  sessionId: null,
  currentQuestion: null,
  transcript: [],
  feedback: null,
  past: [],
  submitting: false,
  setRole: (role) => set({ role }),
  startSession: (sessionId, firstQuestion) =>
    set({
      sessionId,
      currentQuestion: firstQuestion,
      transcript: [],
      feedback: null,
      error: null,
    }),
  addTranscriptLine: (line) =>
    set((state) => ({
      transcript: [...state.transcript, line],
    })),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  endSession: (feedback) =>
    set({
      feedback,
      sessionId: null,
      currentQuestion: null,
    }),
  setPast: (items) => set({ past: items }),
  setSubmitting: (value) => set({ submitting: value }),
  resetSession: () =>
    set({
      sessionId: null,
      currentQuestion: null,
      transcript: [],
      feedback: null,
      submitting: false,
      error: null,
    }),
}));

