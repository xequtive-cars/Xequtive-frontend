"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { Loading3D } from "@/components/ui/loading-3d";

interface ClientProtectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Client-side protection component that redirects unauthenticated users
 * This works as a backup to middleware protection and handles cases where
 * middleware can't read cookies properly (e.g., cross-domain issues)
 */
export function ClientProtection({ children, fallback }: ClientProtectionProps) {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if auth is fully initialized and user is not authenticated
    if (isInitialized && !isLoading && !isAuthenticated) {
      console.log("[ClientProtection] User not authenticated, redirecting to signin");
      
      // Redirect to signin with return URL
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/auth/signin?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, isLoading, isInitialized, router, pathname]);

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

  // Show loading if user is not authenticated (during redirect)
  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] space-y-4">
          <Loading3D size="lg" message="Redirecting to sign in..." />
        </div>
      )
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
} 