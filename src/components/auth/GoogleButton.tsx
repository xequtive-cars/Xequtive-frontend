"use client";

import React from "react";
import { cn } from "@/lib/utils";
import GoogleIcon from "@/components/ui/icons/GoogleIcon";
import { authService } from "@/lib/auth";

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
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Use the built-in auth service method if no custom onClick is provided
      authService.initiateGoogleAuth();
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "w-full h-10 flex items-center justify-center gap-3 rounded-lg text-sm font-medium",
          "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700",
          "transition-colors duration-200 border border-gray-300 dark:border-gray-700",
          className
        )}
      >
        <GoogleIcon className="h-4 w-4" />
        <span>
          {type === "signin" ? "Sign in with Google" : "Sign up with Google"}
        </span>
      </button>
    </div>
  );
};

export default GoogleButton;
