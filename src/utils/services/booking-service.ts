/**
 * Booking service for handling all booking-related API calls
 * Uses secure HTTP-only cookies for authentication
 * All URLs must be configured via environment variables
 */

import { VehicleOption } from "@/components/booking/common/types";
import { Location } from "@/components/map/MapComponent";
import { format } from "date-fns";
import { apiClient, ApiResponse } from "@/lib/api-client";

import { getApiBaseUrl } from "@/lib/env-validation";

// Enhanced booking interfaces - exported for documentation and future reference
export interface BookingRequest {
  customer?: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  booking: {
    locations: {
      pickup: {
        address: string;
        coordinates: {
          lat: number;
          lng: number;
        };
      };
      dropoff: {
        address: string;
        coordinates: {
          lat: number;
          lng: number;
        };
      };
      additionalStops?: {
        address: string;
        coordinates: {
          lat: number;
          lng: number;
        };
      }[];
    };
    datetime: {
      date: string;
      time: string;
    };
    passengers: {
      count: number;
      checkedLuggage: number;
      handLuggage: number;
      mediumLuggage: number;
      babySeat: number;
      boosterSeat: number;
      childSeat: number;
      wheelchair: number;
    };
    vehicle: {
      id: string;
      name: string;
    };
    specialRequests?: string;
  };
}

export interface EnhancedBookingResponse {
  success: boolean;
  data: {
    bookingId: string;
    message: string;
    details: {
      fullName: string;
      pickupDate: string;
      pickupTime: string;
      pickupLocation: string;
      dropoffLocation: string;
      additionalStops?: string[];
      vehicle: string;
      price: {
        amount: number;
        currency: string;
        breakdown?: {
          baseFare: number;
          distanceCharge: number;
          additionalStopFee: number;
          timeMultiplier: number;
          specialLocationFees: number;
          waitingCharge: number;
        };
      };
      journey: {
        distance_miles: number;
        duration_minutes: number;
      };
      status: string;
      notifications?: string[];
    };
  };
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

interface BookingDetails {
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  additionalStops: Location[];
  selectedDate: Date | undefined;
  selectedTime: string;
  passengers: number;
  checkedLuggage: number;
  mediumLuggage: number;
  handLuggage: number;
  selectedVehicle: VehicleOption | null;
  babySeat: number;
  childSeat: number;
  boosterSeat: number;
  wheelchair: number;
}

interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

export interface ActiveBookingsResponse {
  success: boolean;
  data: {
    id: string;
    pickupDate: string;
    pickupTime: string;
    pickupLocation: {
      address: string;
    };
    dropoffLocation: {
      address: string;
    };
    vehicleType: string;
    price: number;
    status: string;
    journey: {
      distance_miles: number;
      duration_minutes: number;
    };
    createdAt: string;
  }[];
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

export interface BookingHistoryResponse {
  success: boolean;
  data: {
    id: string;
    pickupDate: string;
    pickupTime: string;
    pickupLocation: {
      address: string;
    };
    dropoffLocation: {
      address: string;
    };
    vehicleType: string;
    price: number;
    status: string;
    journey: {
      distance_miles: number;
      duration_minutes: number;
    };
    createdAt: string;
  }[];
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

export interface CancelBookingResponse {
  success: boolean;
  data?: {
    message: string;
    id: string;
    status: string;
  };
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

export interface GetUserBookingsResponse {
  success: boolean;
  data: {
    id: string;
    pickupDate: string;
    pickupTime: string;
    pickupLocation: {
      address: string;
    };
    dropoffLocation: {
      address: string;
    };
    vehicleType: string;
    price: number;
    status: string;
    journey: {
      distance_miles: number;
      duration_minutes: number;
    };
    createdAt: string;
  }[];
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

// Booking service class with updated API client usage
class BookingService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = getApiBaseUrl();
  }

