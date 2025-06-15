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
// Special routes that need authentication but don't redirect authenticated users
const specialAuthRoutes = ["/auth/complete-profile"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check for authentication cookie - API uses "token" as per documentation
  const authCookie = request.cookies.get("token");
  const isAuthenticated = !!authCookie?.value;

  // Case 1: Protect dashboard routes from unauthenticated users
  if (protectedRoutes.some((route) => path.startsWith(route))) {
    if (!isAuthenticated) {
      // Check if we're already in the process of redirecting or already on signin
      const isRedirecting = request.nextUrl.searchParams.get("redirecting");
      if (isRedirecting || path.startsWith("/auth/")) {
        // Avoid infinite redirect loop
        return NextResponse.next();
      }

      // User is not authenticated, redirect to signin
      const url = new URL("/auth/signin", request.url);
      url.searchParams.set("returnUrl", path);
      return NextResponse.redirect(url);
    }
  }

  // Case 1b: Protect special auth routes from unauthenticated users
  if (specialAuthRoutes.some((route) => path.startsWith(route))) {
    if (!isAuthenticated) {
      // Check if we're already in the process of redirecting or already on signin
      const isRedirecting = request.nextUrl.searchParams.get("redirecting");
      if (isRedirecting || path.startsWith("/auth/signin")) {
        // Avoid infinite redirect loop
        return NextResponse.next();
      }

      // User is not authenticated, redirect to signin
      const url = new URL("/auth/signin", request.url);
      url.searchParams.set("returnUrl", path);
      return NextResponse.redirect(url);
    }
  }

  // Case 2: Redirect authenticated users away from auth pages
  if (publicAuthRoutes.some((route) => path === route)) {
    if (isAuthenticated) {
      // Check if we're already in the process of redirecting or already on dashboard
      const isRedirecting = request.nextUrl.searchParams.get("redirecting");
      if (isRedirecting || path.startsWith("/dashboard")) {
        // Avoid infinite redirect loop
        return NextResponse.next();
      }

      // User is authenticated, redirect to dashboard
      const url = new URL("/dashboard", request.url);
      return NextResponse.redirect(url);
    }
  }

  // Continue with the request for all other cases
  return NextResponse.next();
}

// Configure middleware to run on both protected and public auth paths
export const config = {
  matcher: ["/dashboard/:path*", "/auth/signin", "/auth/signup", "/auth/complete-profile"],
};
