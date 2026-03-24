import { NextResponse, type NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

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

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const session = await auth();
  const user = session?.user;

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)" ],
};
