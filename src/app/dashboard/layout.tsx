"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthLoading } from "@/contexts/AuthLoadingContext";
import { User, LogOut, ChevronDown, Settings } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Loading3DOverlay } from "@/components/ui/loading-3d";

// Helper function to check if profile is incomplete
function isProfileIncomplete(user: any): boolean {
  if (!user) return false;
  
  // Check if name or phone is missing or empty
  const hasName = user.displayName && user.displayName.trim() !== "";
  const hasPhone = user.phoneNumber && user.phoneNumber.trim() !== "";
  
  // Profile is incomplete if either name or phone is missing
  return !hasName || !hasPhone;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuth();
  const { showLoading, hideLoading } = useAuthLoading();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check if profile is incomplete
  const profileIncomplete = isProfileIncomplete(user);

  // Check if the current path is a booking flow path
  const isBookingFlow = pathname?.includes("/new-booking");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (isLoading) {
      showLoading("loading-dashboard");
    } else {
      hideLoading();
    }
  }, [isLoading, mounted, showLoading, hideLoading]);

  const handleSignOut = async () => {
    try {
      await signOut(); // This will now handle everything including the redirect
    } catch (error) {
      console.error("Dashboard: Error during sign out:", error);
      window.location.href = "/";
    }
  };

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
    e.stopPropagation(); // Prevent the document click from immediately closing the dropdown
    setDropdownOpen(!dropdownOpen);
  };

  // Don't render anything while loading - the unified loading will handle it
  if (!mounted || isLoading) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center space-x-2">
                <div className="relative w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <span className="font-bold text-base">X</span>
                </div>
                <span className="font-bold text-xl tracking-tight">
                  Xequtive
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 md:h-9 px-2 md:px-3 rounded-md flex items-center gap-1 md:gap-2 shadow-premium relative"
                  onClick={toggleDropdown}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium text-xs hidden md:block">
                    {user?.displayName ||
                      user?.email?.split("@")[0] ||
                      "Account"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  
                  {/* Notification dot for incomplete profile */}
                  {profileIncomplete && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background"></div>
                  )}
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
                      {profileIncomplete && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">
                          Profile incomplete
                        </p>
                      )}
                    </div>
                    <div className="py-2">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors relative"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        Account Settings
                        {/* Notification dot for account settings */}
                        {profileIncomplete && (
                          <div className="w-2 h-2 bg-red-500 rounded-full ml-auto"></div>
                        )}
                      </Link>
                      <button
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors w-full text-left text-destructive"
                        onClick={() => {
                          handleSignOut();
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
            </div>
          </div>
        </header>

        <div className="flex-1">
          <div className="container py-3">
            <main className="pb-8">{children}</main>
          </div>
        </div>

        {/* Footer is conditionally rendered - hidden in booking flow */}
        {!isBookingFlow && (
          <footer className="border-t py-6">
            <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Xequtive. All rights reserved.
              </p>
            </div>
          </footer>
        )}
      </div>
    </ProtectedRoute>
  );
}
