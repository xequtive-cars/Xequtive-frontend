"use client";

/**
 * Pickup Time Display Component
 *
 * A clean, elegant component to display the selected pickup date and time:
 * - Consistent styling with date and time pickers
 * - Clear visual feedback about selection state
 */

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PickupTimeDisplayProps {
  dateTimeText: string;
  className?: string;
  hasDateTime: boolean;
}

export function PickupTimeDisplay({
  dateTimeText,
  className,
  hasDateTime = false,
}: PickupTimeDisplayProps) {
  return (
    <div className={className}>
      <div
        className={cn(
          "rounded-md p-3 flex items-center",
          hasDateTime
            ? "bg-primary/5 border shadow-sm"
            : "bg-muted/20 border border-dashed"
        )}
      >
        <Clock
          className={cn(
            "h-5 w-5 mr-2",
            hasDateTime ? "text-primary" : "text-muted-foreground"
          )}
        />
        <span
          className={cn(hasDateTime ? "font-medium" : "text-muted-foreground")}
        >
          {dateTimeText}
        </span>
      </div>
    </div>
  );
}
