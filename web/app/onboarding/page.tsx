"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";

const onboardingSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().optional(),
  education: z.string().optional(),
  skills: z.array(z.string()).default([]),
  custom_skill: z.string().optional(),
  experience_level: z.string().optional(),
  experience_history: z.string().optional(),
  interests: z.array(z.string()).default([]),
  goals: z.array(z.string()).default([]),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;
type OnboardingValuesInput = z.input<typeof onboardingSchema>;

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm<OnboardingValuesInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      skills: [],
      interests: [],
      goals: [],
    },
  });

  const { register, handleSubmit, setValue, watch } = methods;

  const selectedSkills = watch("skills");
  const selectedInterests = watch("interests");
  const selectedGoals = watch("goals");

  function nextStep() {
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  }

  function skipStep() {
    nextStep();
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function onSubmit(values: OnboardingValuesInput) {
    setSubmitting(true);

    const payload = {
      ...values,
      skills: values.custom_skill
        ? [...(values.skills ?? []), values.custom_skill]
        : (values.skills ?? []),
    };

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to save onboarding data");
      }

      window.location.href = "/dashboard";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  function toggleArrayValue(field: "skills" | "interests" | "goals", value: string) {
    const current = (watch(field) ?? []) as string[];
    if (current.includes(value)) {
      setValue(
        field,
        current.filter((v) => v !== value),
      );
    } else {
      setValue(field, [...current, value]);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-background/60 p-8 shadow-sm backdrop-blur">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Let&apos;s get to know you
            </h1>
            <p className="text-sm text-slate-500">
              Step {step} of {TOTAL_STEPS}
            </p>
          </div>
          <div className="flex h-2 flex-1 rounded-full bg-muted/60 ml-6">
            <div
              className="h-2 rounded-full bg-accent"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            autoComplete="off"
          >
            {step === 1 && (
              <section className="space-y-4">
                <h2 className="text-base font-medium">Personal info</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Name</label>
                    <input
                      className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      {...register("name")}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Location</label>
                    <LocationAutocomplete
                      className="w-full"
                      defaultValue={watch("location")}
                      onLocationSelect={(loc) => setValue("location", loc, { shouldValidate: true })}
                      placeholder="e.g. London, UK"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium">Education</label>
                    <input
                      className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      {...register("education")}
                    />
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-4">
                <h2 className="text-base font-medium">Current skills</h2>
                <p className="text-sm text-slate-500">
                  Select your current strengths and add anything missing.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["React", "TypeScript", "Python", "SQL", "Product Design"].map(
                    (skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleArrayValue("skills", skill)}
                        className={`rounded-full border px-3 py-1 text-xs ${selectedSkills?.includes(skill)
                          ? "bg-accent text-accent-foreground border-transparent"
                          : "border-border bg-background text-foreground"
                          }`}
                      >
                        {skill}
                      </button>
                    ),
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Add a custom skill
                  </label>
                  <input
                    className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    {...register("custom_skill")}
                    placeholder="e.g. Data storytelling, Prompt engineering"
                  />
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-4">
                <h2 className="text-base font-medium">
                  Experience level & history
                </h2>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Experience level</label>
                  <select
                    className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    {...register("experience_level")}
                  >
                    <option value="">Select level</option>
                    <option value="student">Student / Bootcamp</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid-level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead / Manager</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Experience history</label>
                  <textarea
                    rows={4}
                    className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    {...register("experience_history")}
                    placeholder="Summarize your recent roles, projects, or internships."
                  />
                </div>
              </section>
            )}

            {step === 4 && (
              <section className="space-y-4">
                <h2 className="text-base font-medium">Interests</h2>
                <p className="text-sm text-slate-500">
                  What areas are you most excited to grow in?
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Frontend Engineering",
                    "Backend Engineering",
                    "Data & AI",
                    "Product Management",
                    "Design / UX",
                  ].map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleArrayValue("interests", interest)}
                      className={`rounded-full border px-3 py-1 text-xs ${selectedInterests?.includes(interest)
                        ? "bg-accent text-accent-foreground border-transparent"
                        : "border-border bg-background text-foreground"
                        }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {step === 5 && (
              <section className="space-y-4">
                <h2 className="text-base font-medium">Career goals</h2>
                <p className="text-sm text-slate-500">
                  Share where you&apos;d like your career to be in the next 12–24
                  months.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Land my first tech role",
                    "Transition into a new discipline",
                    "Grow into senior / lead",
                    "Prepare for interviews",
                    "Explore options",
                  ].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleArrayValue("goals", goal)}
                      className={`rounded-full border px-3 py-1 text-xs ${selectedGoals?.includes(goal)
                        ? "bg-accent text-accent-foreground border-transparent"
                        : "border-border bg-background text-foreground"
                        }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-8 flex items-center justify-between">
              {step > 1 ? (
                <Button type="button" variant="ghost" onClick={prevStep}>
                  Back
                </Button>
              ) : (
                <div />
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={skipStep}
                  disabled={submitting}
                >
                  Skip this step
                </Button>
                {step === TOTAL_STEPS ? (
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Finishing..." : "Finish onboarding"}
                  </Button>
                ) : (
                  <Button type="button" onClick={nextStep}>
                    Continue
                  </Button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </main>
  );
}

