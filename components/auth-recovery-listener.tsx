"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthRecoveryListener() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // If the URL has an implicit grant #access_token=...&type=recovery
      // Supabase parses it and fires PASSWORD_RECOVERY automatically.
      if (event === "PASSWORD_RECOVERY") {
        router.push("/update-password");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null; // This component is invisible
}
