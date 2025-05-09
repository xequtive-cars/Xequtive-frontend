"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { auth, getIdToken, db } from "./config";
import { authService } from "@/lib/auth";
import { doc, getDoc } from "firebase/firestore";

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
      const isStillValid = authService.isAuthenticated();
      if (!isStillValid && isAuthenticated) {
        // Token expired, update state
        setUser(null);
        setIsAuthenticated(false);
      }
    }, 60000); // Check every minute

    // Set up firebase auth listener as a backup
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      // If Firebase signs out but we have a token, let the token remain valid
      // If we don't have a valid token but Firebase says we're logged in, still
      // consider the user as logged out since the API needs the token
      if (firebaseUser && !isAuthenticated) {
        try {
          // Get the user profile from Firestore to get the phone number
          const userRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();

            // Set user with data from Firestore, including phone number
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: userData.role || "user",
              phoneNumber: userData.phoneNumber || "",
            });
            setIsAuthenticated(true);
          } else {
            // If no user document exists, still set basic user data
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: "user",
            });
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else if (!firebaseUser && isAuthenticated) {
        const isStillValid = authService.isAuthenticated();
        if (!isStillValid) {
          authService.clearAuthData();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    });

    return () => {
      clearInterval(checkInterval);
      unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []); // Run only once on mount

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
