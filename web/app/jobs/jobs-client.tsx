"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import type { JobListing } from "@/types";

type MatchedResponse = {
  jobs: JobListing[];
  userSkills: string[];
  userLocation: string;
};

type SearchResponse = {
  jobs: JobListing[];
  total: number;
  page: number;
  hasMore: boolean;
};

function JobCard({ job }: { job: JobListing }) {
  const salary =
    job.salary_min && job.salary_max
      ? `£${job.salary_min.toLocaleString()} - £${job.salary_max.toLocaleString()}`
      : job.salary_min
        ? `From £${job.salary_min.toLocaleString()}`
        : null;

  const score = job.matchScore ?? 0;
  let scoreColor = "bg-slate-100 text-slate-700 border-slate-200";
  let scoreText = "Partial Match";

  if (score >= 80) {
    scoreColor = "bg-green-100 text-green-800 border-green-200";
    scoreText = "Strong Match";
  } else if (score >= 50) {
    scoreColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
    scoreText = "Good Match";
  }

  const handleApply = async () => {
    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "job_clicked",
          metadata: { job_id: job.id, job_title: job.title },
        }),
      });
    } catch {
      // ignore
    }
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="line-clamp-2 text-lg leading-tight">
              {job.title}
            </CardTitle>
            <div className="mt-1 text-sm font-medium text-slate-600">
              {job.company}
            </div>
          </div>
          <Badge variant="outline" className={cn("shrink-0", scoreColor)}>
            {scoreText} ({score}%)
          </Badge>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
          {job.location && (
            <span className="flex items-center gap-1">📍 {job.location}</span>
          )}
          {salary && (
            <span className="flex items-center gap-1">💰 {salary}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <p className="line-clamp-3 text-sm text-slate-600 flex-1 mb-4">
          {job.description}
        </p>

        {(job.matchingSkills?.length || job.missingSkills?.length) ? (
          <div className="space-y-3 mb-4">
            {job.matchingSkills && job.matchingSkills.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">You have:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {job.matchingSkills.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200 text-[10px] px-1.5 font-medium">
                      {skill}
                    </Badge>
                  ))}
                  {job.matchingSkills.length > 4 && (
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] px-1.5 font-medium">
                      +{job.matchingSkills.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {job.missingSkills && job.missingSkills.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">You need:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {job.missingSkills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="outline" className="border-orange-200 text-orange-700 bg-orange-50/50 text-[10px] px-1.5 font-medium">
                      {skill}
                    </Badge>
                  ))}
                  {job.missingSkills.length > 3 && (
                    <Badge variant="outline" className="border-slate-200 text-slate-600 bg-slate-50/50 text-[10px] px-1.5 font-medium">
                      +{job.missingSkills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-auto pt-4 border-t flex justify-end">
          <Button asChild variant="default" className="w-full sm:w-auto" onClick={handleApply}>
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              View Job &rarr;
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function JobSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-2 mb-4">
          <Skeleton className="h-3 w-16" />
          <div className="flex gap-1"><Skeleton className="h-5 w-12" /><Skeleton className="h-5 w-16" /></div>
        </div>
        <div className="mt-auto pt-4 border-t flex justify-end">
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function JobsClient() {
  // Section 1 State
  const [matchedJobs, setMatchedJobs] = useState<JobListing[]>([]);
  const [matchedLoading, setMatchedLoading] = useState(true);
  const [matchedError, setMatchedError] = useState(false);
  const [userContext, setUserContext] = useState<{ skills: string[]; location: string }>({ skills: [], location: "" });

  // Section 2 State
  const [searchSkills, setSearchSkills] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [searchError, setSearchError] = useState("");

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<JobListing[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [searchTotal, setSearchTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<"matched" | "explore">("matched");

  useEffect(() => {
    loadMatched();
  }, []);

  async function loadMatched() {
    setMatchedLoading(true);
    setMatchedError(false);
    try {
      const res = await fetch("/api/jobs/matched");
      if (!res.ok) throw new Error();
      const data = (await res.json()) as MatchedResponse;
      setMatchedJobs(data.jobs);
      setUserContext({ skills: data.userSkills, location: data.userLocation });
    } catch {
      setMatchedError(true);
    } finally {
      setMatchedLoading(false);
    }
  }

  async function handleSearch(e?: React.FormEvent, pageToLoad = 1) {
    if (e) e.preventDefault();

    if (!searchSkills.trim() && !searchLocation.trim() && !searchRole.trim()) {
      setSearchError("Please enter at least one skill, location, or job role.");
      return;
    }

    setSearchError("");
    setHasSearched(true);
    setIsSearching(true);

    try {
      const params = new URLSearchParams({ page: pageToLoad.toString() });
      if (searchSkills.trim()) params.set("skills", searchSkills);
      if (searchLocation.trim()) params.set("location", searchLocation);
      if (searchRole.trim()) params.set("role", searchRole);

      const res = await fetch(`/api/jobs/search?${params.toString()}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as SearchResponse;

      if (pageToLoad === 1) {
        setSearchResults(data.jobs);
      } else {
        setSearchResults(prev => [...prev, ...data.jobs]);
      }

      setSearchPage(data.page);
      setSearchHasMore(data.hasMore);
      setSearchTotal(data.total);
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="space-y-10 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Tab Switcher */}
      <div className="flex justify-center mt-4">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab("matched")}
            className={cn(
              "px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ease-in-out",
              activeTab === "matched"
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            Recommended for You
          </button>
          <button
            onClick={() => setActiveTab("explore")}
            className={cn(
              "px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ease-in-out",
              activeTab === "explore"
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            Market Exploration
          </button>
        </div>
      </div>

      {activeTab === "matched" ? (
        /* SECTION 1: Your Matched Jobs */
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <header className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Your Matched Jobs</h2>
            <p className="text-slate-500">Based on your skills and location profiles</p>
            {!matchedLoading && !matchedError && userContext.skills.length > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                {matchedJobs.length} jobs found for {userContext.skills.slice(0, 2).join(", ")} {userContext.location ? `in ${userContext.location}` : ""}
              </p>
            )}
          </header>

          {matchedLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <JobSkeleton key={i} />
              ))}
            </div>
          ) : matchedError ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-slate-500">
              <p>Could not load jobs right now.</p>
              <Button variant="outline" onClick={loadMatched} className="mt-4">
                Try again
              </Button>
            </div>
          ) : matchedJobs.length === 0 ? (
            <div className="rounded-xl border border-dashed py-16 px-8 text-center bg-slate-50/50">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-medium text-slate-900">No matched jobs found yet</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                Add more skills to your profile to see matches here.
              </p>
              <Button asChild className="mt-6" variant="default">
                <Link href="/profile">Update Skills</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {matchedJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* SECTION 2: Explore More Jobs */
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <header className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Explore Market</h2>
            <p className="text-slate-500">Search and filter jobs your way</p>
          </header>

          <form onSubmit={(e) => handleSearch(e, 1)} className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search-role" className="sr-only">Job Role</label>
                <Input
                  id="search-role"
                  placeholder="e.g. Data Scientist..."
                  value={searchRole}
                  onChange={(e) => setSearchRole(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="search-skills" className="sr-only">Skills</label>
                <Input
                  id="search-skills"
                  placeholder="e.g. Python, React..."
                  value={searchSkills}
                  onChange={(e) => setSearchSkills(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="search-location" className="sr-only">Location</label>
                <Input
                  id="search-location"
                  placeholder="e.g. London, Mumbai..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" className="md:w-32" disabled={isSearching}>
                {isSearching && searchPage === 1 ? "Searching..." : "Search ▶"}
              </Button>
            </div>
            {searchError && (
              <p className="mt-3 text-sm font-medium text-destructive">{searchError}</p>
            )}
          </form>

          {!hasSearched ? (
            <div className="rounded-xl border border-dashed py-24 px-8 text-center bg-slate-50/50">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4 opacity-70">
                <span className="text-3xl">💼</span>
              </div>
              <p className="mt-2 text-base text-slate-500 max-w-md mx-auto">
                Search for jobs above to explore opportunities.
              </p>
            </div>
          ) : isSearching && searchPage === 1 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <JobSkeleton key={i} />
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="rounded-xl border border-dashed py-16 px-8 text-center bg-slate-50/50">
              <h3 className="text-lg font-medium text-slate-900">No jobs found for your search</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
                Try different skills or a broader location.
              </p>
              <div className="mt-6 flex flex-col items-center space-y-2 text-sm text-slate-400">
                <p>&bull; Try: &apos;London&apos; instead of &apos;East London&apos;</p>
                <p>&bull; Try: &apos;Python Developer&apos; as job role</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-sm text-slate-500 font-medium">
                Showing {searchResults.length} of {searchTotal} results
                {(searchSkills || searchLocation || searchRole) && " for "}
                <span className="text-slate-800">
                  {[searchRole, searchSkills, searchLocation].filter(Boolean).join(" • ")}
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((job, idx) => (
                  <JobCard key={`${job.id}-${idx}`} job={job} />
                ))}
              </div>

              {searchHasMore && (
                <div className="flex flex-col items-center pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleSearch(undefined, searchPage + 1)}
                    disabled={isSearching}
                    className="w-full sm:w-auto min-w-[200px]"
                  >
                    {isSearching ? "Loading..." : "Load more jobs"}
                  </Button>
                  <p className="mt-3 text-xs text-slate-400">Showing {searchResults.length} of {searchTotal}</p>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
