import axios from "axios";

// Base URL from environment variable (should be without /api)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_BASE_URL = BASE_URL ? `${BASE_URL}/api` : undefined;

if (!BASE_URL) {
  console.error("NEXT_PUBLIC_API_URL environment variable is not defined");
}

// Define interfaces for API data
interface Location {
  address: string;
  coordinates: { lat: number; lng: number };
}

interface BookingData {
  fullName: string;
  email: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  additionalStops?: Location[];
  passengers: number;
  checkedLuggage?: number;
  handLuggage?: number;
  preferredVehicle: string;
  specialRequests?: string;
  fareEstimate: number;
}

interface BookingUpdateData {
  status?: string;
  pickupTime?: string;
  specialRequests?: string;
  fareEstimate?: number;
}

// Simple token getter
const getToken = async (): Promise<string | null> => {
  const token = localStorage.getItem("auth-token");
  return token;
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// Add interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized - redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("auth-token");
      if (typeof window !== "undefined") {
        window.location.href = "/auth/signin";
      }
    }

    return Promise.reject(error);
  }
);

// Add interceptor to add auth token to every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error("Error in auth interceptor:", error);
    return config;
  }
});

// Utility functions for API endpoints
export const apiService = {
  // Auth endpoints
  auth: {
    register: async (data: {
      fullName: string;
      email: string;
      password: string;
    }) => {
      return api.post("/auth/register", data);
    },
    signin: async (email: string, password: string) => {
      return api.post("/auth/signin", { email, password });
    },
  },

  // Fare estimation endpoint
  fareEstimate: async (data: {
    pickupLocation: { lat: number; lng: number };
    dropoffLocation: { lat: number; lng: number };
    additionalStops?: Array<{ lat: number; lng: number }>;
    vehicleType: string;
  }) => {
    return api.post("/fare-estimate", data);
  },

  // New enhanced fare estimation endpoint
  enhancedFareEstimate: async (data: {
    locations: {
      pickup: { address: string; coordinates: { lat: number; lng: number } };
      dropoff: { address: string; coordinates: { lat: number; lng: number } };
      additionalStops?: Array<{
        address: string;
        coordinates: { lat: number; lng: number };
      }>;
    };
    datetime: { date: string; time: string };
    passengers: { count: number; checkedLuggage: number; handLuggage: number };
  }) => {
    return api.post("/fare-estimate/enhanced", data);
  },

  // Booking endpoints
  bookings: {
    create: async (bookingData: BookingData) => {
      return api.post("/bookings/create", bookingData);
    },
    getAll: async () => {
      return api.get("/bookings");
    },
    getById: async (id: string) => {
      return api.get(`/bookings/${id}`);
    },
    update: async (id: string, data: BookingUpdateData) => {
      return api.put(`/bookings/${id}`, data);
    },
    delete: async (id: string) => {
      return api.delete(`/bookings/${id}`);
    },
  },
};

export default api;
