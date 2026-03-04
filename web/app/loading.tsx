export default function RootLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <div className="h-3 w-3 animate-pulse rounded-full bg-accent" />
        <span>Loading Aspirely…</span>
      </div>
    </main>
  );
}

