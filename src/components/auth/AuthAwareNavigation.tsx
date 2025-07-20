"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  User,
  ChevronDown,
  Settings,
  LogOut,
  Menu,
  Home,
  Plus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Check if we're in the browser environment
const isBrowser = typeof window !== "undefined";

// Helper function to check if profile is incomplete
function isProfileIncomplete(user: any): boolean {
  if (!user) return false;
  
  // Check if name or phone is missing or empty
  const hasName = user.displayName && user.displayName.trim() !== "";
  const hasPhone = user.phoneNumber && user.phoneNumber.trim() !== "";
  
  // Profile is incomplete if either name or phone is missing
  return !hasName || !hasPhone;
}

// Skeleton component for auth-dependent navigation
function AuthNavigationSkeleton() {
  return (
    <nav className="flex items-center gap-2 md:gap-5">
      <div className="md:hidden">
        <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
      </div>
      <div className="hidden md:flex items-center gap-5">
        <ThemeToggle />
        <div className="w-12 h-4 bg-muted animate-pulse rounded"></div>
        <div className="w-16 h-10 bg-muted animate-pulse rounded"></div>
      </div>
    </nav>
  );
}

// Mobile menu content component
function MobileMenuContent({ 
  isAuthenticated, 
  user, 
  signOut,
  onClose
}: { 
  isAuthenticated: boolean; 
  user: any; 
  signOut: () => void;
  onClose: () => void;
}) {
  const profileIncomplete = isProfileIncomplete(user);

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="text-left p-6 border-b">
        <SheetTitle>Menu</SheetTitle>
        <SheetDescription>
          Navigate through the application
        </SheetDescription>
      </SheetHeader>
      
      <div className="flex-1 p-6 space-y-6">
        {/* Theme toggle - moved to top */}
        <div className="flex items-center justify-between pb-4 border-b">
          <span className="text-sm font-medium">Theme</span>
          <ThemeToggle />
        </div>
        
        {isAuthenticated ? (
          <>
            {/* User info */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {user?.displayName || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                  {profileIncomplete && (
                    <p className="text-xs text-amber-600 font-medium">
                      Profile incomplete
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Navigation links */}
            <div className="space-y-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                onClick={onClose}
              >
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Dashboard</span>
              </Link>
              <Link
                href="/dashboard/new-booking"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                onClick={onClose}
              >
                <Plus className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">New Booking</span>
              </Link>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors relative"
                onClick={onClose}
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Account Settings</span>
                {profileIncomplete && (
                  <div className="w-2 h-2 bg-red-500 rounded-full ml-auto"></div>
                )}
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Unauthenticated menu */}
            <div className="space-y-2">
              <Link
                href="/auth/signin"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                onClick={onClose}
              >
                <span className="text-sm font-medium">Sign In</span>
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                onClick={onClose}
              >
                <span className="text-sm font-medium">Sign Up</span>
              </Link>
            </div>
          </>
        )}
      </div>
      
      {/* Bottom section */}
      <div className="p-6 border-t space-y-4">
        {/* Sign out for authenticated users */}
        {isAuthenticated && (
          <button
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors w-full text-left text-destructive"
            onClick={() => {
              signOut();
              onClose();
            }}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Unauthenticated user navigation
function UnauthenticatedNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="flex items-center gap-2 md:gap-5">
      {/* Mobile menu */}
      <div className="md:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-12 w-12 p-1 hover:bg-muted"
            >
              <Menu className="h-10 w-10 text-foreground" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[300px] p-0">
            <MobileMenuContent
              isAuthenticated={false}
              user={null}
              signOut={() => {}}
              onClose={() => setMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop navigation */}
      <div className="hidden md:flex items-center gap-5">
        <ThemeToggle />
        <Link href="/auth/signin">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="/auth/signup">
          <Button size="sm">
            Sign Up
          </Button>
        </Link>
      </div>
    </nav>
  );
}

// Authenticated user navigation
function AuthenticatedNavigation() {
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if profile is incomplete
  const profileIncomplete = isProfileIncomplete(user);

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
    <nav className="flex items-center gap-2 md:gap-4">
      {/* Mobile menu */}
      <div className="md:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-12 w-12 p-1 hover:bg-muted relative"
            >
              <Menu className="h-10 w-10 text-foreground" />
              {profileIncomplete && (
                <div className="absolute -top-[0.2px] -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-background"></div>
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[300px] p-0">
            <MobileMenuContent
              isAuthenticated={true}
              user={user}
              signOut={signOut}
              onClose={() => setMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop navigation */}
      <div className="hidden md:flex items-center gap-4">
        <ThemeToggle />
        
        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary relative">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "X"}
                </span>
              )}
              {profileIncomplete && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background"></div>
              )}
            </div>
            <span className="text-sm font-medium hidden lg:inline">
              {user?.displayName || "User"}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Desktop dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {user?.displayName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                    {profileIncomplete && (
                      <p className="text-xs text-amber-600 font-medium">
                        Profile incomplete
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Home className="h-4 w-4 text-muted-foreground" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/new-booking"
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                  New Booking
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors relative"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Account Settings
                  {profileIncomplete && (
                    <div className="w-2 h-2 bg-red-500 rounded-full ml-auto"></div>
                  )}
                </Link>
                
                <div className="border-t my-2"></div>
                
                <button
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors w-full text-left text-destructive"
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
      </div>
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