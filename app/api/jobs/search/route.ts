import { NextResponse, type NextRequest } from "next/server";
import type { JobListing } from "@/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAdzunaJobs } from "@/lib/adzuna";
import { mapSkillsToJobRoles, getCountryCode } from "@/lib/skill-mapper";
import { normalizeSkill, extractSkillsFromText } from "@/lib/skills";

export async function GET(req: NextRequest) {
    try {
        const supabase = await getSupabaseServerClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const url = new URL(req.url);
        const skillsParam = url.searchParams.get("skills") ?? "";
        const locationParam = url.searchParams.get("location") ?? "";
        const roleParam = url.searchParams.get("role") ?? "";
        const pageRaw = url.searchParams.get("page");

        const page = Number.isNaN(Number(pageRaw)) || !pageRaw ? 1 : Math.max(1, Number(pageRaw));

        if (!skillsParam && !locationParam && !roleParam) {
            return NextResponse.json({ error: "At least one search parameter is required" }, { status: 400 });
        }

        const inputSkills = skillsParam.split(",").map(s => s.trim()).filter(Boolean);

        let what = "";
        if (roleParam) {
            what = roleParam.trim();
        } else if (inputSkills.length > 0) {
            what = mapSkillsToJobRoles(inputSkills).slice(0, 3).join(" OR ");
        } else if (locationParam) {
            what = "Software Engineer";
        }

        const where = locationParam ? locationParam.trim() : undefined;
        const country = getCountryCode(locationParam);

        let jobsResult = await fetchAdzunaJobs({
            what,
            where,
            country,
            resultsPerPage: 10,
            page,
        });

        let queryUsed = what;

        // Retry 1: No location
        if (jobsResult.jobs.length === 0 && where) {
            jobsResult = await fetchAdzunaJobs({
                what,
                country,
                resultsPerPage: 10,
                page,
            });
        }

        // Get DB skills and experience for matching score
        const { data: onboardingRow } = await supabase
            .from("onboarding_profiles")
            .select("skills, experience_level")
            .eq("user_id", user.id)
            .order("completed_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        const userSkills = (onboardingRow?.skills ?? []) as string[];
        const userExperience = (onboardingRow?.experience_level ?? "Mid") as string;
        const userSkillsNorm = Array.from(new Set(userSkills.map(normalizeSkill).filter(Boolean)));

        // --- Python Cross-Validation Integration ---
        const { spawn } = await import("node:child_process");
        const path = await import("node:path");

        const pythonResults: (JobListing & { matchScore: number; matchingSkills: string[]; missingSkills: string[]; requiredSkills: string[]; })[] = await new Promise((resolve) => {
            try {
                const scriptPath = path.join(process.cwd(), "scripts", "validator.py");
                const pythonProcess = spawn("python3", [scriptPath]);

                let stdoutData = "";
                let stderrData = "";

                pythonProcess.stdin.write(JSON.stringify({
                    user_skills: userSkills,
                    user_experience: userExperience,
                    jobs: jobsResult.jobs
                }));
                pythonProcess.stdin.end();

                pythonProcess.stdout.on("data", (data) => {
                    stdoutData += data.toString();
                });

                pythonProcess.stderr.on("data", (data) => {
                    stderrData += data.toString();
                });

                pythonProcess.on("close", (code) => {
                    if (code !== 0) {
                        console.error("Python validator script failed (Search API) with code", code, stderrData);
                        resolve([]);
                        return;
                    }
                    try {
                        const parsed = JSON.parse(stdoutData);
                        resolve(parsed);
                    } catch (e) {
                        console.error("Failed to parse Python output (Search API)", e);
                        resolve([]);
                    }
                });

                setTimeout(() => {
                    pythonProcess.kill();
                    resolve([]);
                }, 5000);
            } catch (err) {
                console.error("Error spanning python process (Search API)", err);
                resolve([]);
            }
        });

        let finalJobs = pythonResults;
        if (finalJobs.length === 0) {
            finalJobs = jobsResult.jobs.map(job => {
                const text = `${job.title} ${job.description}`;
                const jobSkillsNorm = Array.from(new Set(extractSkillsFromText(text).map(normalizeSkill).filter(Boolean)));

                let intersectionCount = 0;
                const matchingSkills: string[] = [];
                const requiredSkills: string[] = jobSkillsNorm;

                for (const skill of userSkillsNorm) {
                    if (jobSkillsNorm.includes(skill)) {
                        intersectionCount += 1;
                        matchingSkills.push(skill);
                    }
                }

                const missingSkills = jobSkillsNorm.filter(skill => !userSkillsNorm.includes(skill));

                let matchScore = 45; // Baseline
                if (jobSkillsNorm.length > 0 && userSkillsNorm.length > 0) {
                    const jobCoverage = intersectionCount / jobSkillsNorm.length;
                    const userCoverage = intersectionCount / userSkillsNorm.length;
                    const rawScore = (jobCoverage * 0.4) + (userCoverage * 0.6);
                    matchScore = 50 + Math.floor(rawScore * 50);
                } else if (intersectionCount > 0) {
                    matchScore = 80;
                }

                if (matchScore > 100) matchScore = 100;

                return {
                    ...job,
                    matchScore,
                    matchingSkills,
                    missingSkills,
                    requiredSkills
                };
            });
            finalJobs.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
        }

        const scoredJobs = finalJobs;

        scoredJobs.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

        return NextResponse.json({
            jobs: scoredJobs,
            total: jobsResult.total,
            page,
            hasMore: jobsResult.jobs.length === 10,
            queryUsed,
            filters: {
                skills: inputSkills,
                location: locationParam,
                role: roleParam
            }
        });

    } catch (error) {
        console.error("GET /api/jobs/search error", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
