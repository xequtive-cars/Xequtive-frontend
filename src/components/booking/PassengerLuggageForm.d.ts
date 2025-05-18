import * as React from "react";
interface PassengerLuggageFormProps {
    passengers: number;
    setPassengers: (count: number) => void;
    checkedLuggage: number;
    setCheckedLuggage: (count: number) => void;
    handLuggage: number;
    setHandLuggage: (count: number) => void;
    onBack: () => void;
    className?: string;
}
export declare function PassengerLuggageForm({ passengers, setPassengers, checkedLuggage, setCheckedLuggage, handLuggage, setHandLuggage, onBack, className, }: PassengerLuggageFormProps): React.JSX.Element;
export {};
