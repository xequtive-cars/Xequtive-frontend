/**
 * Auth service for handling authentication with the API
 * Uses secure HTTP-only cookies for token storage (handled by the server)
 * The backend handles setting cookies with tokens automatically
 */

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
  // Get current auth token - DEPRECATED, tokens now managed by secure HttpOnly cookies
  getToken: (): string | null => {
    return null; // We no longer store tokens in localStorage
  },

  // Get current user data from API
  getUserData: async (): Promise<UserData | null> => {
    return authService.checkAuthStatus();
  },

  // Save auth data - DEPRECATED, tokens now managed by secure HttpOnly cookies
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  saveAuthData: (token: string, userData: UserData, expiresIn?: string) => {
    // This function is now a no-op as we're using HttpOnly cookies
    console.warn(
      "saveAuthData is deprecated - using secure HttpOnly cookies instead"
    );
  },

  // Clear auth data - only used for local cleanup
  clearAuthData: () => {
    // The actual cookie clearing happens server-side when calling signOut()
    console.info("Local auth data cleared");
  },

  // Check if user is authenticated by making an API call
  isAuthenticated: async (): Promise<boolean> => {
    if (!isBrowser) return false;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        method: "GET",
        credentials: "include", // Important for sending cookies
      });

      return response.ok; // If 200, user is authenticated
    } catch {
      return false;
    }
  },

  // This is no longer needed as token refresh is handled server-side
  shouldRefreshToken: (): boolean => {
    return false;
  },

  // Handle 401 Unauthorized response from API
  handleAuthError: (status: number): boolean => {
    // If we receive a 401, redirect to login
    if (status === 401) {
      console.warn("Received 401 Unauthorized response from API");
      // We don't need to clear anything locally anymore

      // Notify UI of auth change
      if (isBrowser) {
        window.dispatchEvent(new Event("auth_error"));
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

      // URL includes /api prefix
      const fullUrl = `${apiUrl}/api/auth/signup`;

      // Call the API endpoint with correct path including /api prefix
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        credentials: "include", // Important for cookie handling
      });

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
        credentials: "include", // Important for cookie handling
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

      // No need to save anything to localStorage anymore
      // The backend has set the HttpOnly cookie automatically

      // Notify UI of auth change
      if (isBrowser) {
        window.dispatchEvent(new Event("auth_success"));
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const fullUrl = `${apiUrl}/api/auth/signout`;

      // Call the signout endpoint to clear the HttpOnly cookie
      await fetch(fullUrl, {
        method: "POST",
        credentials: "include", // Important for cookie handling
      });

      // Notify UI of auth change
      if (isBrowser) {
        window.dispatchEvent(new Event("auth_signout"));
      }
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      // Still try to sign out from Firebase as a fallback
      try {
        await firebaseSignOut(auth);
      } catch {
        // Silent error handling
      }
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

  // Request password reset
  forgotPassword: async (email: string): Promise<AuthResponse> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const requestBody = { email };

      // URL includes /api prefix
      const fullUrl = `${apiUrl}/api/auth/forgot-password`;

      // Call the API endpoint
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        credentials: "include", // Consistent with our approach
      });

      // Handle 404 specifically
      if (response.status === 404) {
        return {
          success: false,
          error: {
            message:
              "Forgot password endpoint not found (404). Please check API configuration.",
            details: `The endpoint ${fullUrl} could not be reached.`,
          },
        };
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: {
            message: data.error?.message || "Password reset request failed",
            details: data.error?.details,
          },
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Password reset request failed. Please try again.",
        },
      };
    }
  },

  // Reset password with token
  resetPassword: async (
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<AuthResponse> => {
    try {
      // Validate password match
      if (newPassword !== confirmPassword) {
        return {
          success: false,
          error: { message: "Passwords do not match" },
        };
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const requestBody = {
        token,
        newPassword,
        confirmPassword,
      };

      // URL includes /api prefix
      const fullUrl = `${apiUrl}/api/auth/reset-password`;

      // Call the API endpoint
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        credentials: "include", // Consistent with our approach
      });

      // Handle 404 specifically
      if (response.status === 404) {
        return {
          success: false,
          error: {
            message:
              "Reset password endpoint not found (404). Please check API configuration.",
            details: `The endpoint ${fullUrl} could not be reached.`,
          },
        };
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: {
            message: data.error?.message || "Password reset failed",
            details: data.error?.details,
          },
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Password reset failed. Please try again.",
        },
      };
    }
  },

  // Check authentication status
  checkAuthStatus: async (): Promise<UserData | null> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const fullUrl = `${apiUrl}/api/auth/me`;

      const response = await fetch(fullUrl, {
        method: "GET",
        credentials: "include", // Important for cookie handling
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        return null;
      }

      return data.data;
    } catch (error) {
      console.error("Error checking auth status:", error);
      return null;
    }
  },

  // Initiate Google OAuth flow
  initiateGoogleAuth: () => {
    if (!isBrowser) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const redirectUrl = `${window.location.origin}/auth/callback`;
    window.location.href = `${apiUrl}/api/auth/google/login?redirect_url=${encodeURIComponent(
      redirectUrl
    )}`;
  },

  // Exchange temporary code for session
  exchangeCodeForSession: async (code: string): Promise<AuthResponse> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const fullUrl = `${apiUrl}/api/auth/google/callback`;

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookie handling
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: "Authentication failed",
            details: "Failed to exchange code for session",
          },
        };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: {
            message: data.error?.message || "Authentication failed",
            details: data.error?.details,
          },
        };
      }

      // Notify UI of auth change
      if (isBrowser) {
        window.dispatchEvent(new Event("auth_success"));
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Session exchange error:", error);
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to exchange code for session",
        },
      };
    }
  },

  // Complete user profile with phone number
  completeUserProfile: async (
    fullName: string,
    phoneNumber: string
  ): Promise<AuthResponse> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const fullUrl = `${apiUrl}/api/auth/complete-profile`;

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookie handling
        body: JSON.stringify({
          fullName,
          phoneNumber: phoneNumber.replace(/-/g, ""), // Remove dashes
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: "Failed to complete profile",
            details: "API request failed",
          },
        };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: {
            message: data.error?.message || "Failed to complete profile",
            details: data.error?.details,
          },
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Profile completion error:", error);
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to complete profile",
        },
      };
    }
  },
};
