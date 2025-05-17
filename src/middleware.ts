import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This middleware handles redirects based on authentication status.
// It reads the authentication token from cookies (set by the backend)
// and redirects users accordingly to ensure proper access control.
// All authentication tokens are stored in secure HTTP-only cookies.

// Protected routes that require authentication
const protectedRoutes = ["/dashboard"];
// Public routes that authenticated users shouldn't access
const publicAuthRoutes = ["/auth/signin", "/auth/signup"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check for authentication cookies - try multiple possible names
  // Different APIs might use different cookie names
  const possibleCookieNames = ["token", "auth-token", "authToken", "session"];
  let isAuthenticated = false;

  // Check if any of the possible auth cookies exist
  for (const cookieName of possibleCookieNames) {
    if (request.cookies.get(cookieName)?.value) {
      isAuthenticated = true;
      break;
    }
  }

  // Case 1: Protect dashboard routes from unauthenticated users
  if (protectedRoutes.some((route) => path.startsWith(route))) {
    if (!isAuthenticated) {
      // Check if we're already in the process of redirecting
      const isRedirecting = request.nextUrl.searchParams.get("redirecting");
      if (isRedirecting) {
        // Avoid infinite redirect loop
        return NextResponse.next();
      }

      // User is not authenticated, redirect to signin
      const url = new URL("/auth/signin", request.url);
      url.searchParams.set("returnUrl", path);
      url.searchParams.set("redirecting", "true");
      return NextResponse.redirect(url);
    }
  }

  // Case 2: Redirect authenticated users away from auth pages
  if (publicAuthRoutes.some((route) => path === route)) {
    if (isAuthenticated) {
      // Check if we're already in the process of redirecting
      const isRedirecting = request.nextUrl.searchParams.get("redirecting");
      if (isRedirecting) {
        // Avoid infinite redirect loop
        return NextResponse.next();
      }

      // User is authenticated, redirect to dashboard
      const url = new URL("/dashboard", request.url);
      url.searchParams.set("redirecting", "true");
      return NextResponse.redirect(url);
    }
  }

  // Continue with the request for all other cases
  return NextResponse.next();
}

// Configure middleware to run on both protected and public auth paths
export const config = {
  matcher: ["/dashboard/:path*", "/auth/signin", "/auth/signup"],
};
