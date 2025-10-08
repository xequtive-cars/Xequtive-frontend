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
    dropoff?: LocationData; // Made optional for hourly bookings
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
  // Enhanced booking type parameters
  bookingType?: 'one-way' | 'hourly' | 'return';
  hours?: number; // Required for hourly bookings (3-24)
  returnDate?: string; // Required for later-date returns (YYYY-MM-DD)
  returnTime?: string; // Required for later-date returns (HH:mm)

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

// Helper function to correct vehicle capacities according to updated API documentation
function correctVehicleCapacities(vehicleOptions: VehicleOption[]): VehicleOption[] {
  // Only correct capacities of existing vehicles - DO NOT add new vehicles
  // The backend should provide all 8 vehicle types with correct pricing
  return vehicleOptions.map(vehicle => {
    // Create a copy of the vehicle to avoid mutating the original
    const correctedVehicle = { ...vehicle };
    
    // Apply correct capacities based on vehicle ID or name
    if (vehicle.id === 'estate' || vehicle.name.toLowerCase().includes('estate')) {
      correctedVehicle.capacity = { ...vehicle.capacity, luggage: 4 };
    } else if (vehicle.id === 'large-mpv' || vehicle.name.toLowerCase().includes('mpv-6')) {
      correctedVehicle.capacity = { ...vehicle.capacity, luggage: 4 };
    } else if (vehicle.id === 'extra-large-mpv' || vehicle.name.toLowerCase().includes('mpv-8')) {
      correctedVehicle.capacity = { ...vehicle.capacity, passengers: 8, luggage: 8 };
    } else if (vehicle.id === 'executive-saloon' || vehicle.name.toLowerCase().includes('executive saloon')) {
      correctedVehicle.capacity = { ...vehicle.capacity, passengers: 4 };
    } else if (vehicle.id === 'executive-mpv' || vehicle.name.toLowerCase().includes('executive mpv')) {
      correctedVehicle.capacity = { ...vehicle.capacity, passengers: 8, luggage: 8 };
    } else if (vehicle.id === 'vip' || vehicle.name.toLowerCase().includes('vip saloon')) {
      correctedVehicle.capacity = { ...vehicle.capacity, passengers: 3, luggage: 2 };
    } else if (vehicle.id === 'vip-mpv' || vehicle.name.toLowerCase().includes('vip mpv') || vehicle.name.toLowerCase().includes('vip suv')) {
      correctedVehicle.capacity = { ...vehicle.capacity, passengers: 6, luggage: 6 };
    } else if (vehicle.id === 'wav' || vehicle.name.toLowerCase().includes('wheelchair') || vehicle.name.toLowerCase().includes('accessible')) {
      correctedVehicle.capacity = { ...vehicle.capacity, passengers: 4, luggage: 2 };
    }
    
    return correctedVehicle;
  });
}

// Main fare estimation function
export const getFareEstimate = async (
  initialRequest: FareRequest | Location
): Promise<EnhancedFareResponse> => {
  try {
    // Check if user is authenticated before making the request
    const isAuthenticated = await authService.isAuthenticated();
    if (!isAuthenticated) {
      return {
        success: false,
        data: { fare: createEmptyFareResponse() },
        error: {
          message: "Authentication required. Please sign in to calculate fares.",
        },
      };
    }

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
    const payload: any = {
      locations: {
        pickup: {
          address: request.locations?.pickup?.address || "",
          coordinates: {
            lat: request.locations?.pickup?.coordinates?.lat || 0,
            lng: request.locations?.pickup?.coordinates?.lng || 0,
          },
        },
        ...(request.locations?.dropoff && {
          dropoff: {
            address: request.locations.dropoff.address || "",
            coordinates: {
              lat: request.locations.dropoff.coordinates.lat || 0,
              lng: request.locations.dropoff.coordinates.lng || 0,
            },
          },
        }),
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
      // Add enhanced booking parameters if provided
      ...(request.bookingType && { bookingType: request.bookingType }),
      ...(request.hours && { hours: request.hours }),
      ...(request.returnDate && { returnDate: request.returnDate }),
      ...(request.returnTime && { returnTime: request.returnTime }),
      
    };

    // Validate payload before sending
    if (!payload.locations.pickup.address) {
      throw new Error("Pickup address is required");
    }

    // For hourly bookings, dropoff is optional
    if (request.bookingType !== 'hourly' && !request.locations?.dropoff?.address) {
      throw new Error("Dropoff address is required for non-hourly bookings");
    }

    if (
      payload.locations.pickup.coordinates.lat === 0 ||
      payload.locations.pickup.coordinates.lng === 0
    ) {
      throw new Error("Valid coordinates are required for pickup");
    }

    // Validate dropoff coordinates if present
    if (payload.locations.dropoff && (
      payload.locations.dropoff.coordinates.lat === 0 ||
      payload.locations.dropoff.coordinates.lng === 0
    )) {
      throw new Error("Valid coordinates are required for dropoff");
    }

    // Validate enhanced parameters
    if (request.bookingType === 'hourly') {
      const hoursValue = request.hours;
    if (!hoursValue || hoursValue < 3 || hoursValue > 24) {
      throw new Error("Hours must be between 3 and 24 for hourly bookings");
    }
    }

    if (request.bookingType === 'return') {
      if (!request.returnDate || !request.returnTime) {
        throw new Error("Return date and time are required for return bookings");
      }
    }

    // Use the API client for the request
    try {
      const response = await apiClient.post<{ success: boolean; data: { fare: FareResponse } }>(
        "/api/fare-estimate/enhanced",
        payload
      );

      // The API client returns the full backend response, so we need to extract the fare data
      if (response.success && response.data && response.data.fare) {
        // Correct vehicle capacities before returning
        const correctedFare = {
          ...response.data.fare,
          vehicleOptions: correctVehicleCapacities(response.data.fare.vehicleOptions)
        };
        
        return {
          success: true,
          data: { fare: correctedFare },
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
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        return {
          success: false,
          data: { fare: createEmptyFareResponse() },
          error: {
            message: "Authentication required. Please sign in to calculate fares.",
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
