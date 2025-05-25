"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// ProtectedRoute ensures pages are only accessible to authenticated users
// It works with middleware to provide a double layer of protection
export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const [checked, setChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only perform the check once loading is complete
    if (!isLoading) {
      if (!isAuthenticated) {
        // User is not authenticated, redirect to sign in
        // Store the current path to redirect back after login
        // Use router.push instead of window.location to avoid hard reloads
        if (!pathname.includes("?redirecting=true")) {
          const returnUrl = encodeURIComponent(pathname);
          router.push(`/auth/signin?returnUrl=${returnUrl}&redirecting=true`);
        }
      } else {
        // User is authenticated, mark as checked to render children
        setChecked(true);
      }
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // Show loading state while authentication is being checked
  if (isLoading || (!checked && !isAuthenticated)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only render children if authenticated and check is complete
  return isAuthenticated && checked ? children : null;
}
