"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useAuthLoading } from "@/contexts/AuthLoadingContext";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

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
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("🛡️ ProtectedRoute - Auth state:", { isInitialized, isLoading, isAuthenticated, pathname });
    
    // Only perform the check once auth is initialized and not loading
    if (isInitialized && !isLoading) {
      if (!isAuthenticated) {
        console.log("🛡️ ProtectedRoute - User not authenticated, redirecting to signin");
        // User is not authenticated, redirect to sign in
        // Store the current path to redirect back after login
        if (!pathname.includes("?redirecting=true") && 
            !isRedirecting && 
            !pathname.startsWith("/auth/")) {
          setIsRedirecting(true);
          showLoading("redirecting");
          const returnUrl = encodeURIComponent(pathname);
          
          // Add a small delay to prevent immediate redirect loops
          setTimeout(() => {
          router.push(`/auth/signin?returnUrl=${returnUrl}&redirecting=true`);
          }, 100);
        }
      } else {
        console.log("🛡️ ProtectedRoute - User authenticated, allowing access");
        // User is authenticated, mark as checked to render children
        setChecked(true);
        setIsRedirecting(false);
        hideLoading();
      }
    } else if (isLoading || !isInitialized) {
      console.log("🛡️ ProtectedRoute - Still loading or not initialized");
      // Show checking authentication state
      showLoading("checking");
    }
  }, [isInitialized, isLoading, isAuthenticated, router, pathname, isRedirecting, showLoading, hideLoading]);

  // Don't render anything while loading states are active - the unified loading will handle it
  if (isLoading || !isInitialized || isRedirecting || (!checked && !isAuthenticated)) {
    return null;
  }

  // Only render children if authenticated and check is complete
  return isAuthenticated && checked ? children : null;
}
