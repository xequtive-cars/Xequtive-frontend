import React from "react";
interface StepProgressBarProps {
    currentStep: number;
    totalSteps: number;
    className?: string;
    completed?: boolean;
}
export declare const StepProgressBar: React.FC<StepProgressBarProps>;
export default StepProgressBar;
