"use client";

/**
 * Booking Summary Component
 *
 * A premium component to display booking details summary
 */

import * as React from "react";
import { MapPin, Clock, Users, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Location } from "@/components/map/MapComponent";

interface BookingSummaryProps {
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  additionalStops: Location[];
  date: Date | undefined;
  time: string;
  passengers: number;
  checkedLuggage: number;
  mediumLuggage: number;
  handLuggage: number;
  className?: string;
}

export function BookingSummary({
  pickupLocation,
  dropoffLocation,
  additionalStops,
  date,
  time,
  passengers,
  checkedLuggage,
  mediumLuggage,
  handLuggage,
  className,
}: BookingSummaryProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Not selected";
    return format(date, "EEE, MMM d, yyyy");
  };

  return (
    <div className={cn("space-y-4 py-3", className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Booking Summary</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary text-sm flex items-center"
        >
          {isExpanded ? "Hide Details" : "Show Details"}
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Locations */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Pickup Location
                </p>
                <p className="text-sm font-medium">
                  {pickupLocation?.address || "Not selected"}
                </p>
              </div>
            </div>

            {additionalStops.map((stop, index) => (
              <div
                key={`summary-stop-${index}`}
                className="flex items-start gap-3"
              >
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Additional Stop {index + 1}
                  </p>
                  <p className="text-sm font-medium">{stop.address}</p>
                </div>
              </div>
            ))}

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Dropoff Location
                </p>
                <p className="text-sm font-medium">
                  {dropoffLocation?.address || "Not selected"}
                </p>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="flex items-start gap-3 pt-2">
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 mt-0.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Pickup Date & Time
              </p>
              <p className="text-sm font-medium">
                {formatDate(date)}
                {time ? `, ${time}` : ""}
              </p>
            </div>
          </div>

          {/* Passengers and Luggage */}
          <div className="flex items-start gap-3 pt-2">
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 mt-0.5">
              <Users className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Passengers & Luggage
              </p>
              <p className="text-sm font-medium">
                {passengers} {passengers === 1 ? "Passenger" : "Passengers"}
                {(checkedLuggage > 0 ||
                  mediumLuggage > 0 ||
                  handLuggage > 0) && <span className="ml-1">with </span>}
                {checkedLuggage > 0 && (
                  <span>
                    {checkedLuggage} large{" "}
                    {checkedLuggage === 1 ? "bag" : "bags"}
                  </span>
                )}
                {checkedLuggage > 0 &&
                  (mediumLuggage > 0 || handLuggage > 0) && <span>, </span>}
                {mediumLuggage > 0 && (
                  <span>
                    {mediumLuggage} medium{" "}
                    {mediumLuggage === 1 ? "bag" : "bags"}
                  </span>
                )}
                {mediumLuggage > 0 && handLuggage > 0 && <span>, </span>}
                {handLuggage > 0 && (
                  <span>
                    {handLuggage} small {handLuggage === 1 ? "bag" : "bags"}
                  </span>
                )}
              </p>
            </div>
          </div>
        </>
      )}

      {/* When collapsed, show just a simple summary line */}
      {!isExpanded && (
        <div className="text-sm text-muted-foreground">
          {pickupLocation?.address
            ? pickupLocation.address.split(",")[0]
            : "Not selected"}{" "}
          →
          {additionalStops.length > 0 &&
            ` + ${additionalStops.length} stop${
              additionalStops.length > 1 ? "s" : ""
            } → `}
          {dropoffLocation?.address
            ? dropoffLocation.address.split(",")[0]
            : "Not selected"}{" "}
          •{date ? ` ${format(date, "MMM d")}` : ""} {time ? `, ${time}` : ""} •
          {passengers} passenger{passengers !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
