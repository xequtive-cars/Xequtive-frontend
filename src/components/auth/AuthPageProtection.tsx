"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Loading3D } from "@/components/ui/loading-3d";

interface AuthPageProtectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Auth page protection component that redirects authenticated users to dashboard
 * This prevents authenticated users from accessing signin/signup pages
 */
export function AuthPageProtection({ children, fallback }: AuthPageProtectionProps) {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only redirect if auth is fully initialized and user is authenticated
    if (isInitialized && !isLoading && isAuthenticated) {
      console.log("[AuthPageProtection] User is authenticated, redirecting to dashboard");
      
      // Check if there's a returnUrl parameter, otherwise go to dashboard
      const returnUrl = searchParams.get("returnUrl");
      const destination = returnUrl ? decodeURIComponent(returnUrl) : "/dashboard";
      
      router.replace(destination);
    }
  }, [isAuthenticated, isLoading, isInitialized, router, searchParams]);

  // Show loading while auth is being checked
  if (!isInitialized || isLoading) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] space-y-4">
          <Loading3D size="lg" message="Checking authentication..." />
        </div>
      )
    );
  }

  // Show loading if user is authenticated (during redirect)
  if (isAuthenticated) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] space-y-4">
          <Loading3D size="lg" message="Redirecting to dashboard..." />
        </div>
      )
    );
  }

  // User is not authenticated, render auth page
  return <>{children}</>;
} 