import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// TEMPORARY PRODUCTION FIX: Simplified middleware to resolve cookie access issues
// This middleware provides basic protection while we resolve the cookie domain/path issues
// The AuthContext will handle the actual authentication verification

// Protected routes that require authentication
const protectedRoutes = ["/dashboard"];
// Public routes that authenticated users shouldn't access
const publicAuthRoutes = ["/auth/signin", "/auth/signup"];
// Special routes that need authentication but don't redirect authenticated users
const specialAuthRoutes = ["/auth/complete-profile"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check for authentication cookie - try multiple possible cookie names
  const tokenCookie = request.cookies.get("token");
  const authCookie = request.cookies.get("auth");
  const sessionCookie = request.cookies.get("session");
  
  // Check if any authentication cookie exists
  const hasAuthCookie = !!(tokenCookie?.value || authCookie?.value || sessionCookie?.value);
  
  // TEMPORARY: More lenient approach for production
  // If we're in production and can't read cookies properly, allow access
  // The AuthContext will handle the actual protection
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Debug logging for production issues
  if (isProduction) {
    console.log(`[Middleware] Path: ${path}`);
    console.log(`[Middleware] Domain: ${request.nextUrl.hostname}`);
    console.log(`[Middleware] All cookies:`, Array.from(request.cookies).map(([name, cookie]) => ({ 
      name, 
      hasValue: !!cookie.value, 
      valueLength: cookie.value?.length || 0
    })));
    console.log(`[Middleware] Token cookie:`, tokenCookie ? { 
      name: tokenCookie.name, 
      hasValue: !!tokenCookie.value, 
      valueLength: tokenCookie.value?.length 
    } : 'NOT_FOUND');
    console.log(`[Middleware] Has auth cookie:`, hasAuthCookie);
  }

  // TEMPORARY PRODUCTION FIX: Skip middleware protection in production
  // Let AuthContext handle the protection instead
  if (isProduction) {
    console.log(`[Middleware] Production mode: Allowing request, AuthContext will handle protection`);
    return NextResponse.next();
  }

  // Case 1: Protect dashboard routes from unauthenticated users (LOCAL ONLY)
  if (protectedRoutes.some((route) => path.startsWith(route))) {
    console.log(`[Middleware] Protected route detected: ${path}`);
    
    if (!hasAuthCookie) {
      console.log(`[Middleware] User not authenticated, redirecting to signin`);
      
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
    } else {
      console.log(`[Middleware] User authenticated, allowing access to ${path}`);
    }
  }

  // Case 1b: Protect special auth routes from unauthenticated users (LOCAL ONLY)
  if (specialAuthRoutes.some((route) => path.startsWith(route))) {
    if (!hasAuthCookie) {
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

  // Case 2: Redirect authenticated users away from auth pages (LOCAL ONLY)
  if (publicAuthRoutes.some((route) => path === route)) {
    if (hasAuthCookie) {
      console.log(`[Middleware] Authenticated user accessing auth page, redirecting to dashboard`);
      
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
