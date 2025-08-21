import * as React from "react";
import { ChevronLeft, Minus, Plus, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Component props
interface PassengerLuggageFormProps {
  passengers: number;
  setPassengers: (count: number) => void;
  checkedLuggage: number;
  setCheckedLuggage: (count: number) => void;
  handLuggage: number;
  setHandLuggage: (count: number) => void;
  onBack: () => void;
  className?: string;
}

export function PassengerLuggageForm({
  passengers,
  setPassengers,
  checkedLuggage,
  setCheckedLuggage,
  handLuggage,
  setHandLuggage,
  onBack,
  className,
}: PassengerLuggageFormProps) {
  const handleChange = (
    newValue: number,
    setter: (count: number) => void,
    min: number = 0
  ) => {
    if (newValue >= min) {
      setter(newValue);
    }
  };

  return (
    <Card
      className={`border border-border/60 rounded-md shadow-sm ${
        className || ""
      }`}
    >
      <CardContent className="pt-4 pb-4 space-y-4">
        {/* Back button */}
        <div className="flex items-center mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-9 w-9 mr-3"
            onClick={onBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h3 className="text-lg font-medium">Passengers & Luggage</h3>
        </div>

        {/* Passenger selection */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium block">
              Number of Passengers
            </label>
            <div className="flex items-center justify-between h-12 border rounded-md p-2 bg-muted/40">
              <div className="flex items-center gap-2 px-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {passengers} {passengers === 1 ? "Passenger" : "Passengers"}
                </span>
              </div>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border-border/50"
                  onClick={() => handleChange(passengers - 1, setPassengers)}
                  disabled={passengers <= 1}
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Decrease</span>
                </Button>
                <span className="w-10 text-center text-sm font-medium">
                  {passengers}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border-border/50"
                  onClick={() => handleChange(passengers + 1, setPassengers)}
                  disabled={passengers >= 8}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Increase</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Checked Luggage selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium block">
              Checked Luggage (Large Luggage)
            </label>
            <div className="flex items-center justify-between h-12 border rounded-md p-2 bg-muted/40">
              <div className="flex items-center gap-2 px-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {checkedLuggage} Large {checkedLuggage === 1 ? "Luggage" : "Luggage"}
                </span>
              </div>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border-border/50"
                  onClick={() =>
                    handleChange(checkedLuggage - 1, setCheckedLuggage, 0)
                  }
                  disabled={checkedLuggage <= 0}
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Decrease</span>
                </Button>
                <span className="w-10 text-center text-sm font-medium">
                  {checkedLuggage}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border-border/50"
                  onClick={() =>
                    handleChange(checkedLuggage + 1, setCheckedLuggage, 0)
                  }
                  disabled={checkedLuggage >= 8}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Increase</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Hand Luggage selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium block">
              Hand Luggage (Small Luggage)
            </label>
            <div className="flex items-center justify-between h-12 border rounded-md p-2 bg-muted/40">
              <div className="flex items-center gap-2 px-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {handLuggage} Small {handLuggage === 1 ? "Luggage" : "Luggage"}
                </span>
              </div>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border-border/50"
                  onClick={() =>
                    handleChange(handLuggage - 1, setHandLuggage, 0)
                  }
                  disabled={handLuggage <= 0}
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Decrease</span>
                </Button>
                <span className="w-10 text-center text-sm font-medium">
                  {handLuggage}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border-border/50"
                  onClick={() =>
                    handleChange(handLuggage + 1, setHandLuggage, 0)
                  }
                  disabled={handLuggage >= 8}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Increase</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Done button */}
        <Button onClick={onBack} className="w-full h-10 text-sm font-medium">
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
