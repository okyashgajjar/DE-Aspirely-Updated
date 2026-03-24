import { auth } from "@/lib/auth";

/**
 * Gets the authenticated user ID from the NextAuth.js session (server-side).
 * Returns null if not authenticated.
 */
export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/**
 * Gets the full session user object (id, email, name).
 * Returns null if not authenticated.
 */
export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user as { id: string; email: string; name?: string | null };
}
