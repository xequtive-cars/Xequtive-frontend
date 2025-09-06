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
    travelInformation?: {
      type: "flight";
      details: {
        type: "flight"; // Add type field in details
        airline?: string;
        flightNumber?: string;
        departureAirport?: string;
        scheduledDeparture?: string;
      };
    } | {
      type: "train";
      details: {
        type: "train"; // Add type field in details
        trainOperator?: string;
        trainNumber?: string;
        departureStation?: string;
        scheduledDeparture?: string;
      };
    };
  };
}

export interface EnhancedBookingResponse {
  success: boolean;
  data: {
    bookingId: string;
    referenceNumber?: string;
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
  travelInformation?: {
    type: "flight" | "train";
    details: {
      airline?: string;
      flightNumber?: string;
      departureAirport?: string;
      arrivalAirport?: string;
      scheduledDeparture?: string;
      actualDeparture?: string;
      status?: "on-time" | "delayed" | "cancelled";
      trainOperator?: string;
      trainNumber?: string;
      departureStation?: string;
      arrivalStation?: string;
    };
  };
}

interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  specialRequests: string;
  flightInformation?: {
    airline?: string;
    flightNumber?: string;
    scheduledDeparture?: string;
    status?: "on-time" | "delayed" | "cancelled";
  };
  trainInformation?: {
    trainOperator?: string;
    trainNumber?: string;
    scheduledDeparture?: string;
    status?: "on-time" | "delayed" | "cancelled";
  };
}

