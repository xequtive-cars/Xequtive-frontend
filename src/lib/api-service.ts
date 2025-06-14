import { authService } from "./auth";
import { apiClient, ApiResponse } from "./api-client";

// =================================================================
// UPDATED: API service now uses HTTP-only cookie authentication
// Removed Firebase token handling per backend team requirements
// =================================================================

/**
 * Legacy API service for backward compatibility
 * Uses secure HTTP-only cookies for authentication
 * All URLs must be configured via environment variables
 */

import { getApiBaseUrl } from "./env-validation";

// API service with cookie-based authentication
export const apiService = {
  // GET request using the centralized API client
  get: async <T>(endpoint: string): Promise<T> => {
    try {
      return await apiClient.get<T>(endpoint);
    } catch (error) {
      // Handle authentication errors
      if (error instanceof Error && error.message === 'Unauthorized') {
        await authService.signOut();
        throw new Error("Authentication required");
      }
      throw error;
    }
  },

  // POST request using the centralized API client
  post: async <T>(
    endpoint: string,
    data: Record<string, unknown>
  ): Promise<T> => {
    try {
      return await apiClient.post<T>(endpoint, data);
    } catch (error) {
      // Handle authentication errors
      if (error instanceof Error && error.message === 'Unauthorized') {
        await authService.signOut();
        throw new Error("Authentication required");
      }
      throw error;
    }
  },

  // PUT request using the centralized API client
  put: async <T>(
    endpoint: string,
    data: Record<string, unknown>
  ): Promise<T> => {
    try {
      return await apiClient.put<T>(endpoint, data);
    } catch (error) {
      // Handle authentication errors
      if (error instanceof Error && error.message === 'Unauthorized') {
        await authService.signOut();
        throw new Error("Authentication required");
      }
      throw error;
    }
  },

  // DELETE request using the centralized API client
  delete: async <T>(endpoint: string): Promise<T> => {
    try {
      return await apiClient.delete<T>(endpoint);
    } catch (error) {
      // Handle authentication errors
      if (error instanceof Error && error.message === 'Unauthorized') {
        await authService.signOut();
        throw new Error("Authentication required");
      }
      throw error;
    }
  },

  // PATCH request using the centralized API client
  patch: async <T>(
    endpoint: string,
    data: Record<string, unknown>
  ): Promise<T> => {
    try {
      return await apiClient.patch<T>(endpoint, data);
    } catch (error) {
      // Handle authentication errors
      if (error instanceof Error && error.message === 'Unauthorized') {
        await authService.signOut();
        throw new Error("Authentication required");
      }
      throw error;
    }
  },

  // Legacy method for backward compatibility
  async fetchWithAuth<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Extract endpoint from full URL if needed
      const apiBaseUrl = getApiBaseUrl();
      const endpoint = url.replace(apiBaseUrl, '').replace('/api', '');
      
      const method = options.method || 'GET';
      let result: T;

             switch (method.toUpperCase()) {
         case 'POST':
           result = await apiClient.post<T>(endpoint, options.body ? JSON.parse(options.body as string) : {});
           break;
         case 'PUT':
           result = await apiClient.put<T>(endpoint, options.body ? JSON.parse(options.body as string) : {});
           break;
         case 'PATCH':
           result = await apiClient.patch<T>(endpoint, options.body ? JSON.parse(options.body as string) : {});
           break;
         default:
           result = await apiClient.get<T>(endpoint);
        }

        return {
          success: true,
        data: result,
        };
    } catch (error) {
      return {
        success: false,
        data: undefined as T,
        error: {
          message: error instanceof Error ? error.message : 'Request failed',
        },
      };
    }
  },
};
