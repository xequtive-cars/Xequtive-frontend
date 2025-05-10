import { Location } from "@/components/map/MapComponent";

/**
 * Booking Flow Types
 *
 * This file contains all the type definitions used across the booking flow.
 * Centralizing types helps maintain consistency and makes it easier to refactor.
 */

// Vehicle type enum for consistent vehicle type references
export enum VehicleType {
  STANDARD = "standard",
  EXECUTIVE = "executive",
  MPV = "mpv",
  ESTATE = "estate",
  VIP = "vip",
}

// Vehicle types
export interface VehicleOption {
  id: string;
  name: string;
  description: string;
  capacity: {
    passengers: number;
    luggage: number;
  };
  price: {
    amount: number;
    currency: string;
  };
  eta?: number;
  imageUrl?: string;
  features?: string[];
  vehicleType?: VehicleType; // Optional for backward compatibility
}

// Fare response from API
export interface FareResponse {
  baseFare: number;
  totalDistance: number;
  estimatedTime: number;
  currency: string;
  vehicleOptions: VehicleOption[];
  journey: {
    distance_km: number;
    duration_min: number;
  };
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

// Booking related types
export interface BookingDetails {
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

// Personal details for booking
export interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

// Booking confirmation response
export interface BookingConfirmation {
  bookingId: string;
  status: "confirmed" | "pending" | "failed";
  estimatedPickupTime: string;
  driverDetails?: {
    name: string;
    phone: string;
    vehicleModel: string;
    vehiclePlate: string;
  };
}
