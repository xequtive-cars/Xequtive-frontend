import { Location } from "@/types/form";
import React from "react";
interface TripDetailsFormProps {
    pickupLocation: Location | null;
    setPickupLocation: (location: Location) => void;
    dropoffLocation: Location | null;
    setDropoffLocation: (location: Location) => void;
}
export default function TripDetailsForm({ pickupLocation, setPickupLocation, dropoffLocation, setDropoffLocation, }: TripDetailsFormProps): React.JSX.Element;
export {};
