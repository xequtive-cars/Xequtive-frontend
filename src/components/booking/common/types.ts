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
  estimatedDistance: number;
  estimatedTime: number;
  fare: {
    baseFare: number;
    currency: string;
    total: number;
  };
  vehicleOptions: VehicleOption[];
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
