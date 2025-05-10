import { VehicleOption } from "@/components/booking/common/types";
import { Location } from "@/components/map/MapComponent";
import { format } from "date-fns";
import { authService } from "@/lib/auth";

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
      vehicle: string;
      price: {
        amount: number;
        currency: string;
      };
      journey: {
        distance_km: number;
        duration_min: number;
      };
      status: string;
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
      distance_km: number;
      duration_min: number;
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
      distance_km: number;
      duration_min: number;
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
      distance_km: number;
      duration_min: number;
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
      // Get authentication token
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

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
            additionalStops: bookingDetails.additionalStops
              .filter(
                (stop) =>
                  stop && stop.address && typeof stop.address === "string"
              )
              .map((stop) => ({
                address: stop.address!,
                coordinates: {
                  lat: stop.latitude,
                  lng: stop.longitude,
                },
              })),
          },
          datetime: {
            date: bookingDetails.selectedDate
              ? format(bookingDetails.selectedDate, "yyyy-MM-dd")
              : format(new Date(), "yyyy-MM-dd"),
            time: bookingDetails.selectedTime,
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
          specialRequests: personalDetails.specialRequests,
        },
      };

      console.log("Sending booking request to:", endpoint);
      console.log("Request data:", JSON.stringify(requestData, null, 2));

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log("Booking response:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error(
          "Booking creation failed:",
          data.error?.message || response.statusText
        );

        // Extract detailed error information from the API response
        if (data.error) {
          const message = data.error.message || "Failed to create booking";
          const details = data.error.details ? `: ${data.error.details}` : "";
          throw new Error(`${message}${details}`);
        }

        throw new Error(response.statusText || "Failed to create booking");
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
      // Get authentication token
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      // Construct the URL with optional status filter
      let url = `${apiUrl}/api/bookings/user`;
      if (statusFilter) {
        url += `?status=${encodeURIComponent(statusFilter)}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
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
      // Get authentication token
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      // The documentation has an inconsistency between examples and specification
      // Our working endpoint is: `/api/bookings/user/bookings/${bookingId}/cancel`
      // which aligns with the text description in the documentation
      const url = `${apiUrl}/api/bookings/user/bookings/${bookingId}/cancel`;
      console.log("Sending cancellation request to:", url);

      const body = JSON.stringify({ cancellationReason: reason });
      console.log("Cancellation request body:", body);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      const data = await response.json();
      console.log("Cancellation response:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error(
          "Booking cancellation failed:",
          data.error?.message || response.statusText
        );

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
      throw new Error(
        error instanceof Error
          ? error.message
          : "An error occurred while cancelling your booking"
      );
    }
  }
}

export const bookingService = new BookingService();
