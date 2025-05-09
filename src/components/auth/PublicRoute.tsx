"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

// PublicRoute is now a backup security layer after middleware
// Middleware does the initial check via cookies, this does a more thorough check
export default function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Only perform the check once loading is complete
    if (!isLoading) {
      if (isAuthenticated) {
        // User is authenticated, middleware should have redirected already
        // This is a backup in case middleware fails or is bypassed
        window.location.href = "/dashboard";
      } else {
        // User is not authenticated, mark as checked to render children
        setChecked(true);
      }
    }
  }, [isLoading, isAuthenticated]);

  // Show loading state while authentication is being checked
  if (isLoading || !checked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only render children if not authenticated and check is complete
  return !isAuthenticated ? children : null;
}
