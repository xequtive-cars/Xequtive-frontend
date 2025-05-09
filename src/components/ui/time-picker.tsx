"use client";

/**
 * Premium TimePicker Component
 *
 * A luxury time picker with refined visual design:
 * - Elegant time categorization (morning, afternoon, evening, night)
 * - Beautiful visual indicators
 * - 5-minute increment options with smooth scrolling
 * - Premium aesthetic with subtle animations
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

interface TimePickerProps {
  time: string;
  onTimeChange: (time: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function TimePicker({
  time,
  onTimeChange,
  label,
  placeholder = "Select time",
  className,
}: TimePickerProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);

  // Generate time options in 10-minute increments (00:00 to 23:50)
  const generateTimeOptions = () => {
    const options: Array<{
      time: string;
      category: "morning" | "afternoon" | "evening" | "night";
      hour: number;
    }> = [];

    for (let hour = 0; hour < 24; hour++) {
      // Determine time category
      let category: "morning" | "afternoon" | "evening" | "night";
      if (hour >= 5 && hour < 12) {
        category = "morning";
      } else if (hour >= 12 && hour < 17) {
        category = "afternoon";
      } else if (hour >= 17 && hour < 21) {
        category = "evening";
      } else {
        category = "night";
      }

      for (let minute = 0; minute < 60; minute += 10) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        options.push({
          time: `${formattedHour}:${formattedMinute}`,
          category,
          hour,
        });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Get time categories with their first occurrence index
  const timeCategories = React.useMemo(() => {
    const categories: { [key: string]: number } = {};
    timeOptions.forEach((option, index) => {
      if (!categories[option.category]) {
        categories[option.category] = index;
      }
    });
    return categories;
  }, [timeOptions]);

  // Scroll to selected time when popover opens
  const scrollToSelectedTime = React.useCallback(() => {
    if (scrollContainerRef.current && time) {
      const selectedElement = scrollContainerRef.current.querySelector(
        `[data-time="${time}"]`
      );
      if (selectedElement) {
        // Add a short delay to ensure the popover is fully rendered
        setTimeout(() => {
          selectedElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }
    }
  }, [time]);

  // Formatted display time (convert 24h to 12h format with AM/PM for display)
  const getDisplayTime = (timeStr: string) => {
    if (!timeStr) return "";

    const [hourStr, minuteStr] = timeStr.split(":");
    const hour = parseInt(hourStr, 10);

    if (hour === 0) {
      return `12:${minuteStr} AM`;
    } else if (hour < 12) {
      return `${hour}:${minuteStr} AM`;
    } else if (hour === 12) {
      return `12:${minuteStr} PM`;
    } else {
      return `${hour - 12}:${minuteStr} PM`;
    }
  };

  // Jump to a specific time category
  const jumpToCategory = (category: string) => {
    if (scrollContainerRef.current) {
      const index = timeCategories[category];
      if (index !== undefined) {
        const element = scrollContainerRef.current.children[index];
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    }
  };

  // Handle time selection and close the popover
  const handleTimeSelect = (selectedTime: string) => {
    onTimeChange(selectedTime);
    setOpen(false);
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-xs font-medium block mb-1.5 text-foreground/80">
          {label}
        </label>
      )}
      <Popover
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (open) scrollToSelectedTime();
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-9 px-3 justify-start text-left font-normal bg-background/50 border border-input/50 hover:border-primary/30 hover:bg-accent/5 focus:border-primary/50 transition-all duration-200",
              !time && "text-muted-foreground",
              time && "text-foreground"
            )}
          >
            <div className="flex items-center w-full">
              <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              {time ? (
                <span className="text-sm text-foreground/90">
                  {getDisplayTime(time)}
                </span>
              ) : (
                <span className="text-sm">{placeholder}</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 p-0 bg-background/90 backdrop-blur-md border border-border/40 shadow-xl rounded-xl overflow-hidden"
          align="start"
        >
          {/* Quick category jumpers */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
            <button
              className="text-xs px-2 py-1 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
              onClick={() => jumpToCategory("morning")}
            >
              Morning
            </button>
            <button
              className="text-xs px-2 py-1 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
              onClick={() => jumpToCategory("afternoon")}
            >
              Afternoon
            </button>
            <button
              className="text-xs px-2 py-1 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
              onClick={() => jumpToCategory("evening")}
            >
              Evening
            </button>
          </div>

          <div
            ref={scrollContainerRef}
            className="max-h-72 overflow-y-auto py-1 overscroll-contain scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-primary/10 scrollbar-track-transparent hover:scrollbar-thumb-primary/20"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(var(--primary), 0.1) transparent",
              scrollBehavior: "smooth",
            }}
          >
            {timeOptions.map((option, index) => {
              // Check if this is the first item of its category
              const isFirstInCategory =
                index === 0 ||
                timeOptions[index - 1].category !== option.category;

              // Get special hours (8:00, 12:00, 17:00, 22:00)
              const isSpecialHour =
                option.time.endsWith(":00") &&
                [8, 12, 17, 22].includes(option.hour);

              return (
                <React.Fragment key={option.time}>
                  {isFirstInCategory && (
                    <div className="sticky top-0 bg-accent/30 backdrop-blur-sm px-3 py-1 text-xs font-medium text-foreground/70 border-t border-b border-border/20 z-10">
                      {option.category === "morning" && "Morning"}
                      {option.category === "afternoon" && "Afternoon"}
                      {option.category === "evening" && "Evening"}
                      {option.category === "night" && "Night"}
                    </div>
                  )}
                  <button
                    data-time={option.time}
                    className={cn(
                      "flex w-full justify-between items-center px-4 py-2 text-sm transition-all duration-150",
                      time === option.time
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-accent/50 text-foreground/80 hover:text-foreground",
                      isSpecialHour ? "border-t border-border/20" : "",
                      option.time.endsWith(":00") ? "font-medium" : ""
                    )}
                    onClick={() => handleTimeSelect(option.time)}
                  >
                    <span>{getDisplayTime(option.time)}</span>
                    {time === option.time && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Current selection indicator */}
          {time && (
            <div className="px-3 py-2 border-t border-border/30 bg-accent/20">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Selected:</span>
                <span className="text-sm font-medium">
                  {getDisplayTime(time)}
                </span>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
