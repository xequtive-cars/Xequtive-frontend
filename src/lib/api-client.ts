/**
 * Centralized API client for making authenticated requests
 * Uses secure HTTP-only cookies for authentication
 * All URLs must be configured via environment variables
 */

import { getApiBaseUrl } from "./env-validation";

// Create the API client with secure defaults
const createApiClient = () => {
  const baseURL = getApiBaseUrl();
  
  return {
    baseURL,
    
    // Generic request method with automatic error handling
    async request<T>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<T> {
      const url = `${baseURL}${endpoint}`;
      
      const config: RequestInit = {
        credentials: 'include', // CRITICAL: Required for cookies
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      try {
        const response = await fetch(url, config);
        
        // Handle 401 errors by dispatching auth error event
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth_error'));
          }
          throw new Error('Authentication required');
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error(`API request failed: ${endpoint}`, error);
        throw error;
      }
    },

    // Convenience methods for different HTTP verbs
    async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
      return this.request<T>(endpoint, { ...options, method: 'GET' });
    },

    async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
      return this.request<T>(endpoint, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
      return this.request<T>(endpoint, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
      return this.request<T>(endpoint, {
        ...options,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
      return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    },
  };
};

// Export the API client instance
export const apiClient = createApiClient();

// Export the base URL getter for backward compatibility
export { getApiBaseUrl };

// Export types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: string;
    code?: string;
  };
}

// Helper function for handling API responses
export const handleApiResponse = <T>(response: ApiResponse<T>): T => {
  if (!response.success) {
    throw new Error(response.error?.message || 'API request failed');
  }
  return response.data as T;
}; 