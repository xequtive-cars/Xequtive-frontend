"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { auth, getIdToken } from "./config";
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
  getFirebaseToken: () => Promise<string | null>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
  getFirebaseToken: async () => null,
});

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // State for user and loading status
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // This effect runs once on mount to initialize auth state
  useEffect(() => {
    if (!isBrowser) {
      setIsLoading(false);
      return;
    }

    // Initialize Firebase auth listener
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      // Just log the auth state change - we'll primarily use our custom auth system
      console.log(
        "Firebase auth state changed:",
        firebaseUser ? "logged in" : "logged out"
      );
    });

    const initializeAuth = async () => {
      // Get stored credentials from localStorage
      const storedUser = authService.getUserData();
      const isValid = authService.isAuthenticated();

      if (storedUser && isValid) {
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        // Clear any invalid auth data
        authService.clearAuthData();
        setUser(null);
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    // Initialize authentication state immediately
    initializeAuth();

    // Set up a storage event listener to sync auth state across tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "auth-token" || event.key === "user-data") {
        initializeAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Use a simple interval to periodically check token expiration
    const checkInterval = setInterval(() => {
      // Check if token should be refreshed first
      if (authService.shouldRefreshToken()) {
        console.log("Token needs refreshing - attempting to refresh");

        // Try to refresh the token silently if possible
        // Note: This requires the user to be logged in with Firebase
        const refreshUser = async () => {
          try {
            const currentUser = auth.currentUser;
            if (currentUser) {
              // Get a fresh token using our helper function
              const token = await getIdToken(currentUser);
              if (token) {
                console.log("Successfully refreshed token");
                // Update token in storage
                const userData = authService.getUserData();
                if (userData) {
                  authService.saveAuthData(token, userData, "432000"); // 5 days in seconds
                  // No need to update state as storage event will trigger
                }
                return;
              }
            }

            // If we couldn't refresh, check if the token is still valid
            const isStillValid = authService.isAuthenticated();
            if (!isStillValid && isAuthenticated) {
              console.log("Token is no longer valid - clearing auth data");
              authService.clearAuthData();
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (error) {
            console.error("Error refreshing token:", error);
            // Check if still valid anyway
            const isStillValid = authService.isAuthenticated();
            if (!isStillValid && isAuthenticated) {
              console.log("Token is no longer valid - clearing auth data");
              authService.clearAuthData();
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        };

        refreshUser();
      } else {
        // Just check if the token is still valid
        const isStillValid = authService.isAuthenticated();
        if (!isStillValid && isAuthenticated) {
          console.log("Token is no longer valid - clearing auth data");
          authService.clearAuthData();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    }, 60000); // Check every minute

    // Cleanup function
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(checkInterval);
      unsubscribe();
    };
  }, [isAuthenticated]);

  // Get Firebase ID token for API requests
  const getFirebaseToken = async (): Promise<string | null> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return null;
      }

      // Get the ID token
      return await getIdToken(currentUser);
    } catch (error) {
      console.error("Error getting Firebase token:", error);
      return null;
    }
  };

  // Handle sign out - wrap the auth service method to also update local state
  const handleSignOut = async (): Promise<void> => {
    try {
      // Clear auth data (both localStorage and cookies)
      await authService.signOut();

      // Update local state immediately
      setUser(null);
      setIsAuthenticated(false);

      // Force a hard redirect after signout for the best compatibility
      // with both middleware and client-side auth context
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
      // Force update state even on error
      setUser(null);
      setIsAuthenticated(false);

      // Still try to redirect
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
        getFirebaseToken,
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
