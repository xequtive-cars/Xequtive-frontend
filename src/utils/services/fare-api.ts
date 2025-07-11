/**
 * Fare API service for handling fare calculations
 * Uses secure HTTP-only cookies for authentication
 * All URLs must be configured via environment variables
 */

import { VehicleOption } from "@/components/booking/common/types";
import { Location } from "@/components/map/MapComponent";
import { authService } from "@/lib/auth";
import { apiClient, ApiResponse } from "@/lib/api-client";

import { getApiBaseUrl } from "@/lib/env-validation";

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
    stops?: LocationData[];
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

type EnhancedFareResponse = ApiResponse<{ fare: FareResponse }>;

// Helper function to convert Location to LocationData
export const locationToLocationData = (location: Location): LocationData => {
  return {
    address: location.address || "",
    coordinates: {
      lat: location.latitude,
      lng: location.longitude,
    },
  };
};

// Main fare estimation function
export const getFareEstimate = async (
  initialRequest: FareRequest | Location
): Promise<EnhancedFareResponse> => {
  try {
    // If the request is a Location object, convert it to a FareRequest
    let request: FareRequest;
    if ("latitude" in initialRequest && "longitude" in initialRequest) {
      // This is a Location object, convert it
      request = {
        locations: {
          pickup: locationToLocationData(initialRequest),
          dropoff: locationToLocationData(initialRequest), // Same as pickup for now
        },
        datetime: {
          date: new Date(),
          time: "12:00",
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
      request = initialRequest;
    }

    // Validate and format date
    let formattedDate: string;
    if (request.datetime?.date instanceof Date) {
      formattedDate = request.datetime.date.toISOString().split("T")[0];
    } else if (typeof request.datetime?.date === "string") {
      formattedDate = request.datetime.date;
      } else {
      // Default to today's date
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
        stops:
          request.locations?.stops
            ?.filter((stop: LocationData) => stop.address && stop.address.trim() !== "")
            ?.map((stop: LocationData) => stop.address) || [],
      },
      datetime: {
        date: formattedDate,
        time: formattedTime,
      },
      passengers: {
        // Ensure all passenger fields are present and have a default of 0
        count: Math.max(1, Math.min(Number(request.passengers?.count) || 1, 16)),
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
          Math.min(Number(request.passengers?.babySeat) || 0, 5)
        ),
        childSeat: Math.max(
          0,
          Math.min(Number(request.passengers?.childSeat) || 0, 5)
        ),
        boosterSeat: Math.max(
          0,
          Math.min(Number(request.passengers?.boosterSeat) || 0, 5)
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

    // Use the API client for the request
    try {
      const response = await apiClient.post<{ success: boolean; data: { fare: FareResponse } }>(
        "/api/fare-estimate/enhanced",
        payload
      );

      // The API client returns the full backend response, so we need to extract the fare data
      if (response.success && response.data && response.data.fare) {
        return {
          success: true,
          data: { fare: response.data.fare },
        };
      } else {
      return {
        success: false,
        data: { fare: createEmptyFareResponse() },
        error: {
            message: "Invalid response format from server",
        },
      };
    }
    } catch (error) {
      // Handle 401 Unauthorized responses
      if (error instanceof Error && error.message === 'Unauthorized') {
      return {
        success: false,
        data: { fare: createEmptyFareResponse() },
        error: {
          message:
              "Your session has expired. Please sign in again to continue.",
        },
      };
    }

      return {
        success: false,
        data: { fare: createEmptyFareResponse() },
        error: {
           message:
             error instanceof Error
               ? error.message
               : "Failed to retrieve fare estimate",
        },
      };
    }
  } catch (error) {
    return {
      success: false,
      data: { fare: createEmptyFareResponse() },
      error: {
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

// FareResponse interface
interface FareResponse {
  baseFare: number;
  totalDistance: number;
  estimatedTime: number;
  currency: string;
  vehicleOptions: VehicleOption[];
  journey: {
    distance_miles: number;
    duration_minutes: number;
  };
  notifications: string[];
}
