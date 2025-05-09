"use client";

/**
 * Premium DatePicker Component
 *
 * A luxury date picker with refined visual design:
 * - High-contrast, accessible navigation
 * - Premium visual aesthetics
 * - Thoughtful spacing and layout
 * - Elegant transitions and animations
 */

import * as React from "react";
import {
  format,
  addMonths,
  subMonths,
  isSameDay,
  startOfToday,
  addHours,
  isToday,
  isBefore,
} from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  label?: string;
  className?: string;
  selectedTime?: string; // Add selectedTime prop
}

export function DatePicker({
  date,
  onDateChange,
  label,
  className,
  selectedTime = "",
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());
  const [open, setOpen] = React.useState(false);
  const today = startOfToday();
  const now = new Date();
  const minimumDate = addHours(now, 24); // 24 hours from now

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  // Disable dates based on 24-hour rule
  const isDateDisabled = (date: Date) => {
    // If it's a future date (not today), it's always valid
    if (!isToday(date) && date > today) {
      return false;
    }

    // If it's today, we need to check if the selected time is at least 24 hours from now
    if (isToday(date)) {
      // If no time selected yet, disable today
      if (!selectedTime) {
        return true;
      }

      // Parse the selected time and create a datetime
      try {
        const [hours, minutes] = selectedTime.split(":").map(Number);
        const selectedDateTime = new Date(date);
        selectedDateTime.setHours(hours, minutes, 0, 0);

        // Check if the selected datetime is at least 24 hours from now
        return isBefore(selectedDateTime, minimumDate);
      } catch {
        // If there's an error parsing the time, disable today to be safe
        return true;
      }
    }

    // Disable dates in the past
    return date < today;
  };

  // Add this function to handle date selection and close popover
  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate);
    setOpen(false); // Close the popover after selection
  };

  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      {label && <label className="text-sm font-medium block">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between h-11 hover:bg-accent/10 bg-background/50 border-input/50 font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <span>{date ? format(date, "PPP") : "Select date"}</span>
            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            {/* Custom Navigation */}
            <div className="flex items-center justify-between w-full pb-2 mb-2 border-b">
              <Button
                variant="ghost"
                size="icon"
                onClick={previousMonth}
                disabled={
                  isSameDay(currentMonth, today) || currentMonth < today
                }
                className="h-7 w-7 rounded-full p-0 text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous month</span>
              </Button>
              <h2 className="text-sm font-medium">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextMonth}
                className="h-7 w-7 rounded-full p-0 text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next month</span>
              </Button>
            </div>

            {/* Today Button - Only show if today is valid (with time consideration) */}
            <div className="flex justify-center mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Only set to today if it's valid with the current time selection
                  const todayValid = !isDateDisabled(today);
                  if (todayValid) {
                    onDateChange(today);
                    setCurrentMonth(today);
                  } else {
                    // If today is not valid, set to tomorrow
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    onDateChange(tomorrow);
                    setCurrentMonth(tomorrow);
                  }
                }}
                className="h-7 px-3 text-xs font-medium bg-primary/5 text-primary hover:bg-primary/10 rounded-full"
              >
                {!isDateDisabled(today) ? "Today" : "Tomorrow"}
              </Button>
            </div>

            <Calendar
              mode="single"
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              selected={date}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              initialFocus
              showOutsideDays={false}
              className="rounded-md border-none"
              modifiers={{
                today: today,
              }}
              modifiersClassNames={{
                today:
                  "bg-accent/40 text-accent-foreground font-medium border border-primary/30",
              }}
              classNames={{
                months: "space-y-1",
                month: "space-y-2",
                caption: "hidden", // Hide default caption since we have our own
                table: "w-full border-collapse",
                head_row: "flex",
                head_cell:
                  "text-muted-foreground rounded-md w-8 font-medium text-[0.8rem] py-1.5",
                row: "flex w-full mt-0.5",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent/40 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-md transition-colors",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_outside: "text-muted-foreground/60 opacity-50",
                day_disabled:
                  "text-muted-foreground/50 opacity-40 cursor-not-allowed",
                day_range_middle:
                  "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                nav: "hidden", // Hide default navigation
                nav_button: "hidden", // Hide default navigation buttons
              }}
            />
          </div>

          {date && isToday(date) && (
            <div className="px-3 pb-3 text-xs text-muted-foreground">
              <p className="text-center">
                Bookings for today require at least 24 hours advance notice
              </p>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
