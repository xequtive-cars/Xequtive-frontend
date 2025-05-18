import { Location } from "@/components/map/MapComponent";
import { VehicleOption, FareResponse } from "./common/types";
export type { VehicleOption, FareResponse };
interface VehicleSelectionProps {
    fareData: FareResponse;
    pickupLocation: Location | null;
    dropoffLocation: Location | null;
    selectedDate: Date | undefined;
    selectedTime: string;
    passengers: number;
    checkedLuggage: number;
    handLuggage: number;
    onBack: () => void;
    onSelectVehicle: (vehicle: VehicleOption) => void;
    layout?: "grid" | "vertical";
}
export default function VehicleSelection({ fareData, pickupLocation, dropoffLocation, selectedDate, selectedTime, passengers, checkedLuggage, handLuggage, onBack, onSelectVehicle, layout, }: VehicleSelectionProps): import("react").JSX.Element;
