"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdditionalRequestsFormProps {
  babySeat: number;
  setBabySeat: (value: number) => void;
  childSeat: number;
  setChildSeat: (value: number) => void;
  boosterSeat: number;
  setBoosterSeat: (value: number) => void;
  wheelchair: number;
  setWheelchair: (value: number) => void;
  onBack?: () => void;
  disabled?: boolean;
  className?: string;
}

const handleChange = (
  currentValue: number,
  onChange: (value: number) => void,
  minValue: number,
  maxValue: number
) => {
  const newValue = Math.max(minValue, Math.min(currentValue, maxValue));
  onChange(newValue);
};

export function AdditionalRequestsForm({
  babySeat,
  setBabySeat,
  childSeat,
  setChildSeat,
  boosterSeat,
  setBoosterSeat,
  wheelchair,
  setWheelchair,
  onBack,
  disabled = false,
  className,
}: AdditionalRequestsFormProps) {
  return (
    <div
      className={cn(
        "w-[100%] md:w-[110%] border rounded-lg shadow-sm bg-muted/40",
        className
      )}
    >
      {/* Header with back button */}
      <div className="flex items-center gap-2 px-5 pt-8">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="p-0 hover:bg-muted/0"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-lg font-semibold">Additional Requests</h3>
      </div>

      {/* Form content */}
      <div className="px-6 py-7 space-y-4">
        {/* Baby Seat */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium block">
            Baby Seat (0-18 Months){" "}
            <span className="text-muted-foreground">£10.00</span>
          </label>
          <div className="flex items-center justify-between h-10 border rounded-md px-3 py-2 bg-muted/40">
            <div className="flex items-center gap-2 px-1">
              <span className="text-sm">
                {babySeat} Baby {babySeat === 1 ? "Seat" : "Seats"}
              </span>
            </div>
            <div className="flex flex-row items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 bg-muted/0"
                onClick={() => handleChange(babySeat - 1, setBabySeat, 0, 5)}
                disabled={disabled || babySeat <= 0}
              >
                <Minus className="h-4 w-4 text-foreground" />
              </Button>
              <span className="mx-auto w-10 text-center text-sm">
                {babySeat}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 bg-muted/0"
                onClick={() => handleChange(babySeat + 1, setBabySeat, 0, 5)}
                disabled={disabled || babySeat >= 5}
              >
                <Plus className="h-4 w-4 text-foreground" />
              </Button>
            </div>
          </div>
        </div>

        {/* Child Seat */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium block">
            Child Seat (18 Months - 4 Years){" "}
            <span className="text-muted-foreground">£10.00</span>
          </label>
          <div className="flex items-center justify-between h-10 border rounded-md px-3 py-2 bg-muted/40">
            <div className="flex items-center gap-2 px-1">
              <span className="text-sm">
                {childSeat} Child {childSeat === 1 ? "Seat" : "Seats"}
              </span>
            </div>
            <div className="flex flex-row items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 bg-muted/0"
                onClick={() => handleChange(childSeat - 1, setChildSeat, 0, 5)}
                disabled={disabled || childSeat <= 0}
              >
                <Minus className="h-4 w-4 text-foreground" />
              </Button>
              <span className="mx-auto w-10 text-center text-sm">
                {childSeat}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 bg-muted/0"
                onClick={() => handleChange(childSeat + 1, setChildSeat, 0, 5)}
                disabled={disabled || childSeat >= 5}
              >
                <Plus className="h-4 w-4 text-foreground" />
              </Button>
            </div>
          </div>
        </div>

        {/* Booster Seat */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium block">
            Booster Seat (4-6 Years){" "}
            <span className="text-muted-foreground">£10.00</span>
          </label>
          <div className="flex items-center justify-between h-10 border rounded-md px-3 py-2 bg-muted/40">
            <div className="flex items-center gap-2 px-1">
              <span className="text-sm">
                {boosterSeat} Booster {boosterSeat === 1 ? "Seat" : "Seats"}
              </span>
            </div>
            <div className="flex flex-row items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 bg-muted/0"
                onClick={() =>
                  handleChange(boosterSeat - 1, setBoosterSeat, 0, 5)
                }
                disabled={disabled || boosterSeat <= 0}
              >
                <Minus className="h-4 w-4 text-foreground" />
              </Button>
              <span className="mx-auto w-10 text-center text-sm">
                {boosterSeat}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 bg-muted/0"
                onClick={() =>
                  handleChange(boosterSeat + 1, setBoosterSeat, 0, 5)
                }
                disabled={disabled || boosterSeat >= 5}
              >
                <Plus className="h-4 w-4 text-foreground" />
              </Button>
            </div>
          </div>
        </div>

        {/* Wheelchair */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium block">
            Foldable Wheelchair{" "}
            <span className="text-muted-foreground">£25.00</span>
          </label>
          <div className="flex items-center justify-between h-10 border rounded-md px-3 py-2 bg-muted/40">
            <div className="flex items-center gap-2 px-1">
              <span className="text-sm">
                {wheelchair} {wheelchair === 1 ? "Wheelchair" : "Wheelchairs"}
              </span>
            </div>
            <div className="flex flex-row items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 bg-muted/0"
                onClick={() =>
                  handleChange(wheelchair - 1, setWheelchair, 0, 2)
                }
                disabled={disabled || wheelchair <= 0}
              >
                <Minus className="h-4 w-4 text-foreground" />
              </Button>
              <span className="mx-auto w-10 text-center text-sm">
                {wheelchair}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 bg-muted/0"
                onClick={() =>
                  handleChange(wheelchair + 1, setWheelchair, 0, 2)
                }
                disabled={disabled || wheelchair >= 2}
              >
                <Plus className="h-4 w-4 text-foreground" />
              </Button>
            </div>
          </div>
        </div>

        {/* Save button */}
        <Button
          type="button"
          onClick={onBack}
          className="w-full h-10 text-sm font-medium mt-2"
          disabled={disabled}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
