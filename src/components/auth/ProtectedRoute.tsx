"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loading3DOverlay } from "@/components/ui/loading-3d";

// ProtectedRoute ensures pages are only accessible to authenticated users
// It works with middleware to provide a double layer of protection
export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const [checked, setChecked] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only perform the check once auth is initialized and not loading
    if (isInitialized && !isLoading) {
      if (!isAuthenticated) {
        // User is not authenticated, redirect to sign in
        // Store the current path to redirect back after login
        if (!pathname.includes("?redirecting=true") && 
            !isRedirecting && 
            !pathname.startsWith("/auth/")) {
          setIsRedirecting(true);
          const returnUrl = encodeURIComponent(pathname);
          
          // Add a small delay to prevent immediate redirect loops
          setTimeout(() => {
            router.push(`/auth/signin?returnUrl=${returnUrl}&redirecting=true`);
          }, 100);
        }
      } else {
        // User is authenticated, mark as checked to render children
        setChecked(true);
        setIsRedirecting(false);
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, router, pathname, isRedirecting]);

  // Show beautiful loading state while authentication is being checked or redirecting
  if (isLoading || !isInitialized || isRedirecting || (!checked && !isAuthenticated)) {
    return (
      <Loading3DOverlay 
        message={
          isRedirecting 
            ? "Redirecting..." 
            : isLoading 
            ? "Checking authentication..." 
            : "Loading..."
        } 
      />
    );
  }

  // Only render children if authenticated and check is complete
  return isAuthenticated && checked ? children : null;
}
