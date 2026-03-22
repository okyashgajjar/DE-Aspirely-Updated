import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const AUTH_PATHS = ["/login", "/signup", "/onboarding", "/forgot-password", "/update-password"];
const PROTECTED_PREFIXES = [
  "/jobs",
  "/courses",
  "/analytics",
  "/chatbot",
  "/mock-interview",
  "/profile",
  "/settings",
  "/logout",
  "/dashboard",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public auth-related paths and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthRoute = AUTH_PATHS.some((path) => pathname.startsWith(path));

  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && user && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

