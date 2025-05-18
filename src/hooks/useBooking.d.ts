import { BookingStep } from "@/store/slices/uiSlice";
import type { Location } from "@/components/map/MapComponent";
import type { VehicleOption } from "@/components/booking/common/types";
interface PassengerDetails {
    fullName: string;
    email: string;
    phone: string;
    specialRequests: string;
}
/**
 * Custom hook for booking-related state and actions
 * Provides a simplified interface to work with the booking flow
 */
export declare const useBooking: () => {
    booking: any;
    ui: any;
    api: any;
    validation: any;
    setPickupLocation: (location: Location) => void;
    setDropoffLocation: (location: Location) => void;
    addAdditionalStop: () => void;
    removeAdditionalStop: (index: number) => void;
    updateStop: (index: number, location: Location) => void;
    selectDate: (date: Date | undefined) => void;
    selectTime: (time: string) => void;
    updatePassengers: (count: number) => void;
    updateCheckedLuggage: (count: number) => void;
    updateHandLuggage: (count: number) => void;
    selectVehicle: (vehicle: VehicleOption) => void;
    goToStep: (step: BookingStep) => void;
    goToLocationSelection: () => void;
    goToPassengerSelection: () => void;
    goToVehicleSelection: () => void;
    goToPersonalDetails: () => void;
    showVehicleOptions: (show: boolean) => void;
    showDetailsForm: (show: boolean) => void;
    showBookingSuccess: (show: boolean, bookingId?: string) => void;
    getFareEstimate: () => void;
    createBooking: (details: PassengerDetails, agreeToTerms: boolean) => void;
    resetBookingState: () => void;
    isCurrentStepValid: () => any;
};
export {};
