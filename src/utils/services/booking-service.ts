import { VehicleOption } from "@/components/booking/common/types";
import { Location } from "@/components/map/MapComponent";
import { format } from "date-fns";

// Enhanced booking interfaces - exported for documentation and future reference
export interface BookingRequest {
  customer?: {
    fullName: string;
    email: string;
    phone: string;
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
  handLuggage: number;
  selectedVehicle: VehicleOption | null;
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

class BookingService {
  async createBooking(
    personalDetails: PersonalDetails,
    bookingDetails: BookingDetails
  ): Promise<EnhancedBookingResponse["data"]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error("API URL not configured");
    }

    // Make sure we're using the exact endpoint from the documentation
    const endpoint = `${apiUrl}/api/bookings/create-enhanced`;

    try {
      // Format the request according to the API documentation
      const requestData: BookingRequest = {
        customer: {
          fullName: personalDetails.fullName,
          email: personalDetails.email,
          phone: personalDetails.phone,
        },
        booking: {
          locations: {
            pickup: {
              address: bookingDetails.pickupLocation?.address || "",
              coordinates: {
                lat: bookingDetails.pickupLocation?.latitude || 0,
                lng: bookingDetails.pickupLocation?.longitude || 0,
              },
            },
            dropoff: {
              address: bookingDetails.dropoffLocation?.address || "",
              coordinates: {
                lat: bookingDetails.dropoffLocation?.latitude || 0,
                lng: bookingDetails.dropoffLocation?.longitude || 0,
              },
            },
          },
          datetime: {
            date: bookingDetails.selectedDate
              ? format(bookingDetails.selectedDate, "yyyy-MM-dd")
              : "",
            time: bookingDetails.selectedTime || "",
          },
          passengers: {
            count: bookingDetails.passengers || 1,
            checkedLuggage: bookingDetails.checkedLuggage || 0,
            handLuggage: bookingDetails.handLuggage || 0,
          },
          vehicle: {
            id: bookingDetails.selectedVehicle?.id || "",
            name: bookingDetails.selectedVehicle?.name || "",
          },
          specialRequests: personalDetails.specialRequests || "",
        },
      };

      // Add additional stops if present
      if (
        bookingDetails.additionalStops &&
        bookingDetails.additionalStops.length > 0
      ) {
        requestData.booking.locations.additionalStops =
          bookingDetails.additionalStops.map((stop) => ({
            address: stop.address || "",
            coordinates: {
              lat: stop.latitude || 0,
              lng: stop.longitude || 0,
            },
          }));
      }

      // Make the API request
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Use cookies for authentication
        body: JSON.stringify(requestData),
      });

      // Handle 401 unauthorized response
      if (response.status === 401) {
        throw new Error("Authentication required");
      }

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Booking creation failed:",
          data.error?.message || response.statusText
        );

        // Handle rate limiting errors specifically
        if (response.status === 429) {
          console.error("Rate limit exceeded:", data.error?.message);
          throw new Error(
            data.error?.message || "Too many requests, please try again later"
          );
        }

        // Extract detailed error information from the API response
        if (data.error) {
          const message = data.error.message || "Failed to create booking";
          const details = data.error.details ? `: ${data.error.details}` : "";
          throw new Error(`${message}${details}`);
        }

        throw new Error(response.statusText || "Failed to create booking");
      }

      // Add notification handling for any important messages returned with the booking
      if (data.data.notifications && data.data.notifications.length > 0) {
        // You could store these notifications in state or display them to the user
      }

      return data.data;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "An error occurred while creating your booking"
      );
    }
  }

  // Get all user bookings with optional status filtering
  async getUserBookings(
    statusFilter?: string
  ): Promise<GetUserBookingsResponse> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error("API URL not configured");
    }

    try {
      // Construct the URL with optional status filter
      let url = `${apiUrl}/api/bookings/user`;
      if (statusFilter) {
        url += `?status=${encodeURIComponent(statusFilter)}`;
      }

      const response = await fetch(url, {
        credentials: "include", // Use cookies for authentication
      });

      // Handle 401 unauthorized response
      if (response.status === 401) {
        throw new Error("Authentication required");
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting errors specifically
        if (response.status === 429) {
          console.error("Rate limit exceeded:", data.error?.message);
          throw new Error(
            data.error?.message || "Too many requests, please try again later"
          );
        }

        throw new Error(data.error?.message || "Failed to fetch user bookings");
      }

      return data;
    } catch (error) {
      console.error("Error getting user bookings:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "An error occurred while fetching your bookings"
      );
    }
  }

  /**
   * @deprecated Use getUserBookings() instead
   */
  async getActiveBookings(): Promise<ActiveBookingsResponse> {
    console.warn("This method is deprecated. Use getUserBookings() instead.");
    return this.getUserBookings(
      "pending,confirmed"
    ) as Promise<ActiveBookingsResponse>;
  }

  /**
   * @deprecated Use getUserBookings() instead
   */
  async getBookingHistory(): Promise<BookingHistoryResponse> {
    console.warn("This method is deprecated. Use getUserBookings() instead.");
    return this.getUserBookings(
      "assigned,in_progress,completed,cancelled,declined,no_show"
    ) as Promise<BookingHistoryResponse>;
  }

  // Cancel a booking
  async cancelBooking(
    bookingId: string,
    reason: string = "Cancelled by user"
  ): Promise<CancelBookingResponse> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error("API URL not configured");
    }

    try {
      // Ensure we're using the correct URL format with /api prefix
      // If NEXT_PUBLIC_API_URL doesn't include /api, we need to add it
      const url = `${apiUrl}/api/bookings/user/bookings/${bookingId}/cancel`;

      const body = JSON.stringify({ cancellationReason: reason });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Use cookies for authentication
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Booking cancellation failed:",
          data.error?.message || response.statusText
        );

        // Handle rate limiting errors specifically
        if (response.status === 429) {
          console.error("Rate limit exceeded:", data.error?.message);
          throw new Error(
            data.error?.message || "Too many requests, please try again later"
          );
        }

        // Handle 404 errors specifically
        if (response.status === 404) {
          throw new Error(
            "The booking could not be found or the cancellation endpoint is unavailable. Please refresh and try again."
          );
        }

        // Extract detailed error information from the API response
        if (data.error) {
          const message = data.error.message || "Failed to cancel booking";
          const details = data.error.details ? `: ${data.error.details}` : "";
          throw new Error(`${message}${details}`);
        }

        throw new Error(response.statusText || "Failed to cancel booking");
      }

      return data;
    } catch (error) {
      console.error("Error cancelling booking:", error);

      // Check for specific SyntaxError that indicates HTML response
      if (
        error instanceof SyntaxError &&
        error.message.includes("Unexpected token")
      ) {
        throw new Error(
          "Received invalid response from server. The cancellation service may be unavailable."
        );
      }

      throw new Error(
        error instanceof Error
          ? error.message
          : "An error occurred while cancelling your booking"
      );
    }
  }
}

export const bookingService = new BookingService();
