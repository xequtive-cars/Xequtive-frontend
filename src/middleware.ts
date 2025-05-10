import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// IMPORTANT: Middleware runs on the edge and can only access cookies, not localStorage.
// In our current authentication system, we store the token in localStorage.
// We can only use middleware to protect dashboard routes from unauthenticated users
// based on cookies, but not to redirect authenticated users away from auth routes.

// Protected routes that require authentication
const protectedRoutes = ["/dashboard"];
// Public routes that authenticated users shouldn't access
const publicAuthRoutes = ["/auth/signin", "/auth/signup"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Get token from cookies - this requires that we also store the token in a cookie
  // when the user signs in, in addition to localStorage
  const authToken = request.cookies.get("auth-token")?.value;

  // Case 1: Protect dashboard routes from unauthenticated users
  if (protectedRoutes.some((route) => path.startsWith(route))) {
    if (!authToken) {
      // User is not authenticated, redirect to signin
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  // Case 2: Redirect authenticated users away from auth pages
  // Note: This will only work if we also set the auth-token as a cookie
  if (publicAuthRoutes.some((route) => path === route)) {
    if (authToken) {
      // User is authenticated, redirect to new booking page
      return NextResponse.redirect(
        new URL("/dashboard/new-booking", request.url)
      );
    }
  }

  // Continue with the request for all other cases
  return NextResponse.next();
}

// Configure middleware to run on both protected and public auth paths
export const config = {
  matcher: ["/dashboard/:path*", "/auth/signin", "/auth/signup"],
};
