import Link from "next/link";

export default function Global500() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
          500
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Internal server error
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Aspirely encountered an unexpected error. Please try again in a
          moment.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}

