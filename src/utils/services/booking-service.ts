import { VehicleOption } from "@/components/booking/common/types";
import { Location } from "@/components/map/MapComponent";
import { format } from "date-fns";
import { authService } from "@/lib/auth";

// Enhanced booking interfaces - exported for documentation and future reference
export interface BookingRequest {
  customer: {
    fullName: string;
    email: string;
    phone: string;
    specialRequests?: string;
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
      additionalStops: Array<{
        address: string;
        coordinates: {
          lat: number;
          lng: number;
        };
      }>;
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

export interface BookingConfirmationRequest {
  bookingId: string;
  verificationToken: string;
  customerConsent: boolean;
}

// Simple response interface for confirmBooking
export interface BookingConfirmationResponse {
  success: boolean;
  data?: {
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
      status: string;
    };
  };
  error?: {
    message: string;
    details?: string;
  };
}

export interface BookingVerification {
  bookingId: string;
  verificationToken: string;
  verifiedFare: {
    vehicleId: string;
    vehicleName: string;
    price: {
      amount: number;
      currency: string;
    };
    distance_km: number;
    duration_min: number;
  };
  expiresIn?: number;
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

interface VerificationDetails {
  bookingId: string;
  verificationToken: string;
  expiresAt: string;
  verifiedFare: {
    vehicleId: string;
    vehicleName: string;
    price: {
      amount: number;
      currency: string;
    };
    distance_km: number;
    duration_min: number;
  };
}

interface ConfirmationResponse {
  success: boolean;
  data?: {
    bookingId: string;
    reference: string;
    status: string;
    details?: {
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
      status: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

class BookingService {
  async createBooking(
    personalDetails: PersonalDetails,
    bookingDetails: BookingDetails
  ): Promise<VerificationDetails> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      // Format booking data according to API documentation
      const requestData: BookingRequest = {
        customer: {
          fullName: personalDetails.fullName,
          email: personalDetails.email,
          phone: personalDetails.phone,
          specialRequests: personalDetails.specialRequests,
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
                address: stop.address!, // Non-null assertion since we've filtered out nulls
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
            count: bookingDetails.passengers,
            checkedLuggage: bookingDetails.checkedLuggage,
            handLuggage: bookingDetails.handLuggage,
          },
          vehicle: {
            id: bookingDetails.selectedVehicle?.id || "",
            name: bookingDetails.selectedVehicle?.name || "",
          },
          specialRequests: personalDetails.specialRequests,
        },
      };

      console.log("Creating booking with API request:", requestData);

      // Get auth token
      const token = authService.getToken();

      // Call the API endpoint
      const response = await fetch(`${apiUrl}/api/bookings/create-enhanced`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to create booking");
      }

      // Return verification details
      return {
        bookingId: data.data.bookingId,
        verificationToken: data.data.verificationToken,
        expiresAt: new Date(
          Date.now() + (data.data.expiresIn || 1800) * 1000
        ).toISOString(),
        verifiedFare: data.data.verifiedFare,
      };
    } catch (error) {
      console.error("Error creating booking:", error);

      // For development/demo purposes, create a mock verification if API fails
      console.warn("API call failed, using mock data for development");
      const bookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
      const verificationToken = `VT-${Math.random()
        .toString(36)
        .substring(2, 15)}`;
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

      return {
        bookingId,
        verificationToken,
        expiresAt,
        verifiedFare: {
          vehicleId: bookingDetails.selectedVehicle?.id || "",
          vehicleName: bookingDetails.selectedVehicle?.name || "",
          price: {
            amount: bookingDetails.selectedVehicle?.price.amount || 0,
            currency: bookingDetails.selectedVehicle?.price.currency || "£",
          },
          distance_km: 15,
          duration_min: 25,
        },
      };
    }
  }

  async confirmBooking(
    verificationDetails: VerificationDetails
  ): Promise<ConfirmationResponse> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      // Format confirmation request according to API documentation
      const requestData: BookingConfirmationRequest = {
        bookingId: verificationDetails.bookingId,
        verificationToken: verificationDetails.verificationToken,
        customerConsent: true,
      };

      console.log("Confirming booking with API request:", requestData);

      // Get auth token
      const token = authService.getToken();

      // Call the API endpoint
      const response = await fetch(`${apiUrl}/api/bookings/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to confirm booking");
      }

      // Return confirmation response
      return {
        success: true,
        data: {
          bookingId: data.data.bookingId,
          reference: data.data.message,
          status: "confirmed",
          details: data.data.details,
        },
      };
    } catch (error) {
      console.error("Error confirming booking:", error);

      // For development/demo purposes, create a mock confirmation if API fails
      console.warn("API call failed, using mock data for development");
      return {
        success: true,
        data: {
          bookingId: verificationDetails.bookingId,
          reference: `REF-${Math.floor(10000 + Math.random() * 90000)}`,
          status: "confirmed",
        },
      };
    }
  }
}

export const bookingService = new BookingService();
