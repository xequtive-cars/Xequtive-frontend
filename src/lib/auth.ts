import {
  signOut as firebaseSignOut,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebase/config";
import { FirebaseError } from "firebase/app";

// =================================================================
// IMPORTANT: This file is now complete and should not be modified.
// All authentication functionality is finalized.
// =================================================================

// Types for auth data
interface UserData {
  uid: string;
  email: string;
  displayName: string | null;
  role: string;
  phoneNumber: string;
}

interface AuthResponse {
  success: boolean;
  data?: {
    uid: string;
    email: string;
    displayName: string;
    role: string;
    token?: string;
    expiresIn?: string;
    phoneNumber: string;
  };
  error?: {
    message: string;
    details?: string;
  };
}

// Check if code is running in browser
const isBrowser = typeof window !== "undefined";

// Auth service implementation
export const authService = {
  // Get current auth token
  getToken: (): string | null => {
    if (!isBrowser) return null;

    try {
      return localStorage.getItem("auth-token");
    } catch {
      return null;
    }
  },

  // Get current user data
  getUserData: (): UserData | null => {
    if (!isBrowser) return null;

    try {
      const userData = localStorage.getItem("user-data");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  },

  // Save auth data
  saveAuthData: (token: string, userData: UserData, expiresIn?: string) => {
    if (!isBrowser) return;

    try {
      // Store the token in localStorage
      localStorage.setItem("auth-token", token);

      // Also store the token in a cookie for middleware access
      const expiryDays = expiresIn ? parseInt(expiresIn) / 86400 : 7; // Convert seconds to days or default to 7 days
      document.cookie = `auth-token=${token}; path=/; max-age=${
        expiryDays * 86400
      }; SameSite=Strict; Secure`;

      // Store user data
      localStorage.setItem("user-data", JSON.stringify(userData));

      // Set expiry timestamp if provided
      if (expiresIn) {
        const expiryTime = Date.now() + parseInt(expiresIn) * 1000;
        localStorage.setItem("token-expiry", expiryTime.toString());
      }

      // Add a last-authenticated timestamp
      localStorage.setItem("last-auth", Date.now().toString());
    } catch {
      // Error handling silent
    }
  },

  // Clear auth data
  clearAuthData: () => {
    if (!isBrowser) return;

    try {
      // Clear localStorage items
      localStorage.removeItem("auth-token");
      localStorage.removeItem("user-data");
      localStorage.removeItem("token-expiry");
      localStorage.removeItem("last-auth");

      // Also clear the auth token cookie
      document.cookie =
        "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
    } catch {
      // Error handling silent
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (!isBrowser) return false;

    try {
      // Get token and user data
      const token = authService.getToken();
      const userData = authService.getUserData();

      if (!token || !userData) {
        return false;
      }

      // Check token expiry if available
      const expiryTime = localStorage.getItem("token-expiry");
      if (expiryTime) {
        const expiryTimestamp = parseInt(expiryTime);
        // Consider token invalid if it's expired or within 5 minutes of expiration
        const fiveMinutesInMs = 5 * 60 * 1000;
        if (
          isNaN(expiryTimestamp) ||
          expiryTimestamp < Date.now() + fiveMinutesInMs
        ) {
          console.warn("Auth token expired or about to expire");
          authService.clearAuthData();
          return false;
        }
      } else {
        // If we don't have an expiry time but we have a token, check if it was created
        // more than 4 days ago (assuming 5-day tokens)
        const lastAuth = localStorage.getItem("last-auth");
        if (lastAuth) {
          const lastAuthTime = parseInt(lastAuth);
          const fourDaysInMs = 4 * 24 * 60 * 60 * 1000;
          if (
            !isNaN(lastAuthTime) &&
            Date.now() - lastAuthTime > fourDaysInMs
          ) {
            console.warn("Auth token potentially expired (older than 4 days)");
            authService.clearAuthData();
            return false;
          }
        }
      }

      return true;
    } catch {
      // Clear data on error to be safe
      authService.clearAuthData();
      return false;
    }
  },

  // Check if auth token needs refreshing (within 30 minutes of expiration)
  shouldRefreshToken: (): boolean => {
    if (!isBrowser) return false;

    try {
      // First check if we're authenticated at all
      if (!authService.isAuthenticated()) {
        return false;
      }

      // Get token expiry
      const expiryTime = localStorage.getItem("token-expiry");
      if (expiryTime) {
        const expiryTimestamp = parseInt(expiryTime);
        // If token expires within 30 minutes, we should refresh it
        const thirtyMinutesInMs = 30 * 60 * 1000;
        if (
          !isNaN(expiryTimestamp) &&
          expiryTimestamp < Date.now() + thirtyMinutesInMs
        ) {
          return true;
        }
      } else {
        // If we don't have an expiry time but we have a token, check if it was created
        // more than 4 days ago (assuming 5-day tokens)
        const lastAuth = localStorage.getItem("last-auth");
        if (lastAuth) {
          const lastAuthTime = parseInt(lastAuth);
          const threeDaysInMs = 3.5 * 24 * 60 * 60 * 1000;
          if (
            !isNaN(lastAuthTime) &&
            Date.now() - lastAuthTime > threeDaysInMs
          ) {
            return true;
          }
        }
      }

      return false;
    } catch {
      return false;
    }
  },

  // Handle 401 Unauthorized response from API
  handleAuthError: (status: number): boolean => {
    // If we receive a 401, clear auth data and return true to indicate auth error
    if (status === 401) {
      console.warn("Received 401 Unauthorized response from API");
      authService.clearAuthData();

      // Notify auth change
      if (isBrowser) {
        window.dispatchEvent(new Event("storage"));
      }

      return true;
    }
    return false;
  },

  // Register a new user
  async register(
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
    phoneNumber: string = ""
  ): Promise<AuthResponse> {
    console.log("Registering user via API...");

    try {
      // Validate password match
      if (password !== confirmPassword) {
        return {
          success: false,
          error: { message: "Passwords do not match" },
        };
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const requestBody = {
        fullName,
        email,
        phone: phoneNumber.replace(/-/g, ""), // Remove dashes and send only digits with country code
        password,
        confirmPassword,
      };

      // Log the request body for debugging
      console.log(
        "Registration request body:",
        JSON.stringify(requestBody, null, 2)
      );

      // URL includes /api prefix
      const fullUrl = `${apiUrl}/api/auth/register`;

      // Call the API endpoint with correct path including /api prefix
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      // Log response status for debugging
      console.log(`Registration API response status: ${response.status}`);

      // Handle 404 specifically
      if (response.status === 404) {
        return {
          success: false,
          error: {
            message:
              "Registration endpoint not found (404). Please check API configuration.",
            details: `The endpoint ${fullUrl} could not be reached.`,
          },
        };
      }

      const data = await response.json();

      // Log response data for debugging
      console.log("Registration API response data:", data);

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: {
            message: data.error?.message || "Registration failed",
            details: data.error?.details,
          },
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Registration error:", error);

      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Registration failed. Please try again.",
        },
      };
    }
  },

  // Sign in user using the API
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const requestBody = {
        email,
        password,
      };

      // URL includes /api prefix
      const fullUrl = `${apiUrl}/api/auth/signin`;

      // Call the API endpoint with correct path including /api prefix
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      // Handle 404 specifically
      if (response.status === 404) {
        return {
          success: false,
          error: {
            message:
              "Sign in endpoint not found (404). Please check API configuration.",
            details: `The endpoint ${fullUrl} could not be reached.`,
          },
        };
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: {
            message: data.error?.message || "Sign in failed",
            details: data.error?.details,
          },
        };
      }

      // Login successful, store auth data
      if (data.success && data.data) {
        const { token, uid, email, displayName, role, phone, expiresIn } =
          data.data;

        // Save to localStorage
        authService.saveAuthData(
          token,
          { uid, email, displayName, role, phoneNumber: phone || "" },
          expiresIn
        );

        // Dispatch a storage event to notify other tabs/components
        if (isBrowser) {
          // Create and dispatch a storage event to trigger auth state update
          // This helps components using the auth context to update immediately
          window.dispatchEvent(new Event("storage"));
        }
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Sign in failed",
        },
      };
    }
  },

  // Sign out user
  signOut: async (): Promise<void> => {
    try {
      // Clear local storage first
      authService.clearAuthData();

      // Then sign out from Firebase
      try {
        await firebaseSignOut(auth);
      } catch {
        // Silent error handling
      }

      // No longer redirect here as this is now handled by the auth context
    } catch {
      // Even if there's an error, try to clear local data
      authService.clearAuthData();
    }
  },

  // Subscribe to auth state changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    // Don't try to set up auth state listeners on the server
    if (!isBrowser) {
      return () => {}; // Return no-op unsubscribe function
    }

    return onAuthStateChanged(auth, callback);
  },

  // Helper function to format Firebase error messages
  getErrorMessage: (error: FirebaseError): string => {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email address is already registered. Please use a different email or sign in.";
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/weak-password":
        return "Password is too weak. Please use a stronger password.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Invalid email or password.";
      default:
        return error.message || "An error occurred during authentication.";
    }
  },
};
