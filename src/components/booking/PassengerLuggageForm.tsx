// Importing necessary components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ArrowLeft } from "lucide-react";

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
  // Helper functions for incrementing and decrementing
  const increment = (
    current: number,
    setter: (count: number) => void,
    max: number = 99
  ) => {
    if (current < max) {
      setter(current + 1);
    }
  };

  const decrement = (
    current: number,
    setter: (count: number) => void,
    min: number = 0
  ) => {
    if (current > min) {
      setter(current - 1);
    }
  };

  return (
    <Card
      className={`border border-border/60 rounded-md shadow-sm ${
        className || ""
      }`}
    >
      <CardContent className="p-6 space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-start gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft size={20} />
          </Button>
          <h3 className="text-base font-medium">Passengers & Luggage</h3>
        </div>

        {/* Number of Passengers */}
        <div className="space-y-2.5">
          <label className="text-base font-medium text-foreground/90 block">
            Number of Passengers
          </label>
          <div className="flex items-center justify-between h-12 rounded-md border border-input px-4 bg-muted/40">
            <span className="text-base">
              {passengers} {passengers === 1 ? "Passenger" : "Passengers"}
            </span>
            <div className="flex items-center gap-2.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => decrement(passengers, setPassengers, 1)}
                disabled={passengers <= 1}
                className="h-8 w-8 p-0 hover:bg-accent rounded-md"
              >
                <Minus size={16} />
              </Button>
              <span className="text-base w-6 text-center font-medium">
                {passengers}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => increment(passengers, setPassengers, 8)}
                disabled={passengers >= 8}
                className="h-8 w-8 p-0 hover:bg-accent rounded-md"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Checked Luggage */}
        <div className="space-y-2.5">
          <label className="text-base font-medium text-foreground/90 block">
            Checked Luggage (Large Bags)
          </label>
          <div className="flex items-center justify-between h-12 rounded-md border border-input px-4 bg-muted/40">
            <span className="text-base">
              {checkedLuggage} Large {checkedLuggage === 1 ? "Bag" : "Bags"}
            </span>
            <div className="flex items-center gap-2.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => decrement(checkedLuggage, setCheckedLuggage)}
                disabled={checkedLuggage <= 0}
                className="h-8 w-8 p-0 hover:bg-accent rounded-md"
              >
                <Minus size={16} />
              </Button>
              <span className="text-base w-6 text-center font-medium">
                {checkedLuggage}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => increment(checkedLuggage, setCheckedLuggage, 8)}
                disabled={checkedLuggage >= 8}
                className="h-8 w-8 p-0 hover:bg-accent rounded-md"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Hand Luggage */}
        <div className="space-y-2.5">
          <label className="text-base font-medium text-foreground/90 block">
            Hand Luggage (Small Bags)
          </label>
          <div className="flex items-center justify-between h-12 rounded-md border border-input px-4 bg-muted/40">
            <span className="text-base">
              {handLuggage} Small {handLuggage === 1 ? "Bag" : "Bags"}
            </span>
            <div className="flex items-center gap-2.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => decrement(handLuggage, setHandLuggage)}
                disabled={handLuggage <= 0}
                className="h-8 w-8 p-0 hover:bg-accent rounded-md"
              >
                <Minus size={16} />
              </Button>
              <span className="text-base w-6 text-center font-medium">
                {handLuggage}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => increment(handLuggage, setHandLuggage, 8)}
                disabled={handLuggage >= 8}
                className="h-8 w-8 p-0 hover:bg-accent rounded-md"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={onBack}
          className="w-full h-12 text-base font-medium rounded-md"
        >
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
