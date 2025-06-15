/**
 * Auth Context Provider
 * Handles authentication state management with secure HTTP-only cookies
 * Implements proper caching and rate limiting protection
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { getApiBaseUrl } from "@/lib/env-validation";

// Check if we're in the browser environment
const isBrowser = typeof window !== "undefined";

// Cache configuration
const USER_SESSION_CACHE_KEY = 'xequtive_user_session';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const MIN_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes minimum between checks

// Simple user type matching our service
interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: string;
  phoneNumber?: string;
  photoURL?: string;
  authProvider?: string;
}

// Cached user interface
interface CachedUserData {
  user: AuthUser | null;
  timestamp: number;
  isAuthenticated: boolean;
}

// Auth context type with improved loading states
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  signOut: () => Promise<void>;
  checkAuthStatus: (force?: boolean) => Promise<boolean>;
}

// Cache management functions
function getCachedUser(): CachedUserData | null {
  if (!isBrowser) return null;
  
  try {
    const cached = localStorage.getItem(USER_SESSION_CACHE_KEY);
    if (cached) {
      const data: CachedUserData = JSON.parse(cached);
      if (Date.now() - data.timestamp < CACHE_DURATION) {
        return data;
      }
      // Clear expired cache
      localStorage.removeItem(USER_SESSION_CACHE_KEY);
    }
  } catch (error) {
    console.warn("Failed to read user cache:", error);
    localStorage.removeItem(USER_SESSION_CACHE_KEY);
  }
  return null;
}

function setCachedUser(user: AuthUser | null, isAuthenticated: boolean): void {
  if (!isBrowser) return;
  
  try {
    const cacheData: CachedUserData = {
      user,
      timestamp: Date.now(),
      isAuthenticated
    };
    localStorage.setItem(USER_SESSION_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn("Failed to cache user data:", error);
  }
}

function clearCachedUser(): void {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem(USER_SESSION_CACHE_KEY);
  } catch (error) {
    console.warn("Failed to clear user cache:", error);
  }
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,
  signOut: async () => {},
  checkAuthStatus: async () => false,
});

// Auth provider component with proper caching and rate limiting
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State for user and loading status
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(!isBrowser);
  
  // Rate limiting
  const lastCheckRef = useRef<number>(0);
  const checkInProgressRef = useRef<boolean>(false);

  // Function to check authentication status with caching and rate limiting
  const checkAuthStatus = useCallback(async (force: boolean = false): Promise<boolean> => {
    try {
      if (!isBrowser) {
        setIsInitialized(true);
        return false;
      }

      const now = Date.now();
      
      // Rate limiting: don't check more than once every 5 minutes unless forced
      if (!force && (now - lastCheckRef.current) < MIN_CHECK_INTERVAL) {
        console.log("🔍 AuthContext - Rate limited, using existing state");
        return isAuthenticated;
      }

      // Prevent concurrent checks
      if (checkInProgressRef.current && !force) {
        console.log("🔍 AuthContext - Check already in progress");
        return isAuthenticated;
      }

      // Try to use cached data first (unless forced)
      if (!force) {
        const cached = getCachedUser();
        if (cached) {
          console.log("🔍 AuthContext - Using cached user data");
          setUser(cached.user);
          setIsAuthenticated(cached.isAuthenticated);
          setIsLoading(false);
          setIsInitialized(true);
          return cached.isAuthenticated;
        }
      }

      checkInProgressRef.current = true;
      
      // Only set loading if this is not the initial check or if forced
      if (isInitialized || force) {
        setIsLoading(true);
      }

      console.log("🔍 AuthContext - Making API call to check auth status...");
      const apiUrl = getApiBaseUrl();
      
      // Add request timeout and retry logic for rate limiting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        lastCheckRef.current = now;

        console.log("🔍 AuthContext - Response status:", response.status);

        if (response.status === 429) {
          console.warn("🔍 AuthContext - Rate limited by server. Using cached data or existing state.");
          
          // Try to use cached data if available
          const cached = getCachedUser();
          if (cached) {
            setUser(cached.user);
            setIsAuthenticated(cached.isAuthenticated);
            setIsLoading(false);
            setIsInitialized(true);
            return cached.isAuthenticated;
          }
          
          // If no cache, keep existing state
          setIsLoading(false);
          setIsInitialized(true);
          return isAuthenticated;
        }

        if (response.status === 401) {
          console.log("🔍 AuthContext - 401 Unauthorized, clearing auth state");
          setUser(null);
          setIsAuthenticated(false);
          setCachedUser(null, false);
          setIsLoading(false);
          setIsInitialized(true);
          return false;
        }

        if (!response.ok) {
          console.error("Failed to fetch user data:", response.statusText);
          // Don't clear auth state on network errors, use cache if available
          const cached = getCachedUser();
          if (cached) {
            setUser(cached.user);
            setIsAuthenticated(cached.isAuthenticated);
          }
          setIsLoading(false);
          setIsInitialized(true);
          return cached?.isAuthenticated || false;
        }

        const data = await response.json();
        console.log("🔍 AuthContext - Response data received");
        
        if (data.success && data.data) {
          console.log("🔍 AuthContext - User authenticated:", data.data.email);
          console.log("📱 AuthContext - Full user data from API:", data.data);
          console.log("📱 AuthContext - Phone number from API:", data.data.phoneNumber);
          console.log("📱 AuthContext - Phone number type:", typeof data.data.phoneNumber);
          console.log("📱 AuthContext - All user properties from API:", Object.keys(data.data));
          setUser(data.data);
          setIsAuthenticated(true);
          setCachedUser(data.data, true);
          setIsLoading(false);
          setIsInitialized(true);
          return true;
        } else {
          console.log("🔍 AuthContext - No valid user data, clearing auth state");
          setUser(null);
          setIsAuthenticated(false);
          setCachedUser(null, false);
          setIsLoading(false);
          setIsInitialized(true);
          return false;
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.warn("🔍 AuthContext - Request timeout");
        } else {
          console.error("🔍 AuthContext - Network error:", fetchError);
        }
        
        // On network errors, try to use cached data
        const cached = getCachedUser();
        if (cached) {
          console.log("🔍 AuthContext - Using cached data due to network error");
          setUser(cached.user);
          setIsAuthenticated(cached.isAuthenticated);
          setIsLoading(false);
          setIsInitialized(true);
          return cached.isAuthenticated;
        }
        
        // If no cache available, keep existing state
        setIsLoading(false);
        setIsInitialized(true);
        return isAuthenticated;
      }
    } catch (error) {
      console.error("Error in checkAuthStatus:", error);
      setIsLoading(false);
      setIsInitialized(true);
      return false;
    } finally {
      checkInProgressRef.current = false;
    }
  }, [isAuthenticated, isInitialized]);

  // Initialize auth state from cache on mount
  useEffect(() => {
    if (!isBrowser) {
      setIsInitialized(true);
      return;
    }

    // Immediately try to load from cache
    const cached = getCachedUser();
    if (cached) {
      console.log("🔍 AuthContext - Loading initial state from cache");
      setUser(cached.user);
      setIsAuthenticated(cached.isAuthenticated);
      setIsInitialized(true);
      
      // Still check in background but don't block
      setTimeout(() => checkAuthStatus(false), 1000);
    } else {
      // No cache available, check auth status
      console.log("🔍 AuthContext - No cache, checking auth status");
      checkAuthStatus(false);
    }
  }, []);

  // Set up event listeners for auth state changes
  useEffect(() => {
    if (!isBrowser) return;

    const handleAuthSuccess = async () => {
      console.log("🔍 AuthContext - Auth success event received");
      await checkAuthStatus(true); // Force check on successful auth
    };

    const handleAuthError = () => {
      console.log("🔍 AuthContext - Auth error event received");
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      setIsInitialized(true);
      clearCachedUser();
    };

    const handleAuthSignout = () => {
      console.log("🔍 AuthContext - Auth signout event received");
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      setIsInitialized(true);
      clearCachedUser();
    };

    const handleProfileUpdate = async () => {
      console.log("🔍 AuthContext - Profile update event received");
      // Force refresh user data when profile is updated
      if (isAuthenticated) {
        await checkAuthStatus(true);
      }
    };

    window.addEventListener("auth_success", handleAuthSuccess);
    window.addEventListener("auth_error", handleAuthError);
    window.addEventListener("auth_signout", handleAuthSignout);
    window.addEventListener("profile_updated", handleProfileUpdate);

    // Periodic check (every 30 minutes) - much less frequent
    const checkInterval = setInterval(() => {
      if (isInitialized && isAuthenticated) {
        checkAuthStatus(false);
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Optional: Check when user returns to tab (but not more than once per 5 minutes)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        const timeSinceLastCheck = Date.now() - lastCheckRef.current;
        if (timeSinceLastCheck > MIN_CHECK_INTERVAL) {
          checkAuthStatus(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener("auth_success", handleAuthSuccess);
      window.removeEventListener("auth_error", handleAuthError);
      window.removeEventListener("auth_signout", handleAuthSignout);
      window.removeEventListener("profile_updated", handleProfileUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(checkInterval);
    };
  }, [isInitialized, isAuthenticated, checkAuthStatus]);

  // Handle sign out
  const handleSignOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      const apiUrl = getApiBaseUrl();
      
      // Clear cache immediately
      clearCachedUser();
      
      // Call the signout endpoint to clear the HttpOnly cookie
      await fetch(`${apiUrl}/api/auth/signout`, {
        method: "POST",
        credentials: "include",
      });

      // Update local state immediately
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);

      // Notify UI of auth change
      window.dispatchEvent(new Event("auth_signout"));

      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
      // Even if the API call fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      clearCachedUser();
      
      window.location.href = "/";
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isInitialized,
    signOut: handleSignOut,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export auth instance for direct use
export { auth };
