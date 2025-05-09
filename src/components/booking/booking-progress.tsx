import React from "react";
import { cn } from "@/lib/utils";
import { Check, ArrowRight } from "lucide-react";

interface BookingProgressProps {
  steps: string[];
  currentStepIndex: number;
  className?: string;
}

export const BookingProgress = ({
  steps,
  currentStepIndex,
  className,
}: BookingProgressProps) => {
  return (
    <div className={cn("w-full flex flex-col space-y-4", className)}>
      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  index < currentStepIndex
                    ? "bg-primary text-primary-foreground" // Completed
                    : index === currentStepIndex
                    ? "border-2 border-primary text-primary" // Current
                    : "border border-input text-muted-foreground" // Upcoming
                )}
              >
                {index < currentStepIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-1",
                  index === currentStepIndex
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {step}
              </span>
            </div>

            {/* Connector Line (except after the last step) */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-2",
                  index < currentStepIndex
                    ? "bg-primary" // Completed
                    : "bg-border" // Upcoming
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Current step description */}
      <div className="text-sm text-center text-muted-foreground">
        {currentStepIndex < steps.length && (
          <div className="flex items-center justify-center gap-2">
            <span>
              {currentStepIndex === 0
                ? "Enter your journey details"
                : currentStepIndex === 1
                ? "Select passengers and luggage"
                : currentStepIndex === 2
                ? "Choose your vehicle"
                : "Complete your booking"}
            </span>
            {currentStepIndex < steps.length - 1 && (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingProgress;
