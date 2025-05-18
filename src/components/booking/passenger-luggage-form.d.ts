/**
 * Passenger and Luggage Form Component
 *
 * A premium form for selecting passenger count and luggage options
 */
import * as React from "react";
interface PassengerLuggageFormProps {
    passengers: number;
    setPassengers: (value: number) => void;
    checkedLuggage: number;
    setCheckedLuggage: (value: number) => void;
    handLuggage: number;
    setHandLuggage: (value: number) => void;
    onBack: () => void;
    className?: string;
}
export declare function PassengerLuggageForm({ passengers, setPassengers, checkedLuggage, setCheckedLuggage, handLuggage, setHandLuggage, onBack, className, }: PassengerLuggageFormProps): React.JSX.Element;
export {};