export interface ActiveBookingsResponse {
  success: boolean;
  data: {
    bookings: {
      id: string;
      referenceNumber?: string;
      customer: {
        fullName: string;
        email: string;
        phoneNumber: string;
      };
      bookingType: 'one-way' | 'hourly' | 'return';
      status: string;
      pickupDate: string;
      pickupTime: string;
      locations: {
        pickup: {
          address: string;
          coordinates?: {
            lat: number;
            lng: number;
          };
        };
        dropoff?: {
          address: string;
          coordinates?: {
            lat: number;
            lng: number;
          };
        };
        additionalStops: Array<{
          address: string;
          coordinates?: {
            lat: number;
            lng: number;
          };
        }>;
      };
      vehicle: {
        id: string;
        name: string;
        price: {
          amount: number;
          currency: string;
        };
      };
      journey?: {
        distance_miles: number;
        duration_minutes: number;
      };
      hours?: number;
      returnType?: 'wait-and-return' | 'later-date';
      returnDate?: string;
      returnTime?: string;
      passengers: {
        count: number;
        checkedLuggage: number;
        handLuggage: number;
        mediumLuggage: number;
        babySeat: number;
        childSeat: number;
        boosterSeat: number;
        wheelchair: number;
      };
      specialRequests?: string;
      additionalStops: Array<{
        address: string;
      }>;
      waitingTime: number;
      travelInformation?: any;
      createdAt: string;
      updatedAt: string;
    }[];
    total: number;
    referenceNumberGuide: {
      display: string;
      apiOperations: string;
      warning: string;
    };
    bookingTypeDefinitions: {
      hourly: string;
      'one-way': string;
      return: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

export interface BookingHistoryResponse {
  success: boolean;
  data: {
    bookings: {
      id: string;
      referenceNumber?: string;
      customer: {
        fullName: string;
        email: string;
        phoneNumber: string;
      };
      bookingType: 'one-way' | 'hourly' | 'return';
      status: string;
      pickupDate: string;
      pickupTime: string;
      locations: {
        pickup: {
          address: string;
          coordinates?: {
            lat: number;
            lng: number;
          };
        };
        dropoff?: {
          address: string;
          coordinates?: {
            lat: number;
            lng: number;
          };
        };
        additionalStops: Array<{
          address: string;
          coordinates?: {
            lat: number;
            lng: number;
          };
        }>;
      };
      vehicle: {
        id: string;
        name: string;
        price: {
          amount: number;
          currency: string;
        };
      };
      journey?: {
        distance_miles: number;
        duration_minutes: number;
      };
      hours?: number;
      returnType?: 'wait-and-return' | 'later-date';
      returnDate?: string;
      returnTime?: string;
      passengers: {
        count: number;
        checkedLuggage: number;
        handLuggage: number;
        mediumLuggage: number;
        babySeat: number;
        childSeat: number;
        boosterSeat: number;
        wheelchair: number;
      };
      specialRequests?: string;
      additionalStops: Array<{
        address: string;
      }>;
      waitingTime: number;
      travelInformation?: any;
      createdAt: string;
      updatedAt: string;
    }[];
    total: number;
    referenceNumberGuide: {
      display: string;
      apiOperations: string;
      warning: string;
    };
    bookingTypeDefinitions: {
      hourly: string;
      'one-way': string;
      return: string;
    };
  };
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
    bookings: {
      id: string;
      referenceNumber?: string;
      customer: {
        fullName: string;
        email: string;
        phoneNumber: string;
      };
      bookingType: 'one-way' | 'hourly' | 'return';
      status: string;
      pickupDate: string;
      pickupTime: string;
      locations: {
        pickup: {
          address: string;
          coordinates?: {
            lat: number;
            lng: number;
          };
        };
        dropoff?: {
          address: string;
          coordinates?: {
            lat: number;
            lng: number;
          };
        };
        additionalStops: Array<{
          address: string;
          coordinates?: {
            lat: number;
            lng: number;
          };
        }>;
      };
      vehicle: {
        id: string;
        name: string;
        price: {
          amount: number;
          currency: string;
        };
      };
      journey?: {
        distance_miles: number;
        duration_minutes: number;
      };
      hours?: number;
      returnType?: 'wait-and-return' | 'later-date';
      returnDate?: string;
      returnTime?: string;
      passengers: {
        count: number;
        checkedLuggage: number;
        handLuggage: number;
        mediumLuggage: number;
        babySeat: number;
        childSeat: number;
        boosterSeat: number;
        wheelchair: number;
      };
      specialRequests?: string;
      additionalStops: Array<{
        address: string;
      }>;
      waitingTime: number;
      travelInformation?: any;
      createdAt: string;
      updatedAt: string;
    }[];
    total: number;
    referenceNumberGuide: {
      display: string;
      apiOperations: string;
      warning: string;
    };
    bookingTypeDefinitions: {
      hourly: string;
      'one-way': string;
      return: string;
    };
  };
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

      // Format the date for the backend
      const formattedDate = format(bookingDetails.selectedDate, "yyyy-MM-dd");

      // Strip spaces from phone number for backend validation
      const cleanedPhoneNumber = personalDetails.phone.replace(/\s+/g, '');

      // Construct travel information based on personal details
      let travelInformation: BookingRequest['booking']['travelInformation'] = undefined;
      
      if (personalDetails.flightInformation && 
          personalDetails.flightInformation.airline && 
          personalDetails.flightInformation.flightNumber && 
          personalDetails.flightInformation.scheduledDeparture) {
        travelInformation = {
          type: "flight",
          details: {
            type: "flight", // Add type field in details
            airline: personalDetails.flightInformation.airline,
            flightNumber: personalDetails.flightInformation.flightNumber,
            scheduledDeparture: personalDetails.flightInformation.scheduledDeparture,
          }
        };
      } else if (personalDetails.trainInformation && 
                 personalDetails.trainInformation.trainOperator && 
                 personalDetails.trainInformation.trainNumber && 
                 personalDetails.trainInformation.scheduledDeparture) {
        travelInformation = {
          type: "train",
          details: {
            type: "train", // Add type field in details
            trainOperator: personalDetails.trainInformation.trainOperator,
            trainNumber: personalDetails.trainInformation.trainNumber,
            scheduledDeparture: personalDetails.trainInformation.scheduledDeparture,
          }
        };
      }

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
          travelInformation: travelInformation,
        },
      };

      // Use the API client for the request
      const response = await apiClient.post<EnhancedBookingResponse>(
        "/api/bookings/create-enhanced",
        bookingRequest
      );

