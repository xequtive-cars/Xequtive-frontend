"use client";

/**
 * Premium Wheel TimePicker Component
 *
 * Features:
 * - Smooth scrolling wheels for hours and minutes
 * - Auto-snap selection mechanism
 * - Deeply integrated visual connection between hours and minutes
 * - Clean, intuitive interface
 * - Dark/light mode compatible
 */

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addHours } from "date-fns";

export interface TimePickerProps {
  time: string;
  onTimeChange: (time: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  selectedDate?: Date;
}

export function TimePicker({
  time,
  onTimeChange,
  label,
  placeholder = "Select time",
  className,
  disabled = false,
  selectedDate,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Get now and minimum booking time (24 hours from now)
  const now = React.useMemo(() => new Date(), []);
  const minBookingTime = React.useMemo(() => addHours(now, 24), [now]);

  // Check if selectedDate is today or tomorrow
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = selectedDate
    ? selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    : false;

  const isTomorrow = selectedDate
    ? selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate() + 1
    : false;

  // Get the minimum valid hour for today or tomorrow
  const getMinValidHour = React.useCallback((): number => {
    if (!selectedDate) return 0;

    // If selected date is earlier than minimum booking time, no valid hours
    if (selectedDate < minBookingTime) {
      // For today, return the min booking time hour
      if (isToday) {
        return minBookingTime.getHours();
      }

      // For tomorrow, calculate the minimum hour
      if (isTomorrow) {
        const hoursToAdd = 24 - now.getHours();
        // If the current time is after the hour we're checking on the next day
        if (now.getHours() > 0) {
          return Math.max(0, 24 - hoursToAdd);
        }
        return 0;
      }

      return 24; // No valid hours
    }

    // For any future date beyond 24h, all hours are valid
    return 0;
  }, [selectedDate, minBookingTime, isToday, isTomorrow, now]);

  // Get the first available time (first valid hour with 0 minutes)
  const getFirstAvailableTime = React.useCallback((): { hours: number; minutes: number } => {
    if (!selectedDate) return { hours: 0, minutes: 0 };
    
    const minHour = getMinValidHour();
    if (minHour >= 24) return { hours: 0, minutes: 0 }; // No valid hours
    
    return { hours: minHour, minutes: 0 };
  }, [selectedDate, getMinValidHour]);

  // Parse initial hours and minutes from the time prop, or use first available time
  const [hours, setHours] = React.useState<number>(() => {
    if (time) {
      const [hourStr] = time.split(":");
      return parseInt(hourStr, 10);
    }
    // Default to first available hour instead of 12
    return getFirstAvailableTime().hours;
  });

  const [minutes, setMinutes] = React.useState<number>(() => {
    if (time) {
      const [, minuteStr] = time.split(":");
      return parseInt(minuteStr, 10);
    }
    // Default to 0 minutes instead of 0
    return getFirstAvailableTime().minutes;
  });

  // Get the minimum valid minute for the selected hour
  const getMinValidMinute = React.useCallback((): number => {
    if (!selectedDate) return 0;

    const minHour = getMinValidHour();

    // If hours are greater than min valid hour, all minutes are valid
    if (hours > minHour) return 0;

    // If hours are less than min valid hour, no minutes are valid
    if (hours < minHour) return 0; // Changed from 60 to 0

    // If hours equal min valid hour, minutes must be >= now.getMinutes()
    if (isToday && hours === minBookingTime.getHours()) {
      return minBookingTime.getMinutes();
    }

    // For tomorrow at the cutoff hour
    if (isTomorrow && hours === minHour) {
      return now.getMinutes();
    }

    return 0;
  }, [selectedDate, getMinValidHour, hours, isToday, isTomorrow, minBookingTime, now]);

  // Update local state when external time prop changes
  React.useEffect(() => {
    if (time) {
      const [hourStr, minuteStr] = time.split(":");
      if (hourStr && minuteStr) {
        setHours(parseInt(hourStr, 10));
        setMinutes(parseInt(minuteStr, 10));
      }
    } else {
      // If no time provided, set to first available time
      const firstTime = getFirstAvailableTime();
      setHours(firstTime.hours);
      setMinutes(firstTime.minutes);
    }
  }, [time, getFirstAvailableTime]);

  // Format hours and minutes to HH:MM
  const formatTime = (h: number, m: number): string => {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  // Check if the selected date and time are valid (at least 24 hours in the future)
  const isTimeValid = (h: number, m: number): boolean => {
    if (!selectedDate) return true;

    // Create a date object with the selected date and time
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(h, m, 0, 0);

    // Compare with minimum booking time
    return selectedDateTime >= minBookingTime;
  };

  // Apply the selected time and close the picker
  const handleApplyTime = () => {
    // Ensure hours and minutes are valid before formatting
    const validHours = Math.min(Math.max(0, hours), 23);
    const validMinutes = Math.min(Math.max(0, minutes), 59);
    
    const formattedTime = formatTime(validHours, validMinutes);
    onTimeChange(formattedTime);
    setOpen(false);
  };

  // Handle hour change
  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = parseInt(e.target.value, 10);
    setHours(newHour);

    // If new hour is valid but current minutes aren't, reset to min valid minutes
    const minValidMinute = getMinValidMinute();
    if (minutes < minValidMinute) {
      setMinutes(minValidMinute);
    }
  };

  // Handle minute change
  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinute = parseInt(e.target.value, 10);
    // Ensure minutes are valid (0-59)
    const validMinute = Math.min(Math.max(0, newMinute), 59);
    setMinutes(validMinute);
  };

  // Generate hour options
  const hourOptions = React.useMemo(() => {
    const minHour = getMinValidHour();
    const options = [];

    for (let i = 0; i < 24; i++) {
      const isDisabled = i < minHour;
      options.push(
        <option key={i} value={i} disabled={isDisabled}>
          {i.toString().padStart(2, "0")}
        </option>
      );
    }

    return options;
  }, [getMinValidHour]);

  // Generate minute options
  const minuteOptions = React.useMemo(() => {
    const minMinute = hours === getMinValidHour() ? getMinValidMinute() : 0;
    const options = [];

    // Generate options in 5-minute increments (0, 5, 10, 15, ..., 55)
    for (let i = 0; i < 60; i += 5) {
      const isDisabled = hours === getMinValidHour() && i < minMinute;
      options.push(
        <option key={i} value={i} disabled={isDisabled}>
          {i.toString().padStart(2, "0")}
        </option>
      );
    }

    // Only add the current minute if it's not already in the options and it's valid
    if (minutes % 5 !== 0 && minutes >= 0 && minutes < 60) {
      const isDisabled = hours === getMinValidHour() && minutes < minMinute;
      const insertIndex = Math.floor(minutes / 5) + 1;
      if (insertIndex <= options.length) {
        options.splice(
          insertIndex,
          0,
          <option key={minutes} value={minutes} disabled={isDisabled}>
            {minutes.toString().padStart(2, "0")}
          </option>
        );
      }
    }

    return options;
  }, [hours, minutes, getMinValidHour, getMinValidMinute]);

  // CSS for select elements
  const selectStyles = `
    .time-select {
      appearance: none;
      background-color: transparent;
      border: none;
      padding: 0 1em;
      margin: 0;
      width: 100%;
      font-family: inherit;
      font-size: 1.25rem;
      cursor: pointer;
      line-height: inherit;
      outline: none;
      text-align: center;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
    
    .time-select-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 5rem;
      border-radius: 0.5rem;
      background-color: hsl(var(--muted));
      padding: 0.5rem;
      touch-action: manipulation;
    }
    
    .time-select:focus + .focus-indicator {
      box-shadow: 0 0 0 2px hsl(var(--border));
    }
    
    .focus-indicator {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 0.5rem;
      pointer-events: none;
    }
    
    @media (max-width: 768px) {
      .time-select {
        font-size: 1.1rem;
        padding: 0.5em;
      }
      
      .time-select-wrapper {
        min-width: 4rem;
        padding: 0.75rem;
      }
    }
  `;

  return (
    <div className={className}>
      {label && (
        <label className="text-xs font-medium block mb-1.5 text-foreground/80">
          {label}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal touch-manipulation",
              !time && "text-muted-foreground",
              !isTimeValid(hours, minutes) &&
                "border-destructive text-destructive"
            )}
            disabled={disabled}
          >
            <span>{time || placeholder}</span>
            <Clock className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-4 bg-background border border-border/40 shadow-xl rounded-xl"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          {/* Time Display */}
          <div className="flex flex-col gap-4">
            <div className="text-center text-2xl font-semibold mb-2">
              {formatTime(hours, minutes)}
            </div>

            {/* Time Selectors */}
            <div className="flex justify-center items-center gap-2">
              {/* Hour selector */}
              <div className="time-select-wrapper">
                <select
                  className="time-select touch-manipulation"
                  value={hours}
                  onChange={handleHourChange}
                  aria-label="Hours"
                >
                  {hourOptions}
                </select>
                <div className="focus-indicator"></div>
              </div>

              <div className="text-xl font-semibold">:</div>

              {/* Minute selector */}
              <div className="time-select-wrapper">
                <select
                  className="time-select touch-manipulation"
                  value={minutes}
                  onChange={handleMinuteChange}
                  aria-label="Minutes"
                >
                  {minuteOptions}
                </select>
                <div className="focus-indicator"></div>
              </div>
            </div>

            {/* Warning message for invalid times */}
            {!isTimeValid(hours, minutes) && (
              <div className="text-xs text-destructive bg-destructive/10 p-3 rounded-md">
                Bookings require minimum 24 hours advance notice
              </div>
            )}

            {/* Apply Button */}
            <Button
              type="button"
              className="w-full mt-2 touch-manipulation"
              disabled={!isTimeValid(hours, minutes)}
              onClick={handleApplyTime}
            >
              Apply
            </Button>
          </div>

          <style dangerouslySetInnerHTML={{ __html: selectStyles }} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
