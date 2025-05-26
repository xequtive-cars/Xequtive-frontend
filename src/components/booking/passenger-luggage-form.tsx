"use client";

/**
 * Passenger and Luggage Form Component
 *
 * A premium form for selecting passenger count and luggage options
 */

import * as React from "react";
import { ChevronLeft, Minus, Plus, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface PassengerLuggageFormProps {
  passengers: number;
  setPassengers: (value: number) => void;
  checkedLuggage: number;
  setCheckedLuggage: (value: number) => void;
  mediumLuggage: number;
  setMediumLuggage: (value: number) => void;
  handLuggage: number;
  setHandLuggage: (value: number) => void;
  onBack: () => void;
  className?: string;
}

export function PassengerLuggageForm({
  passengers,
  setPassengers,
  checkedLuggage,
  setCheckedLuggage,
  mediumLuggage,
  setMediumLuggage,
  handLuggage,
  setHandLuggage,
  onBack,
  className,
}: PassengerLuggageFormProps) {
  // Helper function to handle number inputs with min/max constraints
  const handleChange = (
    value: number,
    setValue: (value: number) => void,
    min = 1,
    max = 8
  ) => {
    if (value < min) value = min;
    if (value > max) value = max;
    setValue(value);
  };

  return (
    <Card
      className={cn("border border-border/60 rounded-md shadow-sm", className)}
    >
      <CardContent className="pt-8 space-y-8">
        {/* Back button */}
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-12 w-12 mr-4"
            onClick={onBack}
          >
            <ChevronLeft className="h-7 w-7" />
          </Button>
          <h3 className="text-2xl font-medium">Passengers & Luggage</h3>
        </div>

        {/* Passenger selection */}
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-lg font-medium block">
              Number of Passengers
            </label>
            <div className="flex items-center justify-between h-16 border rounded-md p-4 bg-muted/40">
              <div className="flex items-center gap-3 px-3">
                <Users className="h-6 w-6 text-muted-foreground" />
                <span className="text-lg">
                  {passengers} {passengers === 1 ? "Passenger" : "Passengers"}
                </span>
              </div>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full border-border/50"
                  onClick={() => handleChange(passengers - 1, setPassengers)}
                  disabled={passengers <= 1}
                >
                  <Minus className="h-5 w-5" />
                  <span className="sr-only">Decrease</span>
                </Button>
                <span className="w-14 text-center text-lg font-medium">
                  {passengers}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full border-border/50"
                  onClick={() => handleChange(passengers + 1, setPassengers)}
                  disabled={passengers >= 8}
                >
                  <Plus className="h-5 w-5" />
                  <span className="sr-only">Increase</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Checked Luggage selection */}
          <div className="space-y-3">
            <label className="text-lg font-medium block">
              Checked Luggage (Large Bags)
            </label>
            <div className="flex items-center justify-between h-16 border rounded-md p-4 bg-muted/40">
              <div className="flex items-center gap-3 px-3">
                <Briefcase className="h-6 w-6 text-muted-foreground" />
                <span className="text-lg">
                  {checkedLuggage} Large {checkedLuggage === 1 ? "Bag" : "Bags"}
                </span>
              </div>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full border-border/50"
                  onClick={() =>
                    handleChange(checkedLuggage - 1, setCheckedLuggage, 0)
                  }
                  disabled={checkedLuggage <= 0}
                >
                  <Minus className="h-5 w-5" />
                  <span className="sr-only">Decrease</span>
                </Button>
                <span className="w-14 text-center text-lg font-medium">
                  {checkedLuggage}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full border-border/50"
                  onClick={() =>
                    handleChange(checkedLuggage + 1, setCheckedLuggage, 0)
                  }
                  disabled={checkedLuggage >= 8}
                >
                  <Plus className="h-5 w-5" />
                  <span className="sr-only">Increase</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Medium Luggage selection */}
          <div className="space-y-3">
            <label className="text-lg font-medium block">
              Medium Luggage (Medium Bags)
            </label>
            <div className="flex items-center justify-between h-16 border rounded-md p-4 bg-muted/40">
              <div className="flex items-center gap-3 px-3">
                <Briefcase className="h-6 w-6 text-muted-foreground" />
                <span className="text-lg">
                  {mediumLuggage} Medium {mediumLuggage === 1 ? "Bag" : "Bags"}
                </span>
              </div>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full border-border/50"
                  onClick={() =>
                    handleChange(mediumLuggage - 1, setMediumLuggage, 0)
                  }
                  disabled={mediumLuggage <= 0}
                >
                  <Minus className="h-5 w-5" />
                  <span className="sr-only">Decrease</span>
                </Button>
                <span className="w-14 text-center text-lg font-medium">
                  {mediumLuggage}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full border-border/50"
                  onClick={() =>
                    handleChange(mediumLuggage + 1, setMediumLuggage, 0)
                  }
                  disabled={mediumLuggage >= 8}
                >
                  <Plus className="h-5 w-5" />
                  <span className="sr-only">Increase</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Hand Luggage selection */}
          <div className="space-y-3">
            <label className="text-lg font-medium block">
              Hand Luggage (Small Bags)
            </label>
            <div className="flex items-center justify-between h-16 border rounded-md p-4 bg-muted/40">
              <div className="flex items-center gap-3 px-3">
                <Briefcase className="h-6 w-6 text-muted-foreground" />
                <span className="text-lg">
                  {handLuggage} Small {handLuggage === 1 ? "Bag" : "Bags"}
                </span>
              </div>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full border-border/50"
                  onClick={() =>
                    handleChange(handLuggage - 1, setHandLuggage, 0)
                  }
                  disabled={handLuggage <= 0}
                >
                  <Minus className="h-5 w-5" />
                  <span className="sr-only">Decrease</span>
                </Button>
                <span className="w-14 text-center text-lg font-medium">
                  {handLuggage}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full border-border/50"
                  onClick={() =>
                    handleChange(handLuggage + 1, setHandLuggage, 0)
                  }
                  disabled={handLuggage >= 8}
                >
                  <Plus className="h-5 w-5" />
                  <span className="sr-only">Increase</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Done button */}
        <Button onClick={onBack} className="w-full h-14 text-lg font-medium">
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
