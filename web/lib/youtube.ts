import type { Course } from "@/types";
import { getServerEnv } from "@/lib/validations/env";

type YouTubeSearchItem = {
  id?: {
    videoId?: string;
  };
  snippet?: {
    title?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: {
      high?: {
        url?: string;
      };
    };
  };
};

type YouTubeSearchResponse = {
  items?: YouTubeSearchItem[];
};

export async function fetchYouTubeCoursesForSkill(skill: string): Promise<Course[]> {
  const env = getServerEnv();

  const searchParams = new URLSearchParams({
    key: env.YOUTUBE_DATA_API,
    part: "snippet",
    q: `${skill} full course`,
    type: "video",
    maxResults: "6",
    relevanceLanguage: "en",
    videoDuration: "medium",
  });

  const url = `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 60 * 60,
    },
  });

  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status}`);
  }

  const json = (await res.json()) as YouTubeSearchResponse;

  const items = json.items ?? [];

  const courses: Course[] = items
    .map((item) => {
      const videoId = item.id?.videoId;
      const snippet = item.snippet;
      if (!videoId || !snippet) {
        return null;
      }

      return {
        id: videoId,
        title: snippet.title ?? `Tutorial for ${skill}`,
        provider: "YouTube",
        url: `https://www.youtube.com/watch?v=${videoId}`,
        description: null,
        level: "Beginner",
        duration_hours: null,
        skills: [skill],
      } satisfies Course;
    })
    .filter(Boolean) as Course[];

  return courses;
}

