"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutClient() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function run() {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
        if (!mounted) return;
        router.push("/login");
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to logout");
      }
    }
    void run();
    return () => {
      mounted = false;
    };
  }, [router]);

  if (!error) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Couldn&apos;t sign you out</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{error}</p>
      </CardContent>
    </Card>
  );
}
