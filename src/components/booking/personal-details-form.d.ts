import { VehicleOption } from "./common/types";
import { VerifiedFare } from "../../types/common";

type Location = {
  address: string;
  longitude: number;
  latitude: number;
};

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
  onSubmit: (
    personalDetails: {
      fullName: string;
      email: string;
      phone: string;
      specialRequests: string;
    },
    agree: boolean,
    e?: React.BaseSyntheticEvent
  ) => void;
  isSubmitting: boolean;
  error: string | null;
}

export declare function PersonalDetailsForm({
  selectedVehicle,
  pickupLocation,
  dropoffLocation,
  additionalStops,
  selectedDate,
  selectedTime,
  passengers,
  checkedLuggage,
  handLuggage,
  onBack,
  onSubmit,
  isSubmitting,
  error,
}: PersonalDetailsFormProps): import("react").JSX.Element;
