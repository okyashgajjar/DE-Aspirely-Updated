import { NextResponse, type NextRequest } from "next/server";
const AUTH_PATHS = ["/login", "/signup", "/onboarding"];
const PROTECTED_PREFIXES = [
  "/jobs",
  "/courses",
  "/analytics",
  "/chatbot",
  "/mock-interview",
  "/profile",
  "/settings",
  "/logout",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public auth-related paths and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthRoute = AUTH_PATHS.some((path) => pathname.startsWith(path));

  // Supabase SSR stores the session in a cookie named sb-<project-ref>-auth-token
  const hasSession = request.cookies.getAll().some(
    (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"),
  );

  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && hasSession && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

