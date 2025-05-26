import { VehicleOption, FareResponse } from "./common/types";
import { Location } from "../../components/map/MapComponent";

interface VehicleSelectionContainerProps {
  fareData: FareResponse;
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  additionalStops: Location[];
  selectedDate: Date | undefined;
  selectedTime: string;
  passengers: number;
  checkedLuggage: number;
  mediumLuggage: number;
  handLuggage: number;
  onBack: () => void;
  onSelectVehicle: (vehicle: VehicleOption) => void;
  selectedVehicle: VehicleOption | null;
}

export declare function VehicleSelectionContainer({
  fareData,
  pickupLocation,
  dropoffLocation,
  additionalStops,
  selectedDate,
  selectedTime,
  passengers,
  checkedLuggage,
  mediumLuggage,
  handLuggage,
  onBack,
  onSelectVehicle,
  selectedVehicle,
}: VehicleSelectionContainerProps): JSX.Element;
