import { Location } from "../../types/form.d";

interface BookingFormProps {
  pickupAddress: string;
  setPickupAddress: (value: string) => void;
  dropoffAddress: string;
  setDropoffAddress: (value: string) => void;
  stopAddresses: string[];
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  selectedDate: Date | undefined;
  setSelectedDate: (value: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (value: string) => void;
  passengers: number;
  setPassengers: (value: number) => void;
  checkedLuggage: number;
  setCheckedLuggage: (value: number) => void;
  handLuggage: number;
  setHandLuggage: (value: number) => void;
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  showVehicleOptions: boolean;
  setFormModified: (value: boolean) => void;
  isFetching: boolean;
  fetchError: string | null;
  handlePickupLocationSelect: (location: {
    address: string;
    longitude: number;
    latitude: number;
  }) => void;
  handleDropoffLocationSelect: (location: {
    address: string;
    longitude: number;
    latitude: number;
  }) => void;
  handleStopLocationSelect: (
    index: number,
    location: {
      address: string;
      longitude: number;
      latitude: number;
    }
  ) => void;
  updateStopAddress: (index: number, value: string) => void;
  addStop: () => void;
  removeStop: (index: number) => void;
  calculateFare: () => void;
  getPassengerLuggageSummary: () => string;
  disabled?: boolean;
}
declare const BookingForm: ({
  pickupAddress,
  setPickupAddress,
  dropoffAddress,
  setDropoffAddress,
  stopAddresses,
  pickupLocation,
  dropoffLocation,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  passengers,
  setPassengers,
  checkedLuggage,
  setCheckedLuggage,
  handLuggage,
  setHandLuggage,
  userLocation,
  showVehicleOptions,
  setFormModified,
  isFetching,
  fetchError,
  handlePickupLocationSelect,
  handleDropoffLocationSelect,
  handleStopLocationSelect,
  updateStopAddress,
  addStop,
  removeStop,
  calculateFare,
  getPassengerLuggageSummary,
  disabled,
}: BookingFormProps) => import("react").JSX.Element;

export default BookingForm;
