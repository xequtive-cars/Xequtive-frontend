"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useAuthLoading } from "@/contexts/AuthLoadingContext";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// PublicRoute is for auth pages that should not be accessible when logged in
// It works with the middleware to ensure users are redirected properly
export default function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { showLoading, hideLoading } = useAuthLoading();
  const [checked, setChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only perform the check once loading is complete
    if (!isLoading) {
      if (isAuthenticated) {
        // User is authenticated, they shouldn't access auth pages
        // Instead of an immediate redirect, we use router.push to avoid loops
        // We also check we're not already redirecting to avoid infinite loops
        if (!pathname.includes("?redirecting=true")) {
          showLoading("redirecting");
          router.push("/dashboard?redirecting=true");
        }
      } else {
        // User is not authenticated, mark as checked to render children
        setChecked(true);
        hideLoading();
      }
    } else {
      // Show checking state while loading
      showLoading("checking");
    }
  }, [isLoading, isAuthenticated, router, pathname, showLoading, hideLoading]);

  // Don't render anything while loading states are active - the unified loading will handle it
  if (isLoading || (!checked && isAuthenticated)) {
    return null;
  }

  // Only render children if not authenticated and check is complete
  return !isAuthenticated || !checked ? children : null;
}
