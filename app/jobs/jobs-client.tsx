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
    <div className="group glass-panel flex flex-col h-full rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all hover:-translate-y-1 relative border border-border/50">
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
         <span className="flex h-3 w-3 rounded-full bg-primary animate-ping" />
      </div>
      <CardHeader className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="font-display text-xl leading-tight group-hover:text-primary transition-colors">
              {job.title}
            </CardTitle>
            <div className="mt-2 text-sm font-semibold text-muted-foreground">
              {job.company}
            </div>
          </div>
          <Badge variant="outline" className={cn("shrink-0 rounded-full font-bold uppercase tracking-wider text-[10px] px-3 py-1 shadow-sm", scoreColor.replace('slate', 'muted').replace('bg-slate-100', 'bg-surface-container').replace('border-slate-200', 'border-border').replace('text-slate-700', 'text-foreground').replace('bg-green-100', 'bg-secondary/10').replace('text-green-800', 'text-secondary').replace('border-green-200', 'border-secondary/20').replace('bg-yellow-100', 'bg-tertiary/10').replace('text-yellow-800', 'text-tertiary').replace('border-yellow-200', 'border-tertiary/20'))}>
            {scoreText} ({score}%)
          </Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1.5 rounded-full bg-surface-container-low px-2.5 py-1 border border-border/50"><svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>{job.location}</span>
          )}
          {salary && (
            <span className="flex items-center gap-1.5 rounded-full bg-surface-container-low px-2.5 py-1 border border-border/50"><svg className="w-3 h-3 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{salary}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-6 pt-0">
        <p className="line-clamp-3 text-sm text-foreground/80 flex-1 mb-6 leading-relaxed">
          {job.description}
        </p>

        {(job.matchingSkills?.length || job.missingSkills?.length) ? (
          <div className="space-y-4 mb-6 rounded-2xl bg-background/30 p-4 border border-border/30">
            {job.matchingSkills && job.matchingSkills.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Matched Skills</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {job.matchingSkills.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                      {skill}
                    </Badge>
                  ))}
                  {job.matchingSkills.length > 4 && (
                    <Badge variant="outline" className="bg-surface-container border-border/50 text-muted-foreground text-[10px] px-2 py-0.5 rounded-md font-semibold">
                      +{job.matchingSkills.length - 4}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {job.missingSkills && job.missingSkills.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Skill Gaps</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {job.missingSkills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                      {skill}
                    </Badge>
                  ))}
                  {job.missingSkills.length > 3 && (
                    <Badge variant="outline" className="bg-surface-container border-border/50 text-muted-foreground text-[10px] px-2 py-0.5 rounded-md font-semibold">
                      +{job.missingSkills.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-auto pt-4 border-t border-border/50 flex justify-end">
          <Button asChild className="w-full sm:w-auto rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all" onClick={handleApply}>
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              View Opportunity &rarr;
            </a>
          </Button>
        </div>
      </CardContent>
    </div>
  );
}

function JobSkeleton() {
  return (
    <div className="glass-panel flex flex-col h-full rounded-3xl p-6 border border-border/50 opacity-70">
      <div className="mb-4">
        <Skeleton className="h-8 w-3/4 mb-3 rounded-md bg-surface-container" />
        <Skeleton className="h-4 w-1/2 rounded-md bg-surface-container" />
        <div className="mt-5 flex gap-3">
          <Skeleton className="h-6 w-24 rounded-full bg-surface-container" />
          <Skeleton className="h-6 w-28 rounded-full bg-surface-container" />
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="space-y-3 mb-6">
          <Skeleton className="h-4 w-full rounded-md bg-surface-container" />
          <Skeleton className="h-4 w-full rounded-md bg-surface-container" />
          <Skeleton className="h-4 w-2/3 rounded-md bg-surface-container" />
        </div>
        <div className="space-y-3 mb-6">
          <Skeleton className="h-3 w-20 rounded-md bg-surface-container" />
          <div className="flex gap-2"><Skeleton className="h-6 w-16 rounded-md bg-surface-container" /><Skeleton className="h-6 w-20 rounded-md bg-surface-container" /></div>
        </div>
        <div className="mt-auto pt-4 border-t border-border/50 flex justify-end">
          <Skeleton className="h-10 w-32 rounded-full bg-surface-container" />
        </div>
      </div>
    </div>
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
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <section className="space-y-2">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary/80">
          Career Radar
        </p>
        <h2 className="font-display text-4xl font-bold tracking-tight">
          Opportunity Network.
        </h2>
        <p className="text-sm text-muted-foreground font-medium">
          Roles dynamically ranked by your skill alignment and compensation needs.
        </p>
      </section>

      {/* Tab Switcher */}
      <div className="flex mt-4">
        <div className="inline-flex p-1.5 bg-surface-container-low rounded-full border border-border/50 shadow-inner">
          <button
            onClick={() => setActiveTab("matched")}
            className={cn(
              "px-6 py-2 text-sm font-bold rounded-full transition-all duration-300 ease-in-out",
              activeTab === "matched"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-container"
            )}
          >
            Recommended Trajectories
          </button>
          <button
            onClick={() => setActiveTab("explore")}
            className={cn(
              "px-6 py-2 text-sm font-bold rounded-full transition-all duration-300 ease-in-out",
              activeTab === "explore"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-container"
            )}
          >
            Market Explorer
          </button>
        </div>
      </div>

      {activeTab === "matched" ? (
        /* SECTION 1: Your Matched Jobs */
        <section className="animate-fade-in-up">
          <header className="mb-8 flex items-center justify-between border-b border-border/50 pb-4">
            <div>
               <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">Algorithmic Matches</h3>
               {!matchedLoading && !matchedError && userContext?.skills?.length > 0 && (
                 <p className="text-sm text-muted-foreground font-medium mt-1">
                   {matchedJobs.length} precision roles identified based on your {userContext.skills.slice(0, 2).join(", ")} footprint {userContext.location ? `in ${userContext.location}` : ""}
                 </p>
               )}
            </div>
          </header>

          {matchedLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <JobSkeleton key={i} />
              ))}
            </div>
          ) : matchedError ? (
            <div className="glass-panel rounded-3xl border border-destructive/20 p-8 text-center text-muted-foreground">
              <h3 className="font-display text-xl font-bold text-destructive mb-2">Sync Error</h3>
              <p>Unable to retrieve market opportunities.</p>
              <Button onClick={loadMatched} className="mt-4 rounded-full">
                Retry Connection
              </Button>
            </div>
          ) : matchedJobs.length === 0 ? (
            <div className="glass-panel rounded-3xl border border-dashed border-border/50 py-16 px-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-container mb-6 border border-border">
                <span className="text-2xl opacity-50">🧭</span>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">Awaiting Context</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your profile lacks the sufficient skill data needed to project career trajectories. 
              </p>
              <Button asChild className="mt-6 rounded-full" variant="outline">
                <Link href="/profile">Inject Skills</Link>
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
        <section className="animate-fade-in-up">
          <header className="mb-6 flex flex-col gap-2 border-b border-border/50 pb-4">
            <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">Global Search</h3>
            <p className="text-sm text-muted-foreground font-medium mb-2">Manually scan the market beyond your algorithmic boundaries.</p>
          </header>

          <form onSubmit={(e) => handleSearch(e, 1)} className="mb-8 glass-panel rounded-3xl p-6 border border-border/50">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 space-y-1.5">
                <label htmlFor="search-role" className="ml-1 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Job Role</label>
                <Input
                  id="search-role"
                  placeholder="e.g. Data Scientist..."
                  value={searchRole}
                  onChange={(e) => setSearchRole(e.target.value)}
                  className="w-full rounded-xl bg-surface-container-low border-border/50"
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <label htmlFor="search-skills" className="ml-1 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Skills</label>
                <Input
                  id="search-skills"
                  placeholder="e.g. Python, React..."
                  value={searchSkills}
                  onChange={(e) => setSearchSkills(e.target.value)}
                  className="w-full rounded-xl bg-surface-container-low border-border/50"
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <label htmlFor="search-location" className="ml-1 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Location</label>
                <Input
                  id="search-location"
                  placeholder="e.g. London, Remote..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full rounded-xl bg-surface-container-low border-border/50"
                />
              </div>
              <div className="flex items-end pb-0.5">
                 <Button type="submit" className="w-full lg:w-32 rounded-xl py-6 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all" disabled={isSearching}>
                   {isSearching && searchPage === 1 ? "Scanning..." : "Search"}
                 </Button>
              </div>
            </div>
            {searchError && (
              <div className="mt-4 rounded-lg bg-destructive/10 p-3 border border-destructive/20 text-xs font-semibold text-destructive inline-block">
                 {searchError}
              </div>
            )}
          </form>

          {!hasSearched ? (
            <div className="glass-panel rounded-3xl border border-dashed border-border/50 py-24 px-8 text-center text-muted-foreground">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-surface-container-low mb-6 border border-border">
                <svg className="w-6 h-6 text-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">Initiate Market Scan</h3>
              <p className="mt-2 text-sm max-w-md mx-auto font-medium">
                Enter parameters above to sweep for targeted opportunities globally.
              </p>
            </div>
          ) : isSearching && searchPage === 1 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <JobSkeleton key={i} />
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="glass-panel rounded-3xl border border-dashed border-border/50 py-16 px-8 text-center">
              <h3 className="font-display text-xl font-bold text-foreground mb-2">Zero Anomalies Detected</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto font-medium mb-6">
                The current parameters returned no valid trajectories. Shift your search variables.
              </p>
              <div className="flex flex-col items-center space-y-2 text-xs font-mono text-muted-foreground bg-surface-container-low/50 p-4 rounded-xl inline-block text-left">
                <p>&gt; Widen location scope (e.g. Remote, Worldwide)</p>
                <p>&gt; Reduce skill constraints</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                 <h3 className="font-display text-lg font-bold">Scan Results</h3>
                 <Badge variant="outline" className="rounded-full bg-surface-container border-border/50 font-mono text-[10px]">
                   {searchTotal} MATCHES
                 </Badge>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((job, idx) => (
                  <JobCard key={`${job.id}-${idx}`} job={job} />
                ))}
              </div>

              {searchHasMore && (
                <div className="flex flex-col items-center pt-8">
                  <Button
                    variant="outline"
                    onClick={() => handleSearch(undefined, searchPage + 1)}
                    disabled={isSearching}
                    className="w-full sm:w-auto min-w-[200px] rounded-full hover:bg-surface-container-low border-border/80"
                  >
                    {isSearching ? "Paginating..." : "Extend Scan Horizon"}
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
