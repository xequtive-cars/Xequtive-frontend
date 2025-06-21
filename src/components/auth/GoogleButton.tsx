"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import GoogleIcon from "@/components/ui/icons/GoogleIcon";
import { getApiBaseUrl } from "@/lib/env-validation";

interface GoogleButtonProps {
  onClick?: () => void;
  type: "signin" | "signup";
  className?: string;
}

export const GoogleButton = ({
  onClick,
  type,
  className,
}: GoogleButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    if (onClick) {
      onClick();
      return;
    }

    try {
      setIsLoading(true);
      
      // Get the API base URL from environment variables
      const apiUrl = getApiBaseUrl();
      
      // Get the current frontend URL for the redirect callback
      const frontendUrl = window.location.origin;
      const redirectUrl = `${frontendUrl}/auth/callback`;
      
      // Redirect to backend's Google OAuth initiation endpoint
      // This will redirect the user to Google's OAuth page
      window.location.href = `${apiUrl}/api/auth/google/login?redirect_url=${encodeURIComponent(redirectUrl)}`;
      
    } catch (error) {
      console.error("Google auth error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={isLoading}
        className={cn(
          "w-full h-10 flex items-center justify-center gap-3 rounded-lg text-sm font-medium",
          "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700",
          "transition-colors duration-200 border border-gray-300 dark:border-gray-700",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>
              Redirecting to Google...
            </span>
          </>
        ) : (
          <>
        <GoogleIcon className="h-4 w-4" />
        <span>
          {type === "signin" ? "Sign in with Google" : "Sign up with Google"}
        </span>
          </>
        )}
      </button>
    </div>
  );
};

export default GoogleButton;
