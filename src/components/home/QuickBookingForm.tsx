"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { UkLocationInput } from "@/components/ui/uk-location-input";

interface QuickBookingFormProps {
  isAuthenticated: boolean;
}

export function QuickBookingForm({ isAuthenticated }: QuickBookingFormProps) {
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [hasLocations, setHasLocations] = useState(false);

  // Update hasLocations when pickup or dropoff location changes
  useEffect(() => {
    setHasLocations(!!pickupLocation && !!dropoffLocation);
  }, [pickupLocation, dropoffLocation]);

  return (
    <div className="w-full max-w-md bg-background rounded-xl border shadow-md relative">
      <div className="p-6 relative">
        {/* Vertical connecting line */}
        <div className="absolute left-8 top-16 bottom-16 border-l-2 border-primary/30 z-0"></div>

        <div className="space-y-6">
          {/* Pickup location */}
          <div className="relative flex items-start">
            <div className="absolute left-0 top-3 w-6 h-6 rounded-full bg-primary"></div>
            <div className="pl-12 w-full">
              <UkLocationInput
                placeholder="Enter pickup address"
                value={pickupLocation}
                onChange={setPickupLocation}
                onLocationSelect={(location) =>
                  setPickupLocation(location.address)
                }
                locationType="pickup"
                initialSuggestionsTitle="Suggested pickup locations"
                className="text-sm h-12 rounded-md bg-background !w-full [&>input]:h-12 [&>input]:text-sm [&>input]:rounded-md [&>input]:px-3 [&>input]:bg-background [&>div]:z-[999999] [&>div>div]:z-[999999]"
              />
            </div>
          </div>

          {/* Dropoff location */}
          <div className="relative flex items-start">
            <div className="absolute left-0 top-3 w-6 h-6 rounded-full bg-red-500"></div>
            <div className="pl-12 w-full">
              <UkLocationInput
                placeholder="Enter destination address"
                value={dropoffLocation}
                onChange={setDropoffLocation}
                onLocationSelect={(location) =>
                  setDropoffLocation(location.address)
                }
                locationType="dropoff"
                initialSuggestionsTitle="Suggested dropoff locations"
                className="text-sm h-12 rounded-md bg-background !w-full [&>input]:h-12 [&>input]:text-sm [&>input]:rounded-md [&>input]:px-3 [&>input]:bg-background [&>div]:z-[999999] [&>div>div]:z-[999999]"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2">
            {isAuthenticated ? (
              <Link
                href={
                  hasLocations
                    ? `/dashboard/new-booking?pickup=${encodeURIComponent(
                        pickupLocation
                      )}&dropoff=${encodeURIComponent(dropoffLocation)}`
                    : "/dashboard/new-booking"
                }
                className="w-full block"
              >
                <Button
                  size="lg"
                  className="w-full rounded-md shadow-sm font-medium h-12"
                >
                  {hasLocations ? "More Info" : "Book a Ride"}{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signup" className="w-full block">
                <Button
                  size="lg"
                  className="w-full rounded-md shadow-sm font-medium h-12"
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
