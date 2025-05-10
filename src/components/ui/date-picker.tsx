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
  selectedTime?: string;
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
  const minimumDate = addHours(now, 24);

  const previousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const isDateDisabled = (date: Date) => {
    if (!isToday(date) && date > today) {
      return false;
    }

    if (isToday(date)) {
      if (!selectedTime) {
        return true;
      }

      try {
        const [hours, minutes] = selectedTime.split(":").map(Number);
        const selectedDateTime = new Date(date);
        selectedDateTime.setHours(hours, minutes, 0, 0);

        return isBefore(selectedDateTime, minimumDate);
      } catch {
        return true;
      }
    }

    return date < today;
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Create a new date and set it to noon to avoid timezone issues
      const newDate = new Date(selectedDate);
      newDate.setHours(12, 0, 0, 0);
      onDateChange(newDate);
    } else {
      onDateChange(undefined);
    }
    setOpen(false);
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

            <div className="flex justify-center mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const todayValid = !isDateDisabled(today);
                  if (todayValid) {
                    handleDateSelect(today);
                  } else {
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    handleDateSelect(tomorrow);
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
                caption: "hidden",
                table: "w-full border-collapse",
                head_row: "flex",
                head_cell:
                  "text-muted-foreground rounded-md w-8 font-medium text-[0.8rem] py-1.5",
                row: "flex w-full mt-0.5",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent/40 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-md transition-colors data-[disabled=true]:text-gray-500  data-[disabled=true]:cursor-not-allowed data-[disabled=true]:hover:text-gray-300",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_outside: "text-muted-foreground/60 opacity-50",
                day_disabled:
                  "text-gray-300 bg-gray-50 cursor-not-allowed hover:bg-gray-50 hover:text-gray-300 pointer-events-none",
                day_range_middle:
                  "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                nav: "hidden",
                nav_button: "hidden",
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
