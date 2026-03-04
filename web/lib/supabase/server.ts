import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "../validations/env";

export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  const env = getServerEnv();

  return createServerClient(env.SUPABASE_PROJECT_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set(name, value, options);
        } catch (error) {
          // Expected error when called from a Next.js Server Component
          // Middleware handles the actual session refresh and cookie writing
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        } catch (error) {
          // Expected error when called from a Next.js Server Component
        }
      },
    },
  });
}

