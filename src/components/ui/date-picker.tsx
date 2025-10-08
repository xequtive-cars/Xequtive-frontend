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
  startOfToday,
  addHours,
  isToday,
  isBefore,
} from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, ArrowRight } from "lucide-react";

export interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  label?: string;
  className?: string;
  selectedTime?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({
  date,
  onDateChange,
  label,
  className,
  selectedTime,
  placeholder = "Select date",
  disabled = false,
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());
  const [open, setOpen] = React.useState(false);
  const today = startOfToday();
  const now = new Date();
  const minimumDate = addHours(now, 24);

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
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
            type="button"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal touch-manipulation",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <span className="flex-1">{date ? format(date, "MMM d, yyyy") : placeholder}</span>
            <CalendarIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 scale-75 sm:scale-100 origin-top-left" align="start" side="bottom" sideOffset={4}>
          <div className="p-1">
            <div className="flex items-center justify-between w-full pb-2 mb-2 border-b">
              <Button
                variant="ghost"
                onClick={handlePreviousMonth}
                disabled={
                  currentMonth.getMonth() === today.getMonth() &&
                  currentMonth.getFullYear() === today.getFullYear()
                }
                className="rounded-full text-foreground hover:bg-muted hover:text-accent-foreground disabled:opacity-40 touch-manipulation h-12 w-12 p-0"
              >
                <ArrowLeft size={32} />
                <span className="sr-only">Previous month</span>
              </Button>
              <h2 className="text-xs font-medium">
                {format(currentMonth, "MMM yyyy")}
              </h2>
              <Button
                variant="ghost"
                onClick={handleNextMonth}
                className="rounded-full text-foreground hover:bg-muted hover:text-accent-foreground touch-manipulation h-12 w-12 p-0"
              >
                <ArrowRight size={32} />
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
                className="h-7 px-3 text-xs font-medium bg-primary/5 text-primary hover:bg-primary/10 rounded-full touch-manipulation"
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
                Bookings for today require at least 8 hours advance notice
              </p>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
