import {
  FareResponse,
  ApiResponse,
} from "../../components/booking/common/types";
import { Location } from "../../components/map/MapComponent";
import { authService } from "../../lib/auth";

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
    mediumLuggage: number;
    handLuggage: number;
    babySeat: number;
    childSeat: number;
    boosterSeat: number;
    wheelchair: number;
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
          mediumLuggage: 0,
          handLuggage: 0,
          babySeat: 0,
          childSeat: 0,
          boosterSeat: 0,
          wheelchair: 0,
        },
      };
    } else {
      // It's already a FareRequest
      request = initialRequest as FareRequest;
    }

    // Validate and format date
    let formattedDate = "";
    try {
      if (request && request.datetime && request.datetime.date) {
        const dateObj =
          request.datetime.date instanceof Date
            ? request.datetime.date
            : new Date(request.datetime.date);

        // Ensure valid date
        if (isNaN(dateObj.getTime())) {
          throw new Error("Invalid date");
        }

        // Format as YYYY-MM-DD
        formattedDate = dateObj.toISOString().split("T")[0];
      } else {
        // If no date is provided, use current date as fallback
        formattedDate = new Date().toISOString().split("T")[0];
      }
    } catch {
      // Use current date as fallback
      formattedDate = new Date().toISOString().split("T")[0];
    }

    // Validate time format (HH:mm)
    const formattedTime = request.datetime?.time
      ? (() => {
          // Split the time into hours and minutes
          const [hours, minutes] = (request.datetime.time || "12:00")
            .split(":")
            .map(Number);

          // Validate and correct hours
          const validHours = Math.min(Math.max(0, Math.floor(hours)), 23);

          // Validate and correct minutes
          const validMinutes = Math.min(Math.max(0, Math.floor(minutes)), 59);

          // Format back to HH:mm with leading zeros
          return `${validHours.toString().padStart(2, "0")}:${validMinutes
            .toString()
            .padStart(2, "0")}`;
        })()
      : "12:00";

    // Prepare request payload with strict validation
    const payload = {
      locations: {
        pickup: {
          address: request.locations?.pickup?.address || "",
          coordinates: {
            lat: request.locations?.pickup?.coordinates?.lat || 0,
            lng: request.locations?.pickup?.coordinates?.lng || 0,
          },
        },
        dropoff: {
          address: request.locations?.dropoff?.address || "",
          coordinates: {
            lat: request.locations?.dropoff?.coordinates?.lat || 0,
            lng: request.locations?.dropoff?.coordinates?.lng || 0,
          },
        },
        additionalStops:
          request.locations?.additionalStops?.map((stop) => ({
            address: stop.address || "",
            coordinates: {
              lat: stop.coordinates?.lat || 0,
              lng: stop.coordinates?.lng || 0,
            },
          })) || [],
      },
      datetime: {
        date: formattedDate,
        time: formattedTime,
      },
      passengers: {
        // Ensure all passenger fields are present and have a default of 0
        count: Math.max(1, Math.min(Number(request.passengers?.count) || 1, 8)),
        checkedLuggage: Math.max(
          0,
          Math.min(Number(request.passengers?.checkedLuggage) || 0, 8)
        ),
        mediumLuggage: Math.max(
          0,
          Math.min(Number(request.passengers?.mediumLuggage) || 0, 8)
        ),
        handLuggage: Math.max(
          0,
          Math.min(Number(request.passengers?.handLuggage) || 0, 8)
        ),
        babySeat: Math.max(
          0,
          Math.min(Number(request.passengers?.babySeat) || 0, 4)
        ),
        childSeat: Math.max(
          0,
          Math.min(Number(request.passengers?.childSeat) || 0, 4)
        ),
        boosterSeat: Math.max(
          0,
          Math.min(Number(request.passengers?.boosterSeat) || 0, 4)
        ),
        wheelchair: Math.max(
          0,
          Math.min(Number(request.passengers?.wheelchair) || 0, 2)
        ),
      },
    };

    // Validate payload before sending
    if (
      !payload.locations.pickup.address ||
      !payload.locations.dropoff.address
    ) {
      throw new Error("Pickup and dropoff addresses are required");
    }

    if (
      payload.locations.pickup.coordinates.lat === 0 ||
      payload.locations.pickup.coordinates.lng === 0 ||
      payload.locations.dropoff.coordinates.lat === 0 ||
      payload.locations.dropoff.coordinates.lng === 0
    ) {
      throw new Error("Valid coordinates are required for pickup and dropoff");
    }

    // Call API with enhanced request
    const response = await fetch(`${apiUrl}/api/fare-estimate/enhanced`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      // Add these options to ensure our request actually goes through
      cache: "no-store",
      credentials: "include", // Important for cookie-based auth
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

    // Parse the response text as JSON
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      return {
        success: false,
        data: { fare: createEmptyFareResponse() },
        error: {
          code: "PARSE_ERROR",
          message:
            parseError instanceof Error
              ? `Failed to parse server response: ${parseError.message}`
              : "Failed to parse server response",
        },
      };
    }

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
          error instanceof Error
            ? error.message
            : "Invalid request format. Please check your booking details.",
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
