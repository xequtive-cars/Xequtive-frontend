"use client";

import * as React from "react";
import { ChevronLeft, Minus, Plus, Baby, Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export interface SpecialRequirementsFormProps {
  babySeat: number;
  childSeat: number;
  boosterSeat: number;
  wheelchair: number;
  onBabySeatChange: (value: number) => void;
  onChildSeatChange: (value: number) => void;
  onBoosterSeatChange: (value: number) => void;
  onWheelchairChange: (value: number) => void;
  onBack: () => void;
  disabled?: boolean;
  className?: string;
}

export function SpecialRequirementsForm({
  babySeat,
  childSeat,
  boosterSeat,
  wheelchair,
  onBabySeatChange,
  onChildSeatChange,
  onBoosterSeatChange,
  onWheelchairChange,
  onBack,
  disabled = false,
  className,
}: SpecialRequirementsFormProps) {
  const handleChange = (
    value: number,
    setValue: (value: number) => void,
    min = 0,
    max = 8
  ) => {
    if (value < min) value = min;
    if (value > max) value = max;
    setValue(value);
  };

  // Helper function to render increment/decrement controls
  const renderControls = (
    value: number,
    onChange: (value: number) => void,
    label: string
  ) => (
    <div className="flex items-center justify-between h-10 border rounded-md px-3 py-2 bg-muted/40 hover:bg-muted/60 transition-colors">
      <div className="flex items-center gap-2 px-1">
        {label.includes("Wheelchair") ? (
          <Accessibility className="h-5 w-5 text-foreground" />
        ) : (
          <Baby className="h-5 w-5 text-foreground" />
        )}
        <span className="text-sm">
          {value} {value === 1 ? label : label + "s"}
        </span>
      </div>
      <div className="flex flex-row items-center">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-10 transition-colors"
          onClick={() => handleChange(value - 1, onChange, 0)}
          disabled={disabled || value <= 0}
        >
          <Minus className="text-foreground" />
        </Button>
        <span className="mx-auto w-10 text-center text-sm font-medium">
          {value}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-10 transition-colors"
          onClick={() => handleChange(value + 1, onChange, 0)}
          disabled={disabled || value >= 8}
        >
          <Plus className="text-foreground" />
        </Button>
      </div>
    </div>
  );

  return (
    <Card
      className={cn(
        "border border-border/60 rounded-md shadow-sm w-full md:w-[106%]",
        className
      )}
    >
      <CardContent className="p-5 py-0 space-y-3">
        {/* Back button */}
        <div className="flex items-center h-14">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="hover:bg-transparent hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h3 className="text-base font-medium">Special Requirements</h3>
        </div>

        {/* Special Requirements selection */}
        <div className="space-y-6">
          {/* Baby Seat */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium block">
              Baby Seat (0-18 Months)
              <span className="text-sm text-muted-foreground ml-2">
                [ + £10.00 ]
              </span>
            </label>
            {renderControls(babySeat, onBabySeatChange, "Seat")}
          </div>

          {/* Child Seat */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium block">
              Child Seat (18 Months - 4 Years)
              <span className="text-sm text-muted-foreground ml-2">
                [ + £10.00 ]
              </span>
            </label>
            {renderControls(childSeat, onChildSeatChange, "Seat")}
          </div>

          {/* Booster Seat */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium block">
              Booster Seat (4-6 Years)
              <span className="text-sm text-muted-foreground ml-2">
                [ + £10.00 ]
              </span>
            </label>
            {renderControls(boosterSeat, onBoosterSeatChange, "Seat")}
          </div>

          {/* Wheelchair */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium block">
              Foldable Wheelchair
              <span className="text-sm text-muted-foreground ml-2">
                [ + £25.00 ]
              </span>
            </label>
            {renderControls(wheelchair, onWheelchairChange, "Wheelchair")}
          </div>
        </div>

        {/* Done button */}
        <div className="pt-1 pb-0">
          <Button
            className="w-full font-medium transition-all"
            onClick={onBack}
            disabled={disabled}
          >
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
