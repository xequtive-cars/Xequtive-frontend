import { Location } from "@/components/map/MapComponent";
import { format } from "date-fns";
import { FareResponse } from "@/components/booking/common/types";
import axios from "axios";
import { authService } from "@/lib/auth";

// Custom error class for authentication errors
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

// Real API fare estimation
export async function getFareEstimate(
  pickupLocation: Location,
  dropoffLocation: Location,
  additionalStops: Location[],
  selectedDate: Date | undefined,
  selectedTime: string,
  passengers: number,
  checkedLuggage: number,
  handLuggage: number
): Promise<FareResponse> {
  try {
    // Format date as string or fallback
    const formattedDate = selectedDate
      ? format(selectedDate, "yyyy-MM-dd")
      : "";

    // Ensure date is valid before continuing
    if (!formattedDate && selectedDate) {
      throw new Error("Invalid date format");
    }

    // Prepare request payload according to the enhanced API spec
    const requestPayload = {
      locations: {
        pickup: {
          address: pickupLocation.address || "",
          coordinates: {
            lat: pickupLocation.latitude,
            lng: pickupLocation.longitude,
          },
        },
        dropoff: {
          address: dropoffLocation.address || "",
          coordinates: {
            lat: dropoffLocation.latitude,
            lng: dropoffLocation.longitude,
          },
        },
        // Make additionalStops optional to match the API's expectations
        ...(additionalStops.length > 0 && {
          additionalStops: additionalStops.map((stop) => ({
            address: stop.address || "",
            coordinates: {
              lat: stop.latitude,
              lng: stop.longitude,
            },
          })),
        }),
      },
      datetime: {
        date: formattedDate,
        time: selectedTime,
      },
      passengers: {
        count: passengers,
        checkedLuggage: checkedLuggage,
        handLuggage: handLuggage,
      },
    };

    // Get authentication token
    const token = authService.getToken();

    if (!token) {
      console.error("No authentication token available");
      throw new AuthError(
        "Authentication required. Please sign in to continue."
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555";
    const endpoint = `${apiUrl}/api/fare-estimate/enhanced`;

    const response = await axios({
      method: "post",
      url: endpoint,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: requestPayload,
      timeout: 10000,
    });

    // Check if we have the expected data structure before returning
    if (!response.data?.data?.fare) {
      console.warn("Response data doesn't contain expected fare structure");
      return getFallbackMockData();
    }

    // Return the API response data properly formatted
    return response.data.data.fare;
  } catch (error) {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      // Handle unauthorized error
      if (error.response?.status === 401) {
        await authService.signOut();
        throw new AuthError("Authentication failed. Please sign in again.");
      }

      // Handle API error responses
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
    }

    // Check if this is an auth error that should be re-thrown
    if (error instanceof AuthError) {
      throw error;
    }

    // For all other errors, use fallback data in development
    if (process.env.NODE_ENV !== "production") {
      console.error("Using fallback data due to error:", error);
      return getFallbackMockData();
    }

    // In production, throw the error
    throw error;
  }
}

// Fallback function for development with mock data
function getFallbackMockData(): FareResponse {
  // Match the FareResponse structure expected by the component
  return {
    estimatedDistance: 25.3,
    estimatedTime: 42,
    fare: {
      baseFare: 45.0,
      currency: "£",
      total: 55.5,
    },
    vehicleOptions: [
      {
        id: "standard-saloon",
        name: "Standard Saloon",
        description: "Comfortable sedan for up to 4 passengers",
        capacity: {
          passengers: 4,
          luggage: 2,
        },
        price: {
          amount: 55.5,
          currency: "£",
        },
        eta: 5,
        imageUrl: "/cars/standard-saloon.png",
        features: ["Air Conditioning", "4 Passengers", "2 Luggage"],
      },
      {
        id: "executive-saloon",
        name: "Executive Saloon",
        description: "Premium sedan with extra comfort",
        capacity: {
          passengers: 4,
          luggage: 2,
        },
        price: {
          amount: 75.5,
          currency: "£",
        },
        eta: 7,
        imageUrl: "/cars/executive-saloon.png",
        features: [
          "Air Conditioning",
          "WiFi",
          "4 Passengers",
          "2 Luggage",
          "Bottled Water",
        ],
      },
      {
        id: "executive-mpv",
        name: "Executive MPV",
        description: "Spacious vehicle for groups or extra luggage",
        capacity: {
          passengers: 7,
          luggage: 5,
        },
        price: {
          amount: 95.5,
          currency: "£",
        },
        eta: 10,
        imageUrl: "/cars/executive-mpv.png",
        features: [
          "Air Conditioning",
          "WiFi",
          "7 Passengers",
          "5 Luggage",
          "Bottled Water",
        ],
      },
      {
        id: "luxury-vehicle",
        name: "Luxury Vehicle",
        description: "Premium luxury experience with the finest amenities",
        capacity: {
          passengers: 4,
          luggage: 3,
        },
        price: {
          amount: 135.5,
          currency: "£",
        },
        eta: 15,
        imageUrl: "/cars/luxury-vehicle.png",
        features: [
          "Air Conditioning",
          "WiFi",
          "4 Passengers",
          "3 Luggage",
          "Premium Amenities",
          "Refreshments",
        ],
      },
    ],
  };
}

// Mock function to calculate fare estimates
export const getFareEstimateMock = async (
  pickupLocation: Location | null,
  dropoffLocation: Location | null,
  additionalStops: Location[],
  selectedDate: Date | undefined,
  selectedTime: string,
  passengers: number,
  checkedLuggage: number,
  handLuggage: number
): Promise<FareResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Calculate mock distance and duration
  let distance = 0;
  let duration = 0;

  if (pickupLocation && dropoffLocation) {
    // Basic distance calculation (very simplified)
    const deltaLat = pickupLocation.latitude - dropoffLocation.latitude;
    const deltaLng = pickupLocation.longitude - dropoffLocation.longitude;
    distance = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng) * 111; // Rough km
    duration = distance * 2 + 10; // Rough minutes
  }

  // Add distance for additional stops
  for (let i = 0; i < additionalStops.length; i++) {
    if (i === 0 && pickupLocation) {
      const stop = additionalStops[i];
      const deltaLat = pickupLocation.latitude - stop.latitude;
      const deltaLng = pickupLocation.longitude - stop.longitude;
      const d = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng) * 111;
      distance += d;
      duration += d * 2 + 5; // 5 min for stop
    } else if (i > 0) {
      const prevStop = additionalStops[i - 1];
      const currStop = additionalStops[i];
      const deltaLat = prevStop.latitude - currStop.latitude;
      const deltaLng = prevStop.longitude - currStop.longitude;
      const d = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng) * 111;
      distance += d;
      duration += d * 2 + 5; // 5 min for stop
    }
  }

  // Last stop to destination
  if (additionalStops.length > 0 && dropoffLocation) {
    const lastStop = additionalStops[additionalStops.length - 1];
    const deltaLat = lastStop.latitude - dropoffLocation.latitude;
    const deltaLng = lastStop.longitude - dropoffLocation.longitude;
    const d = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng) * 111;
    distance += d;
    duration += d * 2;
  }

  // Base fare calculation
  const baseFare = 20 + distance * 1.5;

  // Adjust for passengers and luggage
  const passengerSurcharge = (passengers - 1) * 5;
  const luggageSurcharge = (checkedLuggage + handLuggage) * 3;

  // Total fare
  const totalFare = baseFare + passengerSurcharge + luggageSurcharge;

  // Round to 2 decimal places
  const roundedDistance = Math.round(distance * 10) / 10;
  const roundedDuration = Math.round(duration);
  const roundedBaseFare = Math.round(baseFare * 100) / 100;
  const roundedTotalFare = Math.round(totalFare * 100) / 100;

  // Return mock fare data
  return {
    estimatedDistance: roundedDistance,
    estimatedTime: roundedDuration,
    fare: {
      baseFare: roundedBaseFare,
      currency: "£",
      total: roundedTotalFare,
    },
    vehicleOptions: [
      {
        id: "standard-sedan",
        name: "Standard Sedan",
        description: "Comfortable ride for up to 4 passengers",
        capacity: {
          passengers: 4,
          luggage: 3,
        },
        price: {
          amount: roundedTotalFare,
          currency: "£",
        },
        eta: 5,
        imageUrl: "/images/vehicles/sedan.jpg",
        features: ["Air conditioning", "Wi-Fi"],
      },
      {
        id: "executive-sedan",
        name: "Executive Sedan",
        description: "Premium ride with extra comfort",
        capacity: {
          passengers: 4,
          luggage: 3,
        },
        price: {
          amount: roundedTotalFare * 1.5,
          currency: "£",
        },
        eta: 8,
        imageUrl: "/images/vehicles/executive.jpg",
        features: [
          "Leather seats",
          "Air conditioning",
          "Wi-Fi",
          "Bottled water",
        ],
      },
      {
        id: "luxury-suv",
        name: "Luxury SUV",
        description: "Spacious premium vehicle for up to 6 passengers",
        capacity: {
          passengers: 6,
          luggage: 5,
        },
        price: {
          amount: roundedTotalFare * 2,
          currency: "£",
        },
        eta: 12,
        imageUrl: "/images/vehicles/suv.jpg",
        features: [
          "Leather seats",
          "Air conditioning",
          "Wi-Fi",
          "Bottled water",
        ],
      },
    ],
  };
};
