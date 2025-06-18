"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useAuthLoading } from "@/contexts/AuthLoadingContext";
import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// ProtectedRoute ensures pages are only accessible to authenticated users
// It works with middleware to provide a double layer of protection
export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const { showLoading, hideLoading } = useAuthLoading();
  const [checked, setChecked] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [middlewareBypass, setMiddlewareBypass] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Check if middleware has already verified authentication
  useEffect(() => {
    // If we're on a protected route and the page loaded successfully,
    // it means middleware verified the token cookie exists
    const isProtectedRoute = pathname.startsWith("/dashboard");
    const hasRedirectingParam = searchParams.get("redirecting") === "true";
    
    if (isProtectedRoute && !hasRedirectingParam) {
      // Middleware allowed this request, so user must be authenticated
      // Set a short timeout to allow auth context to catch up
      const middlewareTimeout = setTimeout(() => {
        if (!isInitialized || (!isAuthenticated && !isRedirecting)) {
                     setMiddlewareBypass(true);
          setChecked(true);
          hideLoading();
        }
      }, 2000); // 2 second grace period for auth context

      return () => clearTimeout(middlewareTimeout);
    }
  }, [pathname, searchParams, isInitialized, isAuthenticated, isRedirecting, hideLoading]);

  // Timeout mechanism to prevent infinite waiting
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isInitialized || (!isAuthenticated && !isRedirecting)) {
        setTimeoutReached(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [isInitialized, isAuthenticated, isRedirecting]);

  useEffect(() => {
    // CRITICAL: Only evaluate auth state after initialization is complete
    if (!isInitialized && !timeoutReached && !middlewareBypass) {
      // Still initializing - show loading
      showLoading("checking");
      return;
    }

    // Mark that we've evaluated at least once after initialization
    if (!hasEvaluated) {
      setHasEvaluated(true);
    }

    // Now we can safely evaluate authentication state
    if (!isLoading || timeoutReached || middlewareBypass) {
      if (!isAuthenticated && !middlewareBypass) {
        // User is not authenticated, redirect to sign in
        const hasRedirectingParam = pathname.includes("redirecting=true") || window.location.search.includes("redirecting=true");
        const isOnAuthPage = pathname.startsWith("/auth/");
        
        if (!hasRedirectingParam && !isRedirecting && !isOnAuthPage) {
          setIsRedirecting(true);
          showLoading("redirecting");
          const returnUrl = encodeURIComponent(pathname);
          
          // Add a small delay to prevent immediate redirect loops
          setTimeout(() => {
            router.push(`/auth/signin?returnUrl=${returnUrl}&redirecting=true`);
          }, 100);
        }
      } else {
        // User is authenticated or middleware bypass is active, mark as checked to render children
        setChecked(true);
        setIsRedirecting(false);
        hideLoading();
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, router, pathname, isRedirecting, showLoading, hideLoading, hasEvaluated, timeoutReached, middlewareBypass]);

  // Additional effect to handle authentication state changes during navigation
  useEffect(() => {
    // If we're authenticated and initialized, ensure we're marked as checked
    if (isAuthenticated && isInitialized && !isLoading && !checked && hasEvaluated) {
      setChecked(true);
      setIsRedirecting(false);
      hideLoading();
    }
  }, [isAuthenticated, isInitialized, isLoading, checked, hideLoading, hasEvaluated]);

  // IMPROVED: More specific loading/rendering logic
  
  // 1. Still initializing auth context and timeout not reached and no middleware bypass - wait
  if (!isInitialized && !timeoutReached && !middlewareBypass) {
    return null;
  }

  // 2. Auth initialized but still loading and timeout not reached and no middleware bypass - wait
  if (isLoading && !timeoutReached && !middlewareBypass) {
    return null;
  }

  // 3. Currently redirecting - wait
  if (isRedirecting) {
    return null;
  }

  // 4. Not authenticated after full initialization or timeout, and no middleware bypass - should be redirecting
  if (!isAuthenticated && !middlewareBypass) {
    return null;
  }

  // 5. Authenticated but haven't completed the check process and no middleware bypass - wait a moment
  if (!checked && !middlewareBypass) {
    return null;
  }

  // 6. All checks passed or middleware bypass is active - render children
  return children;
}
