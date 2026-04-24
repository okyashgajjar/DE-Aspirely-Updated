"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import type { JobListing } from "@/types";

type MatchedResponse = {
  jobs: JobListing[];
  userSkills: string[];
  userLocation: string;
  page: number;
  hasMore: boolean;
  total: number;
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
  let scoreClasses = "bg-muted text-muted-foreground";
  let scoreText = "Partial";

  if (score >= 80) {
    scoreClasses = "bg-secondary/10 text-secondary";
    scoreText = "Strong";
  } else if (score >= 50) {
    scoreClasses = "bg-primary/10 text-primary";
    scoreText = "Good";
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
    <div className="group flex flex-col h-full rounded-2xl bg-card overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all hover:-translate-y-0.5">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="font-display text-lg leading-tight group-hover:text-primary transition-colors">
              {job.title}
            </CardTitle>
            <div className="mt-1.5 text-sm font-medium text-muted-foreground">
              {job.company}
            </div>
          </div>
          <Badge className={cn("shrink-0 rounded-full font-semibold text-[10px] px-2.5 py-0.5 border-0", scoreClasses)}>
            {scoreText} {score}%
          </Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
              📍 {job.location}
            </span>
          )}
          {salary && (
            <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
              💰 {salary}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-5 pt-0">
        <p className="line-clamp-3 text-sm text-muted-foreground flex-1 mb-4 leading-relaxed">
          {job.description}
        </p>

        {(job.matchingSkills?.length || job.missingSkills?.length) ? (
          <div className="space-y-3 mb-4 rounded-xl bg-muted/50 p-3">
            {job.matchingSkills && job.matchingSkills.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Matched</span>
                <div className="flex flex-wrap gap-1">
                  {job.matchingSkills.slice(0, 4).map((skill) => (
                    <Badge key={skill} className="bg-secondary/10 text-secondary border-0 text-[10px] px-2 py-0.5 rounded-md font-medium">
                      {skill}
                    </Badge>
                  ))}
                  {job.matchingSkills.length > 4 && (
                    <Badge className="bg-muted text-muted-foreground border-0 text-[10px] px-2 py-0.5 rounded-md font-medium">
                      +{job.matchingSkills.length - 4}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {job.missingSkills && job.missingSkills.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Gaps</span>
                <div className="flex flex-wrap gap-1">
                  {job.missingSkills.slice(0, 3).map((skill) => (
                    <Badge key={skill} className="bg-destructive/10 text-destructive border-0 text-[10px] px-2 py-0.5 rounded-md font-medium">
                      {skill}
                    </Badge>
                  ))}
                  {job.missingSkills.length > 3 && (
                    <Badge className="bg-muted text-muted-foreground border-0 text-[10px] px-2 py-0.5 rounded-md font-medium">
                      +{job.missingSkills.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-auto pt-3 flex justify-end" style={{ borderTop: '1px solid var(--border)' }}>
          <Button asChild className="w-full sm:w-auto rounded-full btn-gradient font-semibold shadow-md text-sm px-5" onClick={handleApply}>
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              View Role &rarr;
            </a>
          </Button>
        </div>
      </CardContent>
    </div>
  );
}

function JobSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-2xl p-5 bg-card">
      <div className="mb-4">
        <Skeleton className="h-6 w-3/4 mb-2 rounded-md bg-muted" />
        <Skeleton className="h-4 w-1/2 rounded-md bg-muted" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full bg-muted" />
          <Skeleton className="h-6 w-28 rounded-full bg-muted" />
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="space-y-2 mb-4">
          <Skeleton className="h-3 w-full rounded-md bg-muted" />
          <Skeleton className="h-3 w-full rounded-md bg-muted" />
          <Skeleton className="h-3 w-2/3 rounded-md bg-muted" />
        </div>
        <div className="mt-auto pt-3 flex justify-end" style={{ borderTop: '1px solid var(--border)' }}>
          <Skeleton className="h-9 w-28 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}

export default function JobsClient() {
  const [matchedJobs, setMatchedJobs] = useState<JobListing[]>([]);
  const [matchedLoading, setMatchedLoading] = useState(true);
  const [matchedError, setMatchedError] = useState(false);
  const [matchedPage, setMatchedPage] = useState(1);
  const [matchedHasMore, setMatchedHasMore] = useState(false);
  const [isLoadingMoreMatched, setIsLoadingMoreMatched] = useState(false);
  const [userContext, setUserContext] = useState<{ skills: string[]; location: string }>({ skills: [], location: "" });

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

  async function loadMatched(pageToLoad = 1) {
    if (pageToLoad === 1) {
      setMatchedLoading(true);
      setMatchedError(false);
    } else {
      setIsLoadingMoreMatched(true);
    }

    try {
      const res = await fetch(`/api/jobs/matched?page=${pageToLoad}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as MatchedResponse;
      
      if (pageToLoad === 1) {
        setMatchedJobs(data.jobs);
      } else {
        setMatchedJobs(prev => [...prev, ...data.jobs]);
      }
      
      setUserContext({ skills: data.userSkills, location: data.userLocation });
      setMatchedPage(data.page);
      setMatchedHasMore(data.hasMore);

    } catch {
      if (pageToLoad === 1) {
        setMatchedError(true);
      }
    } finally {
      setMatchedLoading(false);
      setIsLoadingMoreMatched(false);
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
    <div className="flex flex-col gap-5 animate-fade-in-up">
      <section className="space-y-1.5">
        <h2 className="font-display text-3xl font-bold tracking-tight">
          Job Matches
        </h2>
        <p className="text-sm text-muted-foreground font-medium">
          Roles ranked by your skill alignment and compensation needs.
        </p>
      </section>

      {/* Tab Switcher */}
      <div className="flex">
        <div className="inline-flex p-1 bg-muted rounded-full">
          <button
            onClick={() => setActiveTab("matched")}
            className={cn(
              "px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200",
              activeTab === "matched"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Recommended
          </button>
          <button
            onClick={() => setActiveTab("explore")}
            className={cn(
              "px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200",
              activeTab === "explore"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Explore
          </button>
        </div>
      </div>

      {activeTab === "matched" ? (
        <section>
          <header className="mb-6 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-display text-xl font-bold tracking-tight">AI-Matched Roles</h3>
            {!matchedLoading && !matchedError && userContext?.skills?.length > 0 && (
              <p className="text-sm text-muted-foreground font-medium mt-1">
                {matchedJobs.length} roles based on {userContext.skills.slice(0, 2).join(", ")} {userContext.location ? `in ${userContext.location}` : ""}
              </p>
            )}
          </header>

          {matchedLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <JobSkeleton key={i} />
              ))}
            </div>
          ) : matchedError ? (
            <div className="rounded-2xl bg-destructive/5 p-8 text-center text-muted-foreground">
              <h3 className="font-display text-lg font-bold text-destructive mb-2">Error loading jobs</h3>
              <p className="text-sm">Unable to retrieve job matches.</p>
              <Button onClick={loadMatched} className="mt-4 rounded-full btn-gradient">
                Retry
              </Button>
            </div>
          ) : matchedJobs.length === 0 ? (
            <div className="rounded-2xl bg-card py-14 px-8 text-center" style={{ border: '1px dashed var(--border)' }}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                <span className="text-2xl">🧭</span>
              </div>
              <h3 className="font-display text-lg font-bold mb-2">No matches yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Complete your profile with skills to get AI-matched jobs.
              </p>
              <Button asChild className="mt-5 rounded-full btn-gradient" variant="outline">
                <Link href="/profile">Add Skills</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
                {matchedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              
              {matchedHasMore && (
                <div className="flex flex-col items-center pt-6">
                  <Button
                    variant="outline"
                    onClick={() => loadMatched(matchedPage + 1)}
                    disabled={isLoadingMoreMatched}
                    className="w-full sm:w-auto min-w-[180px] rounded-full border-border"
                  >
                    {isLoadingMoreMatched ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        <section>
          <header className="mb-5 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-display text-xl font-bold tracking-tight">Search Jobs</h3>
            <p className="text-sm text-muted-foreground font-medium mt-1">Search the market beyond your matched roles.</p>
          </header>

          <form onSubmit={(e) => handleSearch(e, 1)} className="mb-6 rounded-2xl bg-card p-5">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 space-y-1">
                <label htmlFor="search-role" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Job Role</label>
                <Input
                  id="search-role"
                  placeholder="e.g. Data Scientist..."
                  value={searchRole}
                  onChange={(e) => setSearchRole(e.target.value)}
                  className="w-full rounded-xl bg-muted border-transparent input-focus-glow"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label htmlFor="search-skills" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Skills</label>
                <Input
                  id="search-skills"
                  placeholder="e.g. Python, React..."
                  value={searchSkills}
                  onChange={(e) => setSearchSkills(e.target.value)}
                  className="w-full rounded-xl bg-muted border-transparent input-focus-glow"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label htmlFor="search-location" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Location</label>
                <Input
                  id="search-location"
                  placeholder="e.g. London, Remote..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full rounded-xl bg-muted border-transparent input-focus-glow"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full lg:w-auto rounded-full btn-gradient px-6 py-5 font-semibold" disabled={isSearching}>
                  {isSearching && searchPage === 1 ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
            {searchError && (
              <div className="mt-3 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
                {searchError}
              </div>
            )}
          </form>

          {!hasSearched ? (
            <div className="rounded-2xl bg-card py-16 px-8 text-center text-muted-foreground" style={{ border: '1px dashed var(--border)' }}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                🔍
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">Search the Market</h3>
              <p className="text-sm max-w-md mx-auto font-medium">
                Enter search parameters above to find opportunities.
              </p>
            </div>
          ) : isSearching && searchPage === 1 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <JobSkeleton key={i} />
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="rounded-2xl bg-card py-14 px-8 text-center" style={{ border: '1px dashed var(--border)' }}>
              <h3 className="font-display text-lg font-bold mb-2">No results</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium">
                Try broadening your search (e.g. wider location or fewer skills).
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <h3 className="font-display text-lg font-bold">Results</h3>
                <Badge className="rounded-full bg-muted text-muted-foreground border-0 font-mono text-[10px]">
                  {searchTotal} found
                </Badge>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
                {searchResults.map((job, idx) => (
                  <JobCard key={`${job.id}-${idx}`} job={job} />
                ))}
              </div>

              {searchHasMore && (
                <div className="flex flex-col items-center pt-6">
                  <Button
                    variant="outline"
                    onClick={() => handleSearch(undefined, searchPage + 1)}
                    disabled={isSearching}
                    className="w-full sm:w-auto min-w-[180px] rounded-full border-border"
                  >
                    {isSearching ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
