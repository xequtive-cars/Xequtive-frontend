import { Location } from "@/components/map/MapComponent";
/**
 * Booking Flow Types
 *
 * This file contains all the type definitions used across the booking flow.
 * Centralizing types helps maintain consistency and makes it easier to refactor.
 */
export declare enum VehicleType {
    STANDARD = "standard",
    EXECUTIVE = "executive",
    MPV = "mpv",
    ESTATE = "estate",
    VIP = "vip"
}
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
        breakdown?: {
            baseFare: number;
            distanceCharge: number;
            additionalStopFee: number;
            timeMultiplier: number;
            specialLocationFees: number;
            waitingCharge: number;
        };
    };
    eta?: number;
    imageUrl?: string;
    features?: string[];
    vehicleType?: VehicleType;
}
export interface FareResponse {
    baseFare: number;
    totalDistance: number;
    estimatedTime: number;
    currency: string;
    vehicleOptions: VehicleOption[];
    journey: {
        distance_miles: number;
        duration_minutes: number;
    };
    notifications?: string[];
}
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: {
        code: string;
        message: string;
        details?: string;
    };
}
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
export interface PersonalDetails {
    fullName: string;
    email: string;
    phone: string;
    specialRequests: string;
}
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
