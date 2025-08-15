"use client";

import * as React from "react";
import { format, addHours } from "date-fns";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface AdvancedTimePickerProps {
  datetime?: Date;
  onDateTimeChange: (datetime: Date | undefined) => void;
  lockedDate?: Date | string;
  disabled?: boolean;
  className?: string;
}

export function AdvancedTimePicker({
  datetime,
  onDateTimeChange,
  lockedDate,
  disabled = false,
  className,
}: AdvancedTimePickerProps) {
  // Strictly validate and use the locked date
  // if (!lockedDate) {
  //   throw new Error("Locked date is required for AdvancedTimePicker");
  // }

  // Convert to Date object if it's a string
  const validLockedDate = React.useMemo(() => 
    lockedDate instanceof Date
      ? lockedDate
      : lockedDate
      ? new Date(lockedDate)
      : new Date() // Default to current date if no date is provided
  , [lockedDate]);

  // Validate minimum booking time
  const now = new Date();
  const minimumDate = addHours(now, 24);

  // Get the first available time for the locked date
  const getFirstAvailableTime = React.useMemo((): string => {
    if (!validLockedDate) return "00:00";
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const isToday = validLockedDate.getFullYear() === today.getFullYear() &&
                   validLockedDate.getMonth() === today.getMonth() &&
                   validLockedDate.getDate() === today.getDate();
    
    const isTomorrow = validLockedDate.getFullYear() === today.getFullYear() &&
                      validLockedDate.getMonth() === today.getMonth() &&
                      validLockedDate.getDate() === today.getDate() + 1;
    
    if (isToday) {
      // For today, use the minimum booking time hour
      const minHour = minimumDate.getHours();
      return `${minHour.toString().padStart(2, "0")}:00`;
    } else if (isTomorrow) {
      // For tomorrow, calculate the minimum hour
      const hoursToAdd = 24 - now.getHours();
      const minHour = Math.max(0, 24 - hoursToAdd);
      return `${minHour.toString().padStart(2, "0")}:00`;
    }
    
    // For any future date beyond 24h, all hours are valid
    return "00:00";
  }, [validLockedDate, minimumDate, now]);

  const [time, setTime] = React.useState<string>(
    datetime ? format(datetime, "HH:mm") : getFirstAvailableTime // Use first available time instead of 12:00
  );

  // Handle time change
  const handleTimeChange = (newTime: string) => {
    setTime(newTime);

    // Create datetime by combining locked date and selected time
    const [hours, minutes] = newTime.split(":").map(Number);
    const newDateTime = new Date(validLockedDate);
    newDateTime.setHours(hours, minutes, 0, 0);

    // Validate booking time
    if (newDateTime >= minimumDate) {
      onDateTimeChange(newDateTime);
    }
  };

  // Validate datetime
  const isDateTimeValid = React.useMemo(() => {
    const [hours, minutes] = time.split(":").map(Number);
    const selectedDateTime = new Date(validLockedDate);
    selectedDateTime.setHours(hours, minutes, 0, 0);

    return selectedDateTime >= minimumDate;
  }, [time, validLockedDate, minimumDate]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !isDateTimeValid && "border-destructive text-destructive",
            className
          )}
          disabled={disabled}
        >
          <span>
            {format(validLockedDate, "PPP")} at {time}
          </span>
          <div className="ml-auto flex items-center">
            <Clock className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-4 space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">
            Select Time for {format(validLockedDate, "EEEE, MMMM d, yyyy")}
          </h4>
          <TimePicker
            time={time}
            onTimeChange={handleTimeChange}
            selectedDate={validLockedDate}
            className="w-full"
          />
        </div>

        {!isDateTimeValid && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded text-center">
            Bookings require 24 hours advance notice
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
