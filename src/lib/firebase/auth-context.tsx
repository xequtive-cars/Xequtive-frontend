"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { auth } from "./config";
import { authService } from "@/lib/auth";

// Check if we're in the browser environment
const isBrowser = typeof window !== "undefined";

// Simple user type matching our service
interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: string;
  phoneNumber?: string;
}

// Auth context type
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
  checkAuthStatus: async () => false,
});

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // State for user and loading status
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to check authentication status from the backend
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      if (!isBrowser) return false;

      setIsLoading(true);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        method: "GET",
        credentials: "include", // Important for sending cookies
      });

      if (response.status === 401) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }

      if (!response.ok) {
        console.error("Failed to fetch user data:", response.statusText);
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }

      const data = await response.json();
      if (data.success && data.data) {
        setUser(data.data);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }
  };

  // This effect runs once on mount to initialize auth state
  useEffect(() => {
    if (!isBrowser) {
      setIsLoading(false);
      return;
    }

    const initializeAuth = async () => {
      await checkAuthStatus();
    };

    // Initialize authentication state immediately
    initializeAuth();

    // Set up custom event listeners for auth state changes
    const handleAuthSuccess = () => {
      checkAuthStatus();
    };

    const handleAuthError = () => {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    };

    const handleAuthSignout = () => {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    };

    window.addEventListener("auth_success", handleAuthSuccess);
    window.addEventListener("auth_error", handleAuthError);
    window.addEventListener("auth_signout", handleAuthSignout);

    // Check auth status periodically (every 5 minutes)
    const checkInterval = setInterval(() => {
      checkAuthStatus();
    }, 5 * 60 * 1000);

    // Cleanup function
    return () => {
      window.removeEventListener("auth_success", handleAuthSuccess);
      window.removeEventListener("auth_error", handleAuthError);
      window.removeEventListener("auth_signout", handleAuthSignout);
      clearInterval(checkInterval);
    };
  }, []);

  // Handle sign out - wrap the auth service method to also update local state
  const handleSignOut = async (): Promise<void> => {
    try {
      // Call the signout endpoint to clear cookies
      await authService.signOut();

      // Update local state immediately
      setUser(null);
      setIsAuthenticated(false);

      // Force a hard redirect to the homepage after signout to reset all state
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
      // Force update state even on error
      setUser(null);
      setIsAuthenticated(false);

      // Still redirect on error
      window.location.href = "/";
    }
  };

  // Return context provider with current auth state
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        signOut: handleSignOut,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Export auth for direct access
export { auth };
