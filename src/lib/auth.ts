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
// SECURE: Environment variable handling without hardcoded fallbacks
// All URLs must be properly configured via environment variables
// =================================================================

import { getApiBaseUrl } from "./env-validation";

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
    profileComplete?: boolean;
    authProvider?: string;
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
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        method: "GET",
        credentials: "include", // CRITICAL: Required for cookies
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

      const apiUrl = getApiBaseUrl();
      
      // TEMPORARY: We've simplified the signup process to only require email and password
      // Name and phone are now optional and can be collected later through the booking form or profile page
      const requestBody = {
        fullName: fullName || "", // Optional - can be empty
        email,
        phone: phoneNumber ? phoneNumber.replace(/[-\s]/g, "") : "", // Remove dashes and spaces
        password,
        confirmPassword,
      };

      // Call the API endpoint with correct path including /api prefix
      const response = await fetch(`${apiUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        credentials: "include", // CRITICAL: Required for cookies
      });

      // Handle 404 specifically
      if (response.status === 404) {
        return {
          success: false,
          error: {
            message:
              "Registration endpoint not found (404). Please check API configuration.",
            details: `The endpoint ${apiUrl}/api/auth/signup could not be reached.`,
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
      const apiUrl = getApiBaseUrl();
      const requestBody = {
        email,
        password,
      };

      // Call the API endpoint with correct path including /api prefix
      const response = await fetch(`${apiUrl}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        credentials: "include", // CRITICAL: Required for cookies
      });

      // Handle 404 specifically
      if (response.status === 404) {
        return {
          success: false,
          error: {
            message:
              "Sign in endpoint not found (404). Please check API configuration.",
            details: `The endpoint ${apiUrl}/api/auth/signin could not be reached.`,
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
      const apiUrl = getApiBaseUrl();

      // Call the signout endpoint to clear the HttpOnly cookie
      await fetch(`${apiUrl}/api/auth/signout`, {
        method: "POST",
        credentials: "include", // CRITICAL: Required for cookies
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
      const apiUrl = getApiBaseUrl();
      const requestBody = { email };

      // Call the API endpoint
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        credentials: "include", // CRITICAL: Required for cookies
      });

      // Handle 404 specifically
      if (response.status === 404) {
        return {
          success: false,
          error: {
            message:
              "Forgot password endpoint not found (404). Please check API configuration.",
            details: `The endpoint ${apiUrl}/api/auth/forgot-password could not be reached.`,
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

      const apiUrl = getApiBaseUrl();
      const requestBody = {
        token,
        newPassword,
        confirmPassword,
      };

      // Call the API endpoint
      const response = await fetch(`${apiUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        credentials: "include", // CRITICAL: Required for cookies
      });

      // Handle 404 specifically
      if (response.status === 404) {
        return {
          success: false,
          error: {
            message:
              "Reset password endpoint not found (404). Please check API configuration.",
            details: `The endpoint ${apiUrl}/api/auth/reset-password could not be reached.`,
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
    let retries = 3;
    let lastError: Error | null = null;

    while (retries > 0) {
    try {
      const apiUrl = getApiBaseUrl();

      const response = await fetch(`${apiUrl}/api/auth/me`, {
        method: "GET",
        credentials: "include", // CRITICAL: Required for cookies
      });

      if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized - user is not authenticated
        return null;
          }
          throw new Error(`Auth check failed with status ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        return null;
      }

      return data.data;
    } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");
        retries--;
        
        if (retries > 0) {
          // Wait a bit before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, (4 - retries) * 1000));
        }
      }
    }

    console.error("Auth status check failed after retries:", lastError);
    return null;
  },

  // Exchange temporary code for session (server-side OAuth flow)
  exchangeCodeForSession: async (code: string): Promise<AuthResponse> => {
    try {
      const apiUrl = getApiBaseUrl();

      const response = await fetch(`${apiUrl}/api/auth/google/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // CRITICAL: Required for cookies
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: "Failed to exchange code for session",
            details: "Authentication code exchange failed",
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
      console.error("Code exchange error:", error);
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to exchange authentication code",
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
      const apiUrl = getApiBaseUrl();

      const response = await fetch(`${apiUrl}/api/auth/complete-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // CRITICAL: Required for cookies
        body: JSON.stringify({
          fullName,
          phoneNumber: phoneNumber.replace(/[-\s]/g, ""), // Remove dashes and spaces
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

  // Update user profile
  updateProfile: async (profileData: {
    fullName?: string;
    phoneNumber?: string;
    notifications?: {
      email: boolean;
      sms: boolean;
    };
  }): Promise<AuthResponse> => {
    try {
      const apiUrl = getApiBaseUrl();

      const response = await fetch(`${apiUrl}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // CRITICAL: Required for cookies
        body: JSON.stringify({
          fullName: profileData.fullName,
          phoneNumber: profileData.phoneNumber ? profileData.phoneNumber.replace(/[-\s]/g, "") : undefined,
          notifications: profileData.notifications,
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: "Failed to update profile",
            details: "API request failed",
          },
        };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: {
            message: data.error?.message || "Failed to update profile",
            details: data.error?.details,
          },
        };
      }

      // Notify UI of profile change to refresh user data
      if (isBrowser) {
        window.dispatchEvent(new Event("profile_updated"));
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Profile update error:", error);
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to update profile",
        },
      };
    }
  },

  // Send OTP for password reset
  sendPasswordResetOTP: async (email: string): Promise<AuthResponse> => {
    try {
      const apiUrl = getApiBaseUrl();

      const response = await fetch(`${apiUrl}/api/password-reset/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            message: errorData.error?.message || "Failed to send OTP",
            details: errorData.error?.details,
          },
        };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: {
            message: data.error?.message || "Failed to send OTP",
            details: data.error?.details,
          },
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Send OTP error:", error);
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to send OTP",
        },
      };
    }
  },

  // Verify OTP for password reset
  verifyPasswordResetOTP: async (email: string, otp: string): Promise<AuthResponse> => {
    try {
      const apiUrl = getApiBaseUrl();

      const response = await fetch(`${apiUrl}/api/password-reset/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            message: errorData.error?.message || "Invalid OTP",
            details: errorData.error?.details,
          },
        };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: {
            message: data.error?.message || "Invalid OTP",
            details: data.error?.details,
          },
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Verify OTP error:", error);
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to verify OTP",
        },
      };
    }
  },

  // Reset password with OTP
  resetPasswordWithOTP: async (email: string, otp: string, newPassword: string, confirmPassword: string): Promise<AuthResponse> => {
    try {
      const apiUrl = getApiBaseUrl();

      const response = await fetch(`${apiUrl}/api/password-reset/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          otp,
          newPassword,
          confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            message: errorData.error?.message || "Failed to reset password",
            details: errorData.error?.details,
          },
        };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: {
            message: data.error?.message || "Failed to reset password",
            details: data.error?.details,
          },
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to reset password",
        },
      };
    }
  },

  // Check OTP status (optional)
  checkOTPStatus: async (email: string): Promise<AuthResponse> => {
    try {
      const apiUrl = getApiBaseUrl();

      const response = await fetch(`${apiUrl}/api/password-reset/check-otp-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            message: errorData.error?.message || "Failed to check OTP status",
            details: errorData.error?.details,
          },
        };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: {
            message: data.error?.message || "Failed to check OTP status",
            details: data.error?.details,
          },
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Check OTP status error:", error);
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to check OTP status",
        },
      };
    }
  },

  // Email verification functions
  requestEmailVerification: async (email: string): Promise<AuthResponse> => {
    try {
      const apiUrl = getApiBaseUrl();

      const response = await fetch(`${apiUrl}/api/email-verification/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            message: errorData.error?.message || "Failed to send verification code",
            details: errorData.error?.details,
          },
        };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: {
            message: data.error?.message || "Failed to send verification code",
            details: data.error?.details,
          },
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Request email verification error:", error);
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to send verification code",
        },
      };
    }
  },

  verifyEmailCode: async (email: string, otp: string): Promise<AuthResponse> => {
    try {
      const apiUrl = getApiBaseUrl();

      const response = await fetch(`${apiUrl}/api/email-verification/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            message: errorData.error?.message || "Invalid verification code",
            details: errorData.error?.details,
          },
        };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: {
            message: data.error?.message || "Invalid verification code",
            details: data.error?.details,
          },
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Verify email code error:", error);
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to verify code",
        },
      };
    }
  },

  resendEmailVerification: async (email: string): Promise<AuthResponse> => {
    try {
      const apiUrl = getApiBaseUrl();

      const response = await fetch(`${apiUrl}/api/email-verification/resend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            message: errorData.error?.message || "Failed to resend verification code",
            details: errorData.error?.details,
          },
        };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: {
            message: data.error?.message || "Failed to resend verification code",
            details: data.error?.details,
          },
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Resend email verification error:", error);
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to resend verification code",
        },
      };
    }
  },
};