  async createBooking(
    personalDetails: PersonalDetails,
    bookingDetails: BookingDetails
  ): Promise<EnhancedBookingResponse["data"]> {
    try {
      if (!bookingDetails.pickupLocation || !bookingDetails.dropoffLocation) {
        throw new Error("Pickup and dropoff locations are required");
    }

      if (!bookingDetails.selectedDate) {
        throw new Error("Date is required");
      }

      if (!bookingDetails.selectedVehicle) {
        throw new Error("Vehicle selection is required");
      }

      // Format the date properly
      const formattedDate = format(bookingDetails.selectedDate, "yyyy-MM-dd");

      // Strip spaces from phone number for backend validation
      const cleanedPhoneNumber = personalDetails.phone.replace(/\s+/g, '');

      // Prepare the booking request
      const bookingRequest: BookingRequest = {
        // Customer object is optional when user is authenticated
        // The backend will use the stored profile data if customer is omitted
        customer: {
          fullName: personalDetails.fullName,
          email: personalDetails.email,
          phoneNumber: cleanedPhoneNumber,
        },
        booking: {
          locations: {
            pickup: {
              address: bookingDetails.pickupLocation.address || "",
              coordinates: {
                lat: bookingDetails.pickupLocation.latitude,
                lng: bookingDetails.pickupLocation.longitude,
              },
            },
            dropoff: {
              address: bookingDetails.dropoffLocation.address || "",
              coordinates: {
                lat: bookingDetails.dropoffLocation.latitude,
                lng: bookingDetails.dropoffLocation.longitude,
              },
            },
            ...(bookingDetails.additionalStops?.length > 0 && {
              additionalStops: bookingDetails.additionalStops.map((stop) => ({
                address: stop.address || "",
                coordinates: {
                  lat: stop.latitude,
                  lng: stop.longitude,
                },
              }))
            }),
          },
          datetime: {
            date: formattedDate,
            time: bookingDetails.selectedTime,
          },
          passengers: {
            count: bookingDetails.passengers,
            checkedLuggage: bookingDetails.checkedLuggage,
            handLuggage: bookingDetails.handLuggage,
            mediumLuggage: bookingDetails.mediumLuggage,
            babySeat: bookingDetails.babySeat,
            boosterSeat: bookingDetails.boosterSeat,
            childSeat: bookingDetails.childSeat,
            wheelchair: bookingDetails.wheelchair,
          },
          vehicle: {
            id: bookingDetails.selectedVehicle.id,
            name: bookingDetails.selectedVehicle.name,
          },
          specialRequests: personalDetails.specialRequests,
        },
      };



      // Use the API client for the request
      const response = await apiClient.post<EnhancedBookingResponse>(
        "/api/bookings/create-enhanced",
        bookingRequest
      );

      if (!response.success) {
        console.error("Booking creation failed:", response.error);
        throw new Error(response.error?.message || "Failed to create booking");
      }

      return response.data;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }

  async getUserBookings(
    statusFilter?: string
  ): Promise<GetUserBookingsResponse> {
    try {
      let endpoint = "/api/bookings/user";
      if (statusFilter) {
        endpoint += `?status=${encodeURIComponent(statusFilter)}`;
      }

      // Use the API client for the request
      const response = await apiClient.get<GetUserBookingsResponse>(endpoint);

      return response;
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      return {
        success: false,
        data: [],
        error: {
          code: "FETCH_ERROR",
          message:
        error instanceof Error
          ? error.message
              : "Failed to fetch bookings",
        },
      };
    }
  }

  async getActiveBookings(): Promise<ActiveBookingsResponse> {
    try {
      // Use the API client for the request
      const response = await apiClient.get<ActiveBookingsResponse>(
        "/api/bookings/active"
      );

      return response;
    } catch (error) {
      console.error("Error fetching active bookings:", error);
      throw error;
    }
  }

  async getBookingHistory(): Promise<BookingHistoryResponse> {
    try {
      // Use the API client for the request
      const response = await apiClient.get<BookingHistoryResponse>(
        "/api/bookings/history"
      );

      return response;
    } catch (error) {
      console.error("Error fetching booking history:", error);
      throw error;
    }
  }

  async cancelBooking(
    bookingId: string,
    reason: string = "Cancelled by user"
  ): Promise<CancelBookingResponse> {
    try {
      // Use the API client for the request
      const response = await apiClient.post<CancelBookingResponse>(
        `/api/bookings/${bookingId}/cancel`,
        { cancellationReason: reason }
      );

      return response;
    } catch (error) {
      console.error("Error cancelling booking:", error);
      return {
        success: false,
        error: {
          code: "CANCEL_ERROR",
          message:
        error instanceof Error
          ? error.message
              : "Failed to cancel booking",
        },
      };
    }
  }

  // Legacy methods for backward compatibility - now using the unified getUserBookings
  async getActiveBookingsLegacy(): Promise<ActiveBookingsResponse> {
    const response = await this.getUserBookings("pending,confirmed");
    return {
      success: response.success,
      data: response.data,
      error: response.error,
    };
  }

  async getBookingHistoryLegacy(): Promise<BookingHistoryResponse> {
    const response = await this.getUserBookings(
      "assigned,in_progress,completed,cancelled,declined,no_show"
      );
    return {
      success: response.success,
      data: response.data,
      error: response.error,
    };
  }
}

// Create and export a singleton instance
export const bookingService = new BookingService();
