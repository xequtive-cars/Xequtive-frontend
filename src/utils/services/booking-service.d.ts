import { VehicleOption } from "../../components/booking/common/types";
import { Location } from "../../components/map/MapComponent";
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
      mediumLuggage: number;
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
  mediumLuggage: number;
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
declare class BookingService {
  createBooking(
    personalDetails: PersonalDetails,
    bookingDetails: BookingDetails
  ): Promise<EnhancedBookingResponse["data"]>;
  getUserBookings(statusFilter?: string): Promise<GetUserBookingsResponse>;
  /**
   * @deprecated Use getUserBookings() instead
   */
  getActiveBookings(): Promise<ActiveBookingsResponse>;
  /**
   * @deprecated Use getUserBookings() instead
   */
  getBookingHistory(): Promise<BookingHistoryResponse>;
  cancelBooking(
    bookingId: string,
    reason?: string
  ): Promise<CancelBookingResponse>;
}
export declare const bookingService: BookingService;
export {};
