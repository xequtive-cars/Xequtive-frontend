import { VehicleOption } from "@/components/booking/vehicle-selection";
import { Location } from "@/types/common";

export interface BookingDetails {
  selectedVehicle: VehicleOption | null;
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  additionalStops: Location[];
  selectedDate: Date | undefined;
  selectedTime: string;
  passengers: number;
  checkedLuggage: number;
  mediumLuggage: number;
  handLuggage: number;
  personalDetails: {
    fullName: string;
    email: string;
    phone: string;
    specialRequests: string;
  } | null;
  agree: boolean;
}

export interface FareRequest {
  pickupLocation: Location;
  dropoffLocation: Location;
  passengers: number;
  checkedLuggage: number;
  mediumLuggage: number;
  handLuggage: number;
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  isReturnJourney: boolean;
}
