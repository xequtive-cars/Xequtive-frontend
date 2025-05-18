import { VehicleOption } from "./vehicle-selection";
import { Location } from "@/components/map/MapComponent";
export interface VerifiedFare {
    vehicleId: string;
    vehicleName: string;
    price: {
        amount: number;
        currency: string;
    };
    distance_miles: number;
    duration_minutes: number;
}
export interface BookingVerification {
    bookingId: string;
    verificationToken: string;
    verifiedFare: VerifiedFare;
    expiresIn?: number;
}
export interface PersonalDetailsFormProps {
    selectedVehicle: VehicleOption;
    pickupLocation: Location | null;
    dropoffLocation: Location | null;
    additionalStops: Location[];
    selectedDate: Date | undefined;
    selectedTime: string;
    passengers: number;
    checkedLuggage: number;
    handLuggage: number;
    onBack: () => void;
    onSubmit: (personalDetails: {
        fullName: string;
        email: string;
        phone: string;
        specialRequests: string;
    }, agree: boolean) => void;
    isSubmitting: boolean;
    error: string | null;
}
export declare function PersonalDetailsForm({ selectedVehicle, pickupLocation, dropoffLocation, additionalStops, selectedDate, selectedTime, passengers, checkedLuggage, handLuggage, onBack, onSubmit, isSubmitting, error, }: PersonalDetailsFormProps): import("react").JSX.Element;
