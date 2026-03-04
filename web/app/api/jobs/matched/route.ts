import { NextResponse } from "next/server";
import type { JobListing } from "@/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAdzunaJobs } from "@/lib/adzuna";
import { mapSkillsToJobRoles, getCountryCode } from "@/lib/skill-mapper";
import { normalizeSkill, extractSkillsFromText } from "@/lib/skills";

export async function GET() {
    try {
        const supabase = await getSupabaseServerClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const [
            { data: onboardingRow },
            { data: userRow }
        ] = await Promise.all([
            supabase
                .from("onboarding_profiles")
                .select("skills, experience_level, education, goals")
                .eq("user_id", user.id)
                .order("completed_at", { ascending: false })
                .limit(1)
                .maybeSingle(),
            supabase
                .from("users")
                .select("location, name")
                .eq("id", user.id)
                .maybeSingle()
        ]);

        const userSkills = (onboardingRow?.skills ?? []) as string[];
        const userLocation = (userRow?.location ?? "") as string;
        const userExperience = (onboardingRow?.experience_level ?? "Mid") as string;

        const roles = mapSkillsToJobRoles(userSkills);
        const rolesQuery = roles.slice(0, 3).join(" OR ");
        const skillsQuery = userSkills.slice(0, 5).join(" ");

        let what = rolesQuery || "Software Engineer";

        const baseWhere = userLocation ? userLocation.trim() : undefined;
        const baseCountry = getCountryCode(userLocation);

        let jobsResult = await fetchAdzunaJobs({
            what,
            where: baseWhere,
            country: baseCountry,
            resultsPerPage: 10,
            page: 1,
        });

        let queryUsed = what;
        let locationUsed = baseWhere ?? "none";
        let countryUsed = baseCountry;

        // Retry 1: No results with roles + location -> Try raw skills + location
        if (jobsResult.jobs.length === 0 && skillsQuery) {
            what = skillsQuery;
            jobsResult = await fetchAdzunaJobs({
                what,
                where: baseWhere,
                country: baseCountry,
                resultsPerPage: 10,
                page: 1,
            });
            queryUsed = what;
        }

        // Retry 2: No results -> Try raw skills WITHOUT location (same country)
        if (jobsResult.jobs.length === 0 && baseWhere) {
            jobsResult = await fetchAdzunaJobs({
                what,
                country: baseCountry,
                resultsPerPage: 10,
                page: 1,
            });
            locationUsed = "none";
        }

        // Retry 3: No results -> Try raw skills WITHOUT location (in GB/broadest)
        if (jobsResult.jobs.length === 0 && baseCountry !== "gb") {
            jobsResult = await fetchAdzunaJobs({
                what,
                country: "gb",
                resultsPerPage: 10,
                page: 1,
            });
            countryUsed = "gb";
            locationUsed = "none";
        }

        const userSkillsNorm = Array.from(new Set(userSkills.map(normalizeSkill).filter(Boolean)));

        // --- Python Cross-Validation Integration ---
        const { spawn } = await import("node:child_process");
        const path = await import("node:path");

        const pythonResults: JobListing[] = await new Promise((resolve) => {
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
                        console.error("Python validator script failed with code", code, stderrData);
                        resolve([]); // Fallback to empty if script fails
                        return;
                    }
                    try {
                        const parsed = JSON.parse(stdoutData) as JobListing[];
                        resolve(parsed);
                    } catch (e) {
                        console.error("Failed to parse Python output", e);
                        resolve([]);
                    }
                });

                // Safety timeout
                setTimeout(() => {
                    pythonProcess.kill();
                    resolve([]);
                }, 5000);
            } catch (err) {
                console.error("Error spanning python process", err);
                resolve([]);
            }
        });

        // Use Python results if available, otherwise fallback to existing Node-based scoring
        let finalJobs = pythonResults;
        if (finalJobs.length === 0) {
            console.warn("Falling back to Node-based job scoring");
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

                let matchScore = 45; // Baseline acceptable score so jobs always show visually Okay
                if (jobSkillsNorm.length > 0 && userSkillsNorm.length > 0) {
                    const jobCoverage = intersectionCount / jobSkillsNorm.length;
                    const userCoverage = intersectionCount / userSkillsNorm.length;

                    // Weight userCoverage higher so if a user finds a job using their 1 skill, it's a good match
                    const rawScore = (jobCoverage * 0.4) + (userCoverage * 0.6);
                    matchScore = 50 + Math.floor(rawScore * 50); // Scales 50-100
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
            jobs: scoredJobs.slice(0, 10),
            userSkills,
            userLocation,
            queryUsed,
            locationUsed,
            countryUsed
        });
    } catch (error) {
        console.error("GET /api/jobs/matched error", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
