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
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/3 left-1/3 h-[400px] w-[400px] rounded-full bg-primary/8 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-tertiary/6 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl glass-panel rounded-2xl p-8 sm:p-10 relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">
                Let&apos;s get to know you
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Step {step} of {TOTAL_STEPS}
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="flex h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-tertiary transition-all duration-500 ease-out animate-progress-fill"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  i + 1 < step
                    ? "bg-secondary"
                    : i + 1 === step
                    ? "bg-primary w-6"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            autoComplete="off"
          >
            {step === 1 && (
              <section className="space-y-4 animate-fade-in-up">
                <h2 className="text-base font-semibold">Personal info</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <input
                      className="block w-full rounded-xl bg-muted px-4 py-3 text-sm outline-none transition-all input-focus-glow border border-transparent focus:border-primary/30"
                      placeholder="Your full name"
                      {...register("name")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <LocationAutocomplete
                      className="w-full"
                      defaultValue={watch("location")}
                      onLocationSelect={(loc) => setValue("location", loc, { shouldValidate: true })}
                      placeholder="e.g. London, UK"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Education</label>
                    <input
                      className="block w-full rounded-xl bg-muted px-4 py-3 text-sm outline-none transition-all input-focus-glow border border-transparent focus:border-primary/30"
                      placeholder="e.g. BSc Computer Science"
                      {...register("education")}
                    />
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-4 animate-fade-in-up">
                <h2 className="text-base font-semibold">Current skills</h2>
                <p className="text-sm text-muted-foreground">
                  Select your current strengths and add anything missing.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Writing", "Data Analysis", "Project Management", "Customer Service", "Python"].map(
                    (skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleArrayValue("skills", skill)}
                        className={`rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 ${
                          selectedSkills?.includes(skill)
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "bg-muted text-foreground hover:bg-accent"
                        }`}
                      >
                        {skill}
                      </button>
                    ),
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">
                    Add a custom skill
                  </label>
                  <input
                    className="block w-full rounded-xl bg-muted px-4 py-3 text-sm outline-none transition-all input-focus-glow border border-transparent focus:border-primary/30"
                    {...register("custom_skill")}
                    placeholder="e.g. Data storytelling, Prompt engineering"
                  />
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-4 animate-fade-in-up">
                <h2 className="text-base font-semibold">
                  Experience level & history
                </h2>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Experience level</label>
                  <select
                    className="block w-full rounded-xl bg-muted px-4 py-3 text-sm outline-none transition-all input-focus-glow border border-transparent focus:border-primary/30"
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
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Experience history</label>
                  <textarea
                    rows={4}
                    className="block w-full rounded-xl bg-muted px-4 py-3 text-sm outline-none transition-all input-focus-glow border border-transparent focus:border-primary/30 resize-none"
                    {...register("experience_history")}
                    placeholder="Summarize your recent roles, projects, or internships."
                  />
                </div>
              </section>
            )}

            {step === 4 && (
              <section className="space-y-4 animate-fade-in-up">
                <h2 className="text-base font-semibold">Interests</h2>
                <p className="text-sm text-muted-foreground">
                  What areas are you most excited to grow in?
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Engineering",
                    "Data & AI",
                    "Marketing & Comms",
                    "Operations",
                    "Design / UX",
                    "Research",
                  ].map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleArrayValue("interests", interest)}
                      className={`rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 ${
                        selectedInterests?.includes(interest)
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "bg-muted text-foreground hover:bg-accent"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {step === 5 && (
              <section className="space-y-4 animate-fade-in-up">
                <h2 className="text-base font-semibold">Career goals</h2>
                <p className="text-sm text-muted-foreground">
                  Share where you&apos;d like your career to be in the next 12–24 months.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Land my first professional role",
                    "Transition into a new discipline",
                    "Grow into senior / lead",
                    "Prepare for interviews",
                    "Explore options",
                  ].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleArrayValue("goals", goal)}
                      className={`rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 ${
                        selectedGoals?.includes(goal)
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "bg-muted text-foreground hover:bg-accent"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-8 flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              {step > 1 ? (
                <Button type="button" variant="ghost" onClick={prevStep} className="rounded-full">
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
                  className="rounded-full border-border"
                >
                  Skip
                </Button>
                {step === TOTAL_STEPS ? (
                  <Button type="submit" disabled={submitting} className="rounded-full btn-gradient px-6 font-semibold">
                    {submitting ? "Finishing..." : "Complete Setup"}
                  </Button>
                ) : (
                  <Button type="button" onClick={nextStep} className="rounded-full btn-gradient px-6 font-semibold">
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
