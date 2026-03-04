"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="max-w-md rounded-xl border border-border bg-background/80 p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-500">
            An unexpected error occurred in Aspirely. You can try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
          >
            Try again
          </button>
          {process.env.NODE_ENV === "development" && error?.message && (
            <p className="mt-3 text-xs text-slate-500">{error.message}</p>
          )}
        </div>
      </body>
    </html>
  );
}

