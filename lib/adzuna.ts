import type { JobListing } from "@/types";
import { getServerEnv } from "@/lib/validations/env";

type AdzunaJob = {
  id: string;
  title: string;
  description: string;
  redirect_url: string;
  created?: string;
  company?: { display_name?: string | null } | null;
  location?: { display_name?: string | null } | null;
};

type AdzunaResponse = {
  results: AdzunaJob[];
  count?: number;
};

export type AdzunaSearchParams = {
  what: string;
  where?: string;
  country?: string;
  resultsPerPage?: number;
  page?: number;
};

export async function fetchAdzunaJobs(
  params: AdzunaSearchParams,
): Promise<{ jobs: JobListing[]; total: number }> {
  const env = getServerEnv();

  const resultsPerPage = params.resultsPerPage ?? 10;
  const page = params.page ?? 1;

  const search = new URLSearchParams({
    app_id: env.ADZUNA_APP_ID,
    app_key: env.ADZUNA_API_KEY,
    results_per_page: String(resultsPerPage),
    what: params.what,
    "content-type": "application/json",
  });

  if (params.where) {
    search.set("where", params.where);
  }

  const country = params.country || "gb";
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${search.toString()}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 60 * 30,
    },
  });

  if (!res.ok) {
    throw new Error(`Adzuna API error: ${res.status}`);
  }

  const data = (await res.json()) as AdzunaResponse;

  const jobs: JobListing[] = (data.results ?? []).map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company?.display_name ?? "Unknown",
    location: job.location?.display_name ?? null,
    description: job.description,
    url: job.redirect_url,
    source: "adzuna",
    published_at: job.created ?? null,
    skills: null,
  }));

  return {
    jobs,
    total: data.count ?? jobs.length,
  };
}

export type AdzunaHistoryResponse = {
  month: Record<string, number>;
};

export async function fetchAdzunaHistory(params: {
  what: string;
  country?: string;
  category?: string;
  location?: string;
}): Promise<AdzunaHistoryResponse> {
  const env = getServerEnv();
  const country = params.country || "gb";

  const search = new URLSearchParams({
    app_id: env.ADZUNA_APP_ID,
    app_key: env.ADZUNA_API_KEY,
    what: params.what,
    "content-type": "application/json",
  });

  if (params.category) search.set("category", params.category);
  if (params.location) search.set("location", params.location);

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/history?${search.toString()}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return { month: {} };
  return res.json();
}

export type AdzunaGeodataResponse = {
  locations: Array<{
    count: number;
    location: {
      display_name: string;
      area: string[];
    };
  }>;
};

export async function fetchAdzunaGeodata(params: {
  what: string;
  country?: string;
}): Promise<AdzunaGeodataResponse> {
  const env = getServerEnv();
  const country = params.country || "gb";

  const search = new URLSearchParams({
    app_id: env.ADZUNA_APP_ID,
    app_key: env.ADZUNA_API_KEY,
    what: params.what,
    "content-type": "application/json",
  });

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/geodata?${search.toString()}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return { locations: [] };
  return res.json();
}

export type AdzunaHistogramResponse = {
  histogram: Record<string, number>;
};

export async function fetchAdzunaHistogram(params: {
  what: string;
  country?: string;
  location?: string;
}): Promise<AdzunaHistogramResponse> {
  const env = getServerEnv();
  const country = params.country || "gb";

  const search = new URLSearchParams({
    app_id: env.ADZUNA_APP_ID,
    app_key: env.ADZUNA_API_KEY,
    what: params.what,
    "content-type": "application/json",
  });

  if (params.location) search.set("location", params.location);

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/histogram?${search.toString()}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return { histogram: {} };
  return res.json();
}

export async function fetchAdzunaCount(params: {
  what: string;
  country?: string;
}): Promise<number> {
  const env = getServerEnv();
  const country = params.country || "gb";

  const search = new URLSearchParams({
    app_id: env.ADZUNA_APP_ID,
    app_key: env.ADZUNA_API_KEY,
    what: params.what,
    results_per_page: "1",
    "content-type": "application/json",
  });

  try {
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${search.toString()}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch (e) {
    return 0;
  }
}