      if (!response.success) {
        console.error("=== API RESPONSE ERROR ===");
        console.error("Response:", response);
        console.error("Error details:", response.error);
        console.error("========================================");
        throw new Error(response.error?.message || "Failed to create booking");
      }

      return response.data;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }

  /**
   * Create an enhanced booking with support for one-way, hourly, and return bookings
   */
  async createEnhancedBooking(
    personalDetails: {
      fullName: string;
      email: string;
      phone: string;
      specialRequests: string;
      paymentMethod?: "cash" | "card";
      flightInformation?: {
        airline?: string;
        flightNumber?: string;
        scheduledDeparture?: string;
        status?: "on-time" | "delayed" | "cancelled";
      };
      trainInformation?: {
        trainOperator?: string;
        trainNumber?: string;
        scheduledDeparture?: string;
        status?: "on-time" | "delayed" | "cancelled";
      };
    },
    bookingDetails: {
      pickupLocation: Location;
      dropoffLocation?: Location;
      additionalStops: Location[];
      selectedDate: Date;
      selectedTime: string;
      returnDate?: Date;
      returnTime?: string;
      bookingType: 'one-way' | 'hourly' | 'return';
      hours?: number;
      returnType?: 'wait-and-return' | 'later-date';
      waitDuration?: number;
      passengers: number;
      checkedLuggage: number;
      mediumLuggage: number;
      handLuggage: number;
      selectedVehicle: VehicleOption;
      babySeat: number;
      childSeat: number;
      boosterSeat: number;
      wheelchair: number;
    }
  ): Promise<EnhancedBookingResponse> {
    try {
      // Validate booking details based on booking type
      if (bookingDetails.bookingType === 'hourly') {
        if (!bookingDetails.hours || bookingDetails.hours < 3 || bookingDetails.hours > 12) {
          throw new Error("Hours must be between 3 and 12 for hourly bookings");
        }
      } else if (bookingDetails.bookingType === 'return') {
        if (!bookingDetails.returnType) {
          throw new Error("Return type is required for return bookings");
        }
        if (bookingDetails.returnType === 'later-date' && (!bookingDetails.returnDate || !bookingDetails.returnTime)) {
          throw new Error("Return date and time are required for later-date return bookings");
        }
      } else if (bookingDetails.bookingType === 'one-way') {
        if (!bookingDetails.dropoffLocation) {
          throw new Error("Dropoff location is required for one-way bookings");
        }
      }

      // Format the date for the backend
      const formattedDate = format(bookingDetails.selectedDate, "yyyy-MM-dd");

      // Strip spaces from phone number for backend validation
      const cleanedPhoneNumber = personalDetails.phone.replace(/\s+/g, '');

      // Construct travel information based on personal details
      let travelInformation: any = undefined;
      
      if (personalDetails.flightInformation && 
          personalDetails.flightInformation.airline && 
          personalDetails.flightInformation.flightNumber && 
          personalDetails.flightInformation.scheduledDeparture) {
        travelInformation = {
          type: "flight",
          details: {
            type: "flight",
            airline: personalDetails.flightInformation.airline,
            flightNumber: personalDetails.flightInformation.flightNumber,
            scheduledDeparture: personalDetails.flightInformation.scheduledDeparture,
            ...(personalDetails.flightInformation.status && { 
              status: personalDetails.flightInformation.status 
            }),
          }
        };
      } else if (personalDetails.trainInformation && 
                 personalDetails.trainInformation.trainOperator && 
                 personalDetails.trainInformation.trainNumber && 
                 personalDetails.trainInformation.scheduledDeparture) {
        travelInformation = {
          type: "train",
          details: {
            type: "train",
            trainOperator: personalDetails.trainInformation.trainOperator,
            trainNumber: personalDetails.trainInformation.trainNumber,
            scheduledDeparture: personalDetails.trainInformation.scheduledDeparture,
            ...(personalDetails.trainInformation.status && { 
              status: personalDetails.trainInformation.status 
            }),
          }
        };
      }

      // Prepare the enhanced booking request
      const enhancedBookingRequest: any = {
        customer: {
          fullName: personalDetails.fullName,
          email: personalDetails.email,
          phoneNumber: cleanedPhoneNumber,
        },
        booking: {
          locations: {
            pickup: {
              address: bookingDetails.pickupLocation.address || '',
              coordinates: {
                lat: bookingDetails.pickupLocation.latitude,
                lng: bookingDetails.pickupLocation.longitude,
              },
            },
            ...(bookingDetails.dropoffLocation && {
              dropoff: {
                address: bookingDetails.dropoffLocation.address || '',
                coordinates: {
                  lat: bookingDetails.dropoffLocation.latitude,
                  lng: bookingDetails.dropoffLocation.longitude,
                },
              },
            }),
            ...(bookingDetails.additionalStops.length > 0 && {
              additionalStops: bookingDetails.additionalStops.map((stop) => ({
                address: stop.address || '',
                coordinates: {
                  lat: stop.latitude,
                  lng: stop.longitude,
                },
              })),
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
            childSeat: bookingDetails.childSeat,
            boosterSeat: bookingDetails.boosterSeat,
            wheelchair: bookingDetails.wheelchair,
          },
          vehicle: {
            id: bookingDetails.selectedVehicle.id,
            name: bookingDetails.selectedVehicle.name,
            price: {
              amount: bookingDetails.selectedVehicle.price.amount,
              currency: bookingDetails.selectedVehicle.price.currency,
            },
          },
          specialRequests: personalDetails.specialRequests,
          ...(personalDetails.paymentMethod && {
            paymentMethods: {
              cashOnArrival: personalDetails.paymentMethod === "cash",
              cardOnArrival: personalDetails.paymentMethod === "card",
            }
          }),
          ...(travelInformation && { travelInformation }),
          // Add enhanced booking type parameters
          bookingType: bookingDetails.bookingType,
          ...(bookingDetails.bookingType === 'hourly' && {
            hours: bookingDetails.hours,
          }),
          ...(bookingDetails.bookingType === 'return' && {
            returnType: bookingDetails.returnType || 'wait-and-return',
            ...(bookingDetails.returnType === 'wait-and-return' && {
              waitDuration: bookingDetails.waitDuration || 12,
            }),
            ...(bookingDetails.returnType === 'later-date' && {
              returnDate: format(bookingDetails.returnDate!, "yyyy-MM-dd"),
              returnTime: bookingDetails.returnTime,
            }),

          }),
        },
      };



      console.log("🚀 Enhanced booking request:", JSON.stringify(enhancedBookingRequest, null, 2));
      console.log("📋 Booking type:", bookingDetails.bookingType);
      if (bookingDetails.bookingType === 'hourly') {
        console.log("⏱️ Hours:", bookingDetails.hours);
        console.log("🚗 Vehicle:", enhancedBookingRequest.booking.vehicle.name);
      }

      const response = await apiClient.post<EnhancedBookingResponse>(
        "/api/bookings/create-enhanced",
        enhancedBookingRequest
      );

      console.log("✅ Booking creation response:", response);
      
      // The API response is already the EnhancedBookingResponse, no need to check success property
      return response;
    } catch (error) {
      console.error("Error creating enhanced booking:", error);
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

      // Data sanitization to handle potentially undefined data from backend
      if (response.data?.bookings) {
        response.data.bookings = response.data.bookings.map((booking: any) => ({
          ...booking,
          pickupLocation: {
            address: booking.pickupLocation?.address || "Pickup location not specified"
          },
          dropoffLocation: booking.dropoffLocation ? {
            address: booking.dropoffLocation.address || "Dropoff location not specified"
          } : undefined,
          journey: booking.journey ? {
            distance_miles: booking.journey.distance_miles || 0,
            duration_minutes: booking.journey.duration_minutes || 0
          } : undefined,
          // Ensure new fields have default values
          referenceNumber: booking.referenceNumber || undefined,
          bookingType: booking.bookingType || "one-way",
          hours: booking.hours || undefined,
          returnType: booking.returnType || undefined,
          returnDate: booking.returnDate || undefined,
          returnTime: booking.returnTime || undefined
        }));
      }

      return response;
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      return {
        success: false,
        data: {
          bookings: [],
          total: 0,
          referenceNumberGuide: {
            display: "Use 'referenceNumber' field for user-facing displays",
            apiOperations: "Use 'id' field for API calls like updates and cancellations",
            warning: "Never display Firebase IDs to users - they are internal system identifiers"
          },
          bookingTypeDefinitions: {
            hourly: "Continuous service for specified hours, no dropoff required",
            "one-way": "Single journey from pickup to dropoff location",
            return: "Round-trip journey, uses smart reverse route"
          }
        },
        error: {
          code: "FETCH_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch bookings",
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

  async updateBooking(
    bookingId: string,
    personalDetails: PersonalDetails,
    bookingDetails: BookingDetails
  ): Promise<EnhancedBookingResponse["data"]> {
    try {
      // Validate required parameters
      if (!bookingId) {
        throw new Error("Booking ID is required for updating a booking");
      }

      if (!personalDetails || !bookingDetails) {
        throw new Error("Personal details and booking details are required");
      }

      // Validate required booking details
      if (
        !bookingDetails.pickupLocation ||
        !bookingDetails.dropoffLocation ||
        !bookingDetails.selectedDate ||
        !bookingDetails.selectedTime ||
        !bookingDetails.selectedVehicle
      ) {
        throw new Error("Missing required booking information");
      }

      // Format the date in YYYY-MM-DD format
      const formattedDate = format(bookingDetails.selectedDate, "yyyy-MM-dd");

      // Strip spaces from phone number for backend validation
      const cleanedPhoneNumber = personalDetails.phone.replace(/\s+/g, '');

      // Construct travel information based on personal details
      let travelInformation: BookingRequest['booking']['travelInformation'] = undefined;
      
      if (personalDetails.flightInformation && 
          personalDetails.flightInformation.airline && 
          personalDetails.flightInformation.flightNumber && 
          personalDetails.flightInformation.scheduledDeparture) {
        travelInformation = {
          type: "flight",
          details: {
            type: "flight", // Add type field in details
            airline: personalDetails.flightInformation.airline,
            flightNumber: personalDetails.flightInformation.flightNumber,
            scheduledDeparture: personalDetails.flightInformation.scheduledDeparture,
          }
        };
      } else if (personalDetails.trainInformation && 
                 personalDetails.trainInformation.trainOperator && 
                 personalDetails.trainInformation.trainNumber && 
                 personalDetails.trainInformation.scheduledDeparture) {
        travelInformation = {
          type: "train",
          details: {
            type: "train", // Add type field in details
            trainOperator: personalDetails.trainInformation.trainOperator,
            trainNumber: personalDetails.trainInformation.trainNumber,
            scheduledDeparture: personalDetails.trainInformation.scheduledDeparture,
          }
        };
      }

      // Prepare the booking request (same structure as create booking)
      const bookingRequest: BookingRequest = {
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
          travelInformation: travelInformation,
        },
      };

      // Use the API client for the request to the update endpoint
      const response = await apiClient.post<EnhancedBookingResponse>(
        `/api/bookings/update-booking/${bookingId}`,
        bookingRequest
      );

      if (!response.success) {
        console.error("Booking update failed:", response.error);
        
        // Handle specific update errors
        const errorCode = response.error?.code;
        if (errorCode === "UPDATE_NOT_ALLOWED") {
          throw new Error("Bookings cannot be updated within 24 hours of the pickup time. You can only update bookings more than 24 hours before pickup.");
        } else if (errorCode === "UNAUTHORIZED_UPDATE") {
          throw new Error("You are not authorized to update this booking. Only the booking owner can modify the booking.");
        } else if (errorCode === "VALIDATION_ERROR") {
          throw new Error(response.error?.message || "Invalid booking update data");
        }
        
        throw new Error(response.error?.message || "Failed to update booking");
      }

      return response.data;
    } catch (error) {
      console.error("Error updating booking:", error);
      throw error;
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
