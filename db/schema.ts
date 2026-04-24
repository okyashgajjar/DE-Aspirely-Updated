import { sqliteTable, text, integer, primaryKey, index, real } from "drizzle-orm/sqlite-core";
import type { AdapterAccount } from "@auth/core/adapters";

// --- NextAuth.js Tables ---

export const users = sqliteTable("users", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  // Aspirely specific fields
  avatar: text("avatar"),
  bio: text("bio"),
  location: text("location"),
  password: text("password"),
  created_at: integer("created_at", { mode: "timestamp_ms" }).notNull().default(new Date()),
  deleted_at: integer("deleted_at", { mode: "timestamp_ms" }),
});

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  })
);

export const sessions = sqliteTable("sessions", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// --- Aspirely Tables ---

export const onboardingProfiles = sqliteTable("onboarding_profiles", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  skills: text("skills", { mode: "json" }).$type<string[]>().notNull().default([]),
  interests: text("interests", { mode: "json" }).$type<string[]>().notNull().default([]),
  experience_level: text("experience_level"),
  education: text("education"),
  goals: text("goals", { mode: "json" }).$type<string[]>().notNull().default([]),
  completed_at: integer("completed_at", { mode: "timestamp_ms" }),
}, (table) => ({
  userIdIdx: index("onboarding_user_id_idx").on(table.userId),
}));

export const skillGaps = sqliteTable("skill_gaps", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  user_skills: text("user_skills", { mode: "json" }).$type<string[]>().notNull().default([]),
  job_skills: text("job_skills", { mode: "json" }).$type<string[]>().notNull().default([]),
  missing_skills: text("missing_skills", { mode: "json" }).$type<string[]>().notNull().default([]),
  similarity_score: real("similarity_score").notNull(),
  source_job_ids: text("source_job_ids", { mode: "json" }).$type<string[]>().notNull().default([]),
  computed_at: integer("computed_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => ({
  userIdIdx: index("skill_gap_user_id_idx").on(table.userId),
}));

export const chatHistory = sqliteTable("chat_history", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  model_used: text("model_used").notNull(),
  created_at: integer("created_at", { mode: "timestamp_ms" }).notNull().default(new Date()),
}, (table) => ({
  userIdIdx: index("chat_user_id_idx").on(table.userId),
}));

export const mockInterviews = sqliteTable("mock_interviews", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role_selected: text("role_selected").notNull(),
  transcript: text("transcript", { mode: "json" }).notNull(),
  ai_feedback: text("ai_feedback", { mode: "json" }).notNull(),
  score: integer("score").notNull(),
  duration: integer("duration").notNull(),
  created_at: integer("created_at", { mode: "timestamp_ms" }).notNull().default(new Date()),
}, (table) => ({
  userIdIdx: index("interview_user_id_idx").on(table.userId),
}));

export const settings = sqliteTable("settings", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  email_alerts: integer("email_alerts", { mode: "boolean" }).notNull().default(true),
  job_notifications: integer("job_notifications", { mode: "boolean" }).notNull().default(true),
  weekly_digest: integer("weekly_digest", { mode: "boolean" }).notNull().default(true),
  theme_preference: text("theme_preference"),
});

export const analyticsEvents = sqliteTable("analytics_events", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  event_type: text("event_type").notNull(),
  metadata: text("metadata", { mode: "json" }).notNull(),
  created_at: integer("created_at", { mode: "timestamp_ms" }).notNull().default(new Date()),
}, (table) => ({
  userIdIdx: index("analytics_user_id_idx").on(table.userId),
}));
