"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  User,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";

// Check if we're in the browser environment
const isBrowser = typeof window !== "undefined";

// Skeleton component for auth-dependent navigation
function AuthNavigationSkeleton() {
  return (
    <nav className="flex items-center gap-5">
      <ThemeToggle />
      <div className="w-12 h-4 bg-muted animate-pulse rounded"></div>
      <div className="w-16 h-10 bg-muted animate-pulse rounded"></div>
    </nav>
  );
}

// Authenticated user navigation
function AuthenticatedNavigation() {
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(false);
    };

    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownOpen]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="flex items-center gap-5">
      <ThemeToggle />
      
      {/* User profile dropdown */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className="h-8 md:h-10 px-2 md:px-4 rounded-md flex items-center gap-1 md:gap-2"
          onClick={toggleDropdown}
        >
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-4 w-4" />
          </div>
          <span className="font-medium text-sm hidden md:block">
            {user?.displayName ||
              user?.email?.split("@")[0] ||
              "Account"}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-background border border-border z-50">
            <div className="p-4 border-b border-border">
              <p className="font-medium">
                {user?.displayName || "User"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.email}
              </p>
            </div>
            <div className="py-2">
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Account Settings
              </Link>
              <button
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors w-full text-left text-destructive"
                onClick={() => {
                  signOut();
                  setDropdownOpen(false);
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Unauthenticated user navigation
function UnauthenticatedNavigation() {
  return (
    <nav className="flex items-center gap-5">
      <ThemeToggle />
      
      {/* Show sign in/up for unauthenticated users */}
      <Link
        href="/auth/signin"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Sign In
      </Link>
      <Link href="/auth/signup">
        <Button
          variant="default"
          size="sm"
          className="h-10 px-4 rounded-md"
        >
          Sign Up
        </Button>
      </Link>
    </nav>
  );
}

// Main auth-aware navigation component with SSR protection
export function AuthAwareNavigation() {
  const [mounted, setMounted] = useState(false);

  // Track if component has mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR or before hydration, show the unauthenticated navigation
  if (!isBrowser || !mounted) {
    return <UnauthenticatedNavigation />;
  }

  // Only use auth context after component has mounted on client
  return <AuthAwareNavigationClient />;
}

// Client-only component that uses auth context
function AuthAwareNavigationClient() {
  const { isAuthenticated, isInitialized } = useAuth();

  // Show skeleton while auth is being determined
  if (!isInitialized) {
    return <AuthNavigationSkeleton />;
  }

  // Show appropriate navigation based on auth state
  return isAuthenticated ? <AuthenticatedNavigation /> : <UnauthenticatedNavigation />;
} 