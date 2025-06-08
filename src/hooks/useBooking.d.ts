type BookingStep = string;

type Location = {
    latitude: number;
    longitude: number;
    address?: string;
};

type VehicleOption = {
    id: string;
    name: string;
    capacity: number;
    pricePerKm: number;
};

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
    booking: Record<string, unknown>;
    ui: Record<string, unknown>;
    api: Record<string, unknown>;
    validation: Record<string, unknown>;
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
    isCurrentStepValid: () => boolean;
};

export {};
