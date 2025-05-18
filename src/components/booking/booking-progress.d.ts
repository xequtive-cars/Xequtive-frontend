import React from "react";
interface BookingProgressProps {
    steps: string[];
    currentStepIndex: number;
    className?: string;
}
export declare const BookingProgress: ({ steps, currentStepIndex, className, }: BookingProgressProps) => React.JSX.Element;
export default BookingProgress;
