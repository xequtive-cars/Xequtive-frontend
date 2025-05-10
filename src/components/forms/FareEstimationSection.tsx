import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FareEstimationSectionProps {
  fareEstimate: number | null;
  estimatedDistance: number | null;
  estimatedDuration: number | null;
  showFareEstimate: boolean;
  isEstimating: boolean;
  handleEstimateFareClick: () => void;
  handleBookRideClick: () => void;
  isBooking: boolean;
  pickupLocation: boolean;
  dropoffLocation: boolean;
}

export default function FareEstimationSection({
  fareEstimate,
  estimatedDistance,
  estimatedDuration,
  showFareEstimate,
  isEstimating,
  handleEstimateFareClick,
  handleBookRideClick,
  isBooking,
  pickupLocation,
  dropoffLocation,
}: FareEstimationSectionProps) {
  return (
    <div className="bg-primary/5 border-primary/20 border rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-medium">Fare Estimation</h3>

      {showFareEstimate && fareEstimate !== null ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-background rounded p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Fare Estimate
              </p>
              <p className="text-lg font-semibold">
                £{fareEstimate.toFixed(2)}
              </p>
            </div>
            {estimatedDistance !== null && (
              <div className="bg-background rounded p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Distance</p>
                <p className="text-lg font-semibold">
                  {(estimatedDistance * 0.621371).toFixed(1)} miles
                </p>
              </div>
            )}
            {estimatedDuration !== null && (
              <div className="bg-background rounded p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                <p className="text-lg font-semibold">
                  {Math.round(estimatedDuration / 60)} min
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleBookRideClick}
              disabled={isBooking}
              className="w-full md:w-auto"
            >
              {isBooking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking Ride...
                </>
              ) : (
                "Book Ride"
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Get an estimated fare for your journey before booking.
          </p>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleEstimateFareClick}
              disabled={isEstimating || !pickupLocation || !dropoffLocation}
              className="w-full md:w-auto"
            >
              {isEstimating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Estimating...
                </>
              ) : (
                "Estimate Fare"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
