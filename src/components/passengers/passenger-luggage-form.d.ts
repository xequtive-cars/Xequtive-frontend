import * as React from "react";
export interface PassengerLuggageFormProps {
    passengers: number;
    checkedLuggage: number;
    handLuggage: number;
    onPassengersChange: (value: number) => void;
    onCheckedLuggageChange: (value: number) => void;
    onHandLuggageChange: (value: number) => void;
    onBack: () => void;
    disabled?: boolean;
    className?: string;
}
export declare function PassengerLuggageForm({ passengers, checkedLuggage, handLuggage, onPassengersChange, onCheckedLuggageChange, onHandLuggageChange, onBack, disabled, className, }: PassengerLuggageFormProps): React.JSX.Element;
