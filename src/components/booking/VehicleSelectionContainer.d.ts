import React from "react";
import { VehicleOption, FareResponse } from "./common/types";
import { Location } from "@/components/map/MapComponent";
interface VehicleSelectionContainerProps {
    fareData: FareResponse;
    pickupLocation: Location | null;
    dropoffLocation: Location | null;
    additionalStops: Location[];
    selectedDate: Date | undefined;
    selectedTime: string;
    passengers: number;
    checkedLuggage: number;
    handLuggage: number;
    onBack: () => void;
    onSelectVehicle: (vehicle: VehicleOption) => void;
    selectedVehicle: VehicleOption | null;
}
declare const VehicleSelectionContainer: React.FC<VehicleSelectionContainerProps>;
export default VehicleSelectionContainer;
