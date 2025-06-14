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
  photoURL?: string;
  authProvider?: string;
}

// Auth context type with improved loading states
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean; // New: tracks if auth has been checked at least once
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false, // Start as false to not block rendering
  isAuthenticated: false,
  isInitialized: false,
  signOut: async () => {},
  checkAuthStatus: async () => false,
});

// Auth provider component - NON-BLOCKING with SSR protection
export function AuthProvider({ children }: { children: ReactNode }) {
  // State for user and loading status
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Start false - don't block
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(!isBrowser); // Initialize as true for SSR

  // Function to check authentication status from the backend
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      if (!isBrowser) {
        setIsInitialized(true);
        return false;
      }

      // Only set loading if this is not the initial check
      if (isInitialized) {
        setIsLoading(true);
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        method: "GET",
        credentials: "include", // Important for sending cookies
      });

      if (response.status === 401) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        setIsInitialized(true);
        return false;
      }

      if (!response.ok) {
        console.error("Failed to fetch user data:", response.statusText);
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        setIsInitialized(true);
        return false;
      }

      const data = await response.json();
      if (data.success && data.data) {
        setUser(data.data);
        setIsAuthenticated(true);
        setIsLoading(false);
        setIsInitialized(true);
        return true;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        setIsInitialized(true);
        return false;
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      setIsInitialized(true);
      return false;
    }
  };

  // This effect runs once on mount to initialize auth state - NON-BLOCKING
  useEffect(() => {
    if (!isBrowser) {
      setIsInitialized(true);
      return;
    }

    // Initialize auth in the background - don't block rendering
    const initializeAuth = async () => {
      // Small delay to ensure page renders first
      await new Promise(resolve => setTimeout(resolve, 100));
      await checkAuthStatus();
    };

    // Initialize authentication state in background
    initializeAuth();

    // Set up custom event listeners for auth state changes
    const handleAuthSuccess = async () => {
      // Immediately check auth status when success event is triggered
      await checkAuthStatus();
    };

    const handleAuthError = () => {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      setIsInitialized(true);
    };

    const handleAuthSignout = () => {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      setIsInitialized(true);
    };

    window.addEventListener("auth_success", handleAuthSuccess);
    window.addEventListener("auth_error", handleAuthError);
    window.addEventListener("auth_signout", handleAuthSignout);

    // Check auth status periodically (every 5 minutes) - but don't block
    const checkInterval = setInterval(() => {
      if (isInitialized) {
        checkAuthStatus();
      }
    }, 5 * 60 * 1000);

    // Cleanup function
    return () => {
      window.removeEventListener("auth_success", handleAuthSuccess);
      window.removeEventListener("auth_error", handleAuthError);
      window.removeEventListener("auth_signout", handleAuthSignout);
      clearInterval(checkInterval);
    };
  }, [isInitialized]);

  // Handle sign out - wrap the auth service method to also update local state
  const handleSignOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call the signout endpoint to clear cookies
      await authService.signOut();

      // Update local state immediately
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);

      // Force a hard redirect to the homepage after signout to reset all state
      if (isBrowser) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Sign out error:", error);
      // Force update state even on error
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);

      // Still redirect on error
      if (isBrowser) {
        window.location.href = "/";
      }
    }
  };

  // Return context provider with current auth state
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isInitialized,
        signOut: handleSignOut,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context with SSR protection
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    // During SSR, return safe defaults
    if (!isBrowser) {
      return {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        isInitialized: true, // Consider initialized during SSR
        signOut: async () => {},
        checkAuthStatus: async () => false,
      };
    }
    
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Export auth for direct access
export { auth };
