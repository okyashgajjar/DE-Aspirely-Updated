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

        const baseWhere = userLocation ? userLocation.trim() : undefined;
        const baseCountry = getCountryCode(userLocation);

        const skillsToQuery = userSkills.slice(0, 5);
        if (skillsToQuery.length === 0) {
            skillsToQuery.push("software engineer");
        }

        const jobPromises = skillsToQuery.map(skill => 
            fetchAdzunaJobs({
                what: skill,
                where: baseWhere,
                country: baseCountry,
                resultsPerPage: 10,
                page: 1,
            }).catch(() => ({ jobs: [], total: 0 }))
        );

        let queryUsed = skillsToQuery.join(', ');
        let locationUsed = baseWhere ?? "none";
        let countryUsed = baseCountry;

        let results = await Promise.all(jobPromises);
        let allJobs: JobListing[] = [];
        for (const res of results) {
            allJobs.push(...res.jobs);
        }

        const uniqueJobsMap = new Map<string, JobListing>();
        for (const j of allJobs) {
            if (!uniqueJobsMap.has(j.id)) uniqueJobsMap.set(j.id, j);
        }
        let jobsArray = Array.from(uniqueJobsMap.values());

        // Retry without location if none found
        if (jobsArray.length === 0 && baseWhere) {
            const fallbackPromises = skillsToQuery.map(skill => 
                fetchAdzunaJobs({
                    what: skill,
                    country: baseCountry,
                    resultsPerPage: 10,
                    page: 1,
                }).catch(() => ({ jobs: [], total: 0 }))
            );
            const fbResults = await Promise.all(fallbackPromises);
            for (const res of fbResults) {
                if (res.jobs) {
                    for (const j of res.jobs) {
                        if (!uniqueJobsMap.has(j.id)) uniqueJobsMap.set(j.id, j);
                    }
                }
            }
            jobsArray = Array.from(uniqueJobsMap.values());
            locationUsed = "none";
        }

        const userSkillsNorm = Array.from(new Set(userSkills.map(normalizeSkill).filter(Boolean)));

        console.log(`Scoring ${jobsArray.length} jobs against ${userSkillsNorm.length} user skills.`);

        const finalJobs = jobsArray.map(job => {
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

            let matchScore = 45; // Baseline acceptable score
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

        return NextResponse.json({
            jobs: finalJobs.slice(0, 10),
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
