import type { JobListing } from "@/types";

export function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

export function extractSkillsFromText(text: string): string[] {
  const normalized = text.toLowerCase();

  const knownSkills = [
    // Tech & Engineering
    "react", "next.js", "typescript", "javascript", "node.js", "python",
    "django", "flask", "java", "spring", "kotlin", "go", "ruby", "rails",
    "sql", "postgres", "mysql", "mongodb", "aws", "gcp", "azure", "docker",
    "kubernetes", "redis", "graphql", "rest", "html", "css", "tailwind",
    "system design", "data engineering", "ml", "machine learning",
    // Business & Marketing
    "writing", "research", "communication", "marketing", "sales", "management",
    "leadership", "customer service", "design", "planning", "strategy", "analysis",
    "editing", "public speaking", "social media", "seo", "content creation",
    "negotiation", "accounting", "finance", "human resources", "recruiting",
    "project management", "event planning", "budgeting", "data analysis",
    "storytelling", "copywriting", "journalism", "politics", "history",
    // Product & UX
    "ui/ux", "product management", "figma", "wireframing", "prototyping",
    "user research", "agile", "scrum", "jira", "operations", "logistics"
  ];

  const found = new Set<string>();

  for (const skill of knownSkills) {
    if (normalized.includes(skill)) {
      found.add(skill);
    }
  }

  return Array.from(found);
}

export function extractSkillsFromJobs(jobs: JobListing[]): string[] {
  const collected = new Set<string>();

  for (const job of jobs) {
    const text = `${job.title} ${job.description}`;
    for (const skill of extractSkillsFromText(text)) {
      collected.add(skill);
    }
  }

  return Array.from(collected);
}

export function cosineSimilarity(setA: string[], setB: string[]): number {
  if (setA.length === 0 || setB.length === 0) {
    return 0;
  }

  const normA = new Set(setA.map(normalizeSkill));
  const normB = new Set(setB.map(normalizeSkill));

  let intersectionCount = 0;
  for (const skill of normA) {
    if (normB.has(skill)) {
      intersectionCount += 1;
    }
  }

  const denom = Math.sqrt(normA.size) * Math.sqrt(normB.size);
  if (denom === 0) {
    return 0;
  }

  return intersectionCount / denom;
}

