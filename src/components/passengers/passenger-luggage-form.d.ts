import * as React from "react";

export interface PassengerLuggageFormProps {
  passengers: number;
  onPassengersChange: (value: number) => void;
  checkedLuggage: number;
  onCheckedLuggageChange: (value: number) => void;
  mediumLuggage: number;
  onMediumLuggageChange: (value: number) => void;
  handLuggage: number;
  onHandLuggageChange: (value: number) => void;
  onBack: () => void;
  disabled?: boolean;
  className?: string;
}

export declare const PassengerLuggageForm: React.FC<PassengerLuggageFormProps>;
