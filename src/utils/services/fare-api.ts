import { FareResponse, ApiResponse } from "@/components/booking/common/types";
import { Location } from "@/components/map/MapComponent";
import { authService } from "@/lib/auth";

interface LocationData {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface FareRequest {
  locations: {
    pickup: LocationData;
    dropoff: LocationData;
    additionalStops?: LocationData[];
  };
  datetime: {
    date: Date | string;
    time: string;
  };
  passengers: {
    count: number;
    checkedLuggage: number;
    handLuggage: number;
  };
}

// Type for enhanced fare response from API
type EnhancedFareResponse = ApiResponse<{ fare: FareResponse }>;

// Convert Location to LocationData
export const locationToLocationData = (location: Location): LocationData => {
  return {
    address: location.address || "",
    coordinates: {
      lat: location.latitude,
      lng: location.longitude,
    },
  };
};

// Function to get fare estimate
export const getFareEstimate = async (
  initialRequest: FareRequest | Location
): Promise<EnhancedFareResponse> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Create a mutable copy of the request that we can modify
    let request: FareRequest;

    // Check if initialRequest is actually a Location object instead of a proper FareRequest
    if (
      initialRequest &&
      "address" in initialRequest &&
      "latitude" in initialRequest &&
      "longitude" in initialRequest &&
      !("locations" in initialRequest)
    ) {
      // We need to convert this Location object to a proper FareRequest
      // This is a fix for when the frontend is passing a single Location object
      // instead of a properly structured FareRequest
      const pickup = initialRequest;

      // Get today's date
      const today = new Date();

      // Create a properly structured request
      request = {
        locations: {
          pickup: locationToLocationData(pickup),
          // We need to have a dropoff - using same location for now
          dropoff: locationToLocationData(pickup),
          additionalStops: [],
        },
        datetime: {
          date: today,
          time: "12:00", // Default to noon
        },
        passengers: {
          count: 1,
          checkedLuggage: 0,
          handLuggage: 0,
        },
      };
    } else {
      // It's already a FareRequest
      request = initialRequest as FareRequest;
    }

    // Format date for API
    let formattedDate = "";
    try {
      if (request && request.datetime && request.datetime.date) {
        if (request.datetime.date instanceof Date) {
          // Ensure date is formatted as YYYY-MM-DD
          formattedDate = request.datetime.date.toISOString().split("T")[0];
        } else if (typeof request.datetime.date === "string") {
          // If it's already a string, try to parse it properly
          try {
            const dateObj = new Date(request.datetime.date);
            formattedDate = dateObj.toISOString().split("T")[0];
          } catch {
            // If parsing fails, use the string directly
            formattedDate = request.datetime.date;
          }
        } else {
          // Convert whatever it is to string
          formattedDate = String(request.datetime.date);
        }
      } else {
        // If no date is provided, use current date as fallback
        formattedDate = new Date().toISOString().split("T")[0];
      }
    } catch {
      // Use current date as fallback
      formattedDate = new Date().toISOString().split("T")[0];
    }

    // Prepare request payload with safeguards for missing data
    const payload = {
      locations: {
        pickup: request.locations?.pickup || {
          address: "",
          coordinates: { lat: 0, lng: 0 },
        },
        dropoff: request.locations?.dropoff || {
          address: "",
          coordinates: { lat: 0, lng: 0 },
        },
        additionalStops: request.locations?.additionalStops || [],
      },
      datetime: {
        date: formattedDate,
        time: request.datetime?.time || "12:00", // Default to noon if time not provided
      },
      passengers: {
        count: Number(request.passengers?.count) || 1,
        checkedLuggage: Number(request.passengers?.checkedLuggage) || 0,
        handLuggage: Number(request.passengers?.handLuggage) || 0,
      },
    };

    // Get auth token using the authService
    const token = authService.getToken();

    if (!token) {
      return {
        success: false,
        data: { fare: createEmptyFareResponse() },
        error: {
          code: "AUTH_ERROR",
          message: "Authentication required. Please sign in to continue.",
        },
      };
    }

    // Check if token should be refreshed before calling API
    if (authService.shouldRefreshToken()) {
      console.log("Auth token needs refreshing, please sign in again");

      // Instead of immediately clearing, just warn the user with an appropriate message
      return {
        success: false,
        data: { fare: createEmptyFareResponse() },
        error: {
          code: "AUTH_REFRESH_REQUIRED",
          message:
            "Your session has expired. Please sign in again to continue.",
        },
      };
    }

    // Call API endpoint - Make sure we're using the exact format from the docs
    const endpoint = `${apiUrl}/api/fare-estimate/enhanced`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      // Add these options to ensure our request actually goes through
      cache: "no-store",
      credentials: "include",
    });

    // Check for 401 Unauthorized responses
    if (response.status === 401) {
      // Use auth service to handle the 401 error (clears auth data)
      authService.handleAuthError(response.status);

      return {
        success: false,
        data: { fare: createEmptyFareResponse() },
        error: {
          code: "AUTH_ERROR",
          message:
            "Your session has expired. Please sign in again to continue.",
        },
      };
    }

    const data = await response.json();

    if (!response.ok) {
      const errorCode = data.error?.code || "UNKNOWN_ERROR";
      const errorMessage =
        data.error?.message || "Failed to retrieve fare estimate";
      const errorDetails = data.error?.details || "";

      return {
        success: false,
        data: { fare: createEmptyFareResponse() },
        error: {
          code: errorCode,
          message: errorMessage,
          details: errorDetails,
        },
      };
    }

    return data as EnhancedFareResponse;
  } catch (error) {
    return {
      success: false,
      data: { fare: createEmptyFareResponse() },
      error: {
        code: "API_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
    };
  }
};

// Helper function to create an empty fare response (for error cases)
function createEmptyFareResponse(): FareResponse {
  return {
    baseFare: 0,
    totalDistance: 0,
    estimatedTime: 0,
    currency: "GBP",
    vehicleOptions: [],
    journey: {
      distance_miles: 0,
      duration_minutes: 0,
    },
    notifications: [],
  };
}
