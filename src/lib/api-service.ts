import { authService } from "./auth";
import { auth, getIdToken } from "./firebase/config";

// =================================================================
// IMPORTANT: This file is now complete and should not be modified.
// All authentication functionality is finalized.
// =================================================================

// Base URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;
// Add the /api prefix to base URL as needed by the API
const API_BASE_URL = API_URL ? `${API_URL}/api` : undefined;

// Default options for fetch
const defaultOptions: RequestInit = {
  headers: {
    "Content-Type": "application/json",
  },
};

// API response type definition
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: {
    message: string;
    details?: string;
    code?: string;
  };
  metadata?: Record<string, unknown>;
}

// API service with authentication
export const apiService = {
  // Get Firebase token for API requests
  getFirebaseToken: async (): Promise<string | null> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return null;
      }

      // Get the ID token with force refresh
      return await getIdToken(currentUser);
    } catch {
      // Silent error handling
      return null;
    }
  },

  // Create request with auth token
  createRequest: async (
    method: string,
    endpoint: string,
    data?: Record<string, unknown>,
    customOptions?: RequestInit
  ): Promise<RequestInit> => {
    // Get Firebase ID token for authenticated requests
    let authHeader = {};

    // For secured endpoints, get a fresh Firebase token
    if (!endpoint.startsWith("/auth/") || endpoint === "/auth/signout") {
      const firebaseToken = await apiService.getFirebaseToken();
      if (firebaseToken) {
        authHeader = { Authorization: `Bearer ${firebaseToken}` };
      }
    }

    const options: RequestInit = {
      ...defaultOptions,
      ...customOptions,
      method,
      headers: {
        ...defaultOptions.headers,
        ...(customOptions?.headers || {}),
        ...authHeader,
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    return options;
  },

  // GET request
  get: async <T>(endpoint: string, customOptions?: RequestInit): Promise<T> => {
    if (!API_BASE_URL) {
      throw new Error("API URL is not defined");
    }

    // For protected endpoints, ensure we're authenticated
    if (!endpoint.startsWith("/auth/")) {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        await authService.signOut();
        throw new Error("Authentication required");
      }
    }

    // Create the request options and await the Promise resolution
    const options = await apiService.createRequest(
      "GET",
      endpoint,
      undefined,
      customOptions
    );

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      // Handle 401 Unauthorized by redirecting to login
      if (response.status === 401) {
        await authService.signOut();
        throw new Error("Authentication required");
      }

      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    return response.json();
  },

  // POST request
  post: async <T>(
    endpoint: string,
    data: Record<string, unknown>,
    customOptions?: RequestInit
  ): Promise<T> => {
    if (!API_BASE_URL) {
      throw new Error("API URL is not defined");
    }

    // For protected endpoints, ensure we're authenticated
    if (!endpoint.startsWith("/auth/") || endpoint === "/auth/signout") {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        await authService.signOut();
        throw new Error("Authentication required");
      }
    }

    // Create the request options and await the Promise resolution
    const options = await apiService.createRequest(
      "POST",
      endpoint,
      data,
      customOptions
    );

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      // Handle 401 Unauthorized by redirecting to login
      if (response.status === 401) {
        await authService.signOut();
        throw new Error("Authentication required");
      }

      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    return response.json();
  },

  // PUT request
  put: async <T>(
    endpoint: string,
    data: Record<string, unknown>,
    customOptions?: RequestInit
  ): Promise<T> => {
    if (!API_BASE_URL) {
      throw new Error("API URL is not defined");
    }

    // For protected endpoints, ensure we're authenticated
    if (!endpoint.startsWith("/auth/")) {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        await authService.signOut();
        throw new Error("Authentication required");
      }
    }

    // Create the request options and await the Promise resolution
    const options = await apiService.createRequest(
      "PUT",
      endpoint,
      data,
      customOptions
    );

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      // Handle 401 Unauthorized by redirecting to login
      if (response.status === 401) {
        await authService.signOut();
        throw new Error("Authentication required");
      }

      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    return response.json();
  },

  // DELETE request
  delete: async <T>(
    endpoint: string,
    customOptions?: RequestInit
  ): Promise<T> => {
    if (!API_BASE_URL) {
      throw new Error("API URL is not defined");
    }

    // For protected endpoints, ensure we're authenticated
    if (!endpoint.startsWith("/auth/")) {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        await authService.signOut();
        throw new Error("Authentication required");
      }
    }

    // Create the request options and await the Promise resolution
    const options = await apiService.createRequest(
      "DELETE",
      endpoint,
      undefined,
      customOptions
    );

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      // Handle 401 Unauthorized by redirecting to login
      if (response.status === 401) {
        await authService.signOut();
        throw new Error("Authentication required");
      }

      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    return response.json();
  },

  // Generic fetch with error handling and authentication
  async fetchWithAuth<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const fullUrl = `${apiUrl}${url.startsWith("/") ? "" : "/"}${url}`;

      // Ensure we always include credentials for cookie-based auth
      const fetchOptions: RequestInit = {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      };

      const response = await fetch(fullUrl, fetchOptions);

      // Network response was received
      try {
        // Try to parse JSON response
        const data = await response.json();

        // If the API returned an error response
        if (!response.ok) {
          return {
            success: false,
            data: null,
            error: {
              message: data.error?.message || "API request failed",
              details: data.error?.details || response.statusText,
              code: data.error?.code || response.status.toString(),
            },
          };
        }

        // Success response
        return {
          success: true,
          data: data.data,
          metadata: data.metadata || {},
        };
      } catch (parseError) {
        // JSON parsing failed
        console.error("JSON parsing error", parseError);
        return {
          success: false,
          data: null,
          error: {
            message: "Failed to parse API response",
            details: response.statusText,
            code: response.status.toString(),
          },
        };
      }
    } catch (networkError) {
      // Network error (e.g., offline, DNS failure)
      console.error("Network error:", networkError);
      return {
        success: false,
        data: null,
        error: {
          message: "Network error",
          details:
            networkError instanceof Error
              ? networkError.message
              : "Failed to connect to API",
          code: "NETWORK_ERROR",
        },
      };
    }
  },
};
