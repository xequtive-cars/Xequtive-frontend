"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Wifi, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Location } from "@/components/map/MapComponent";
import Image from "next/image";

// Import types from our common types file
import { VehicleOption, FareResponse } from "./common/types";

// Re-export the types
export type { VehicleOption, FareResponse };

interface VehicleSelectionProps {
  fareData: FareResponse;
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  selectedDate: Date | undefined;
  selectedTime: string;
  passengers: number;
  checkedLuggage: number;
  handLuggage: number;
  onBack: () => void;
  onSelectVehicle: (vehicle: VehicleOption) => void;
  layout?: "grid" | "vertical"; // Optional layout prop, defaults to grid
}

export default function VehicleSelection({
  fareData,
  pickupLocation,
  dropoffLocation,
  selectedDate,
  selectedTime,
  passengers,
  checkedLuggage,
  handLuggage,
  onBack,
  onSelectVehicle,
  layout = "grid", // Default to grid layout
}: VehicleSelectionProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  );
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // Check if the vehicle capacity meets requirements
  const checkVehicleCapacity = (vehicle: VehicleOption) => {
    const passengerOk = vehicle.capacity.passengers >= passengers;
    const luggageOk = vehicle.capacity.luggage >= checkedLuggage + handLuggage;
    return { passengerOk, luggageOk, isOk: passengerOk && luggageOk };
  };

  // Get passenger and luggage summary
  const getPassengerLuggageSummary = () => {
    if (passengers === 0 && checkedLuggage === 0 && handLuggage === 0) {
      return "Not specified";
    }

    const parts = [];
    if (passengers > 0) {
      parts.push(
        `${passengers} ${passengers === 1 ? "passenger" : "passengers"}`
      );
    }

    const luggageParts = [];
    if (checkedLuggage > 0) {
      luggageParts.push(
        `${checkedLuggage} large ${checkedLuggage === 1 ? "bag" : "bags"}`
      );
    }
    if (handLuggage > 0) {
      luggageParts.push(
        `${handLuggage} small ${handLuggage === 1 ? "bag" : "bags"}`
      );
    }

    if (luggageParts.length > 0) {
      parts.push(luggageParts.join(" and "));
    }

    return parts.join(" with ");
  };

  // Handle vehicle selection
  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    const selectedVehicle = fareData.vehicleOptions.find(
      (v) => v.id === vehicleId
    );
    if (selectedVehicle) {
      onSelectVehicle(selectedVehicle);
    }
  };

  // Get journey summary
  const getJourneySummary = () => {
    if (!pickupLocation || !dropoffLocation) return null;

    // Extract distance and duration data with fallbacks
    let distance = 0;
    if (
      fareData &&
      "estimatedDistance" in fareData &&
      typeof fareData.estimatedDistance === "number"
    ) {
      distance = fareData.estimatedDistance;
    } else if (
      fareData &&
      "distance_km" in fareData &&
      typeof fareData.distance_km === "number"
    ) {
      distance = fareData.distance_km;
    } else if (fareData?.fare?.baseFare) {
      // Fallback approximation based on fare
      distance = Math.round(fareData.fare.baseFare / 3);
    }

    // Extract duration with fallbacks
    let duration = 30; // Default to 30 minutes
    if (
      fareData &&
      "estimatedTime" in fareData &&
      typeof fareData.estimatedTime === "number"
    ) {
      duration = fareData.estimatedTime;
    } else if (
      fareData &&
      "duration_min" in fareData &&
      typeof fareData.duration_min === "number"
    ) {
      duration = fareData.duration_min;
    }

    // Display journey summary
    return (
      <div className="bg-muted/30 rounded-md mb-3 text-sm overflow-hidden">
        <div
          className="flex justify-between items-center p-3 cursor-pointer hover:bg-muted/40 transition-colors"
          onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
        >
          <h3 className="font-medium">Journey Details</h3>
          <button className="text-primary">
            {isSummaryExpanded ? "Hide" : "Show"} Details
          </button>
        </div>

        {isSummaryExpanded && (
          <div className="p-3 pt-0 border-t border-border/30">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">From:</span>
                <span className="font-medium truncate max-w-[250px]">
                  {pickupLocation.address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span className="font-medium truncate max-w-[250px]">
                  {dropoffLocation.address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">When:</span>
                <span className="font-medium">
                  {selectedDate ? format(selectedDate, "MMM dd, yyyy") : ""} at{" "}
                  {selectedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance:</span>
                <span className="font-medium">
                  {distance > 0
                    ? `${distance.toFixed(1)} km`
                    : "Calculating..."}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. time:</span>
                <span className="font-medium">{duration} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Passengers:</span>
                <span className="font-medium">
                  {getPassengerLuggageSummary()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Make sure fareData is valid before rendering anything
  if (
    !fareData ||
    !fareData.vehicleOptions ||
    fareData.vehicleOptions.length === 0
  ) {
    return (
      <div className="animate-in fade-in slide-in-from-left-5 duration-500 h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Select Vehicle</h2>
          <Button variant="ghost" onClick={onBack} size="sm">
            Back to Form
          </Button>
        </div>
        <div className="p-4 border rounded-md bg-amber-50 text-amber-800">
          Unable to load vehicle options. Please try again or go back to modify
          your journey details.
        </div>
      </div>
    );
  }

  // Only render journey summary for grid layout
  const renderGridLayout = () => (
    <div className="animate-in fade-in slide-in-from-left-5 duration-500 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Select Vehicle</h2>
        <Button variant="ghost" onClick={onBack} size="sm">
          Back to Form
        </Button>
      </div>

      {/* Journey Summary */}
      {getJourneySummary()}

      {/* Vehicle Options - now in a two-column grid with flex-grow to fill available height */}
      <div className="overflow-y-auto pr-2 flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fareData.vehicleOptions.map((vehicle) => {
            const capacity = checkVehicleCapacity(vehicle);
            return (
              <Card
                key={vehicle.id}
                className={cn(
                  "border transition-all duration-200",
                  selectedVehicleId === vehicle.id
                    ? "border-primary shadow-md"
                    : "hover:border-muted-foreground/20 border-border/60",
                  !capacity.isOk && "opacity-80"
                )}
              >
                <CardContent className="p-2">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Vehicle Image - Updated with better 3D model images */}
                      <div className="relative w-12 h-8 flex-shrink-0 flex items-center justify-center">
                        {vehicle.id.includes("executive") ? (
                          <Image
                            src="/images/vehicles/mercedes-s-class.png"
                            alt={vehicle.name}
                            width={48}
                            height={32}
                            className="object-contain"
                          />
                        ) : vehicle.id.includes("mpv") ||
                          vehicle.id.includes("van") ? (
                          <Image
                            src="/images/vehicles/mercedes-v-class.png"
                            alt={vehicle.name}
                            width={48}
                            height={32}
                            className="object-contain"
                          />
                        ) : (
                          <Image
                            src="/images/vehicles/bmw-sedan.png"
                            alt={vehicle.name}
                            width={48}
                            height={32}
                            className="object-contain"
                          />
                        )}
                      </div>

                      <div className="flex-1 flex justify-between items-center">
                        <h3 className="font-medium text-sm">{vehicle.name}</h3>
                        <div className="text-right">
                          <div className="font-bold text-base">
                            £{vehicle.price.amount}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description and ETA - more compact */}
                    <div className="text-xs text-muted-foreground mb-1 line-clamp-1">
                      {vehicle.description}
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        <span>ETA {vehicle.eta} min</span>
                      </div>
                    </div>

                    {/* Capacity Badges - more compact layout */}
                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-1 mb-1">
                        <Badge
                          variant={
                            capacity.passengerOk ? "outline" : "destructive"
                          }
                          className="text-xs py-0 h-4"
                        >
                          {vehicle.capacity.passengers} seats
                        </Badge>
                        <Badge
                          variant={
                            capacity.luggageOk ? "outline" : "destructive"
                          }
                          className="text-xs py-0 h-4"
                        >
                          {vehicle.capacity.luggage} bags
                        </Badge>
                        {vehicle.features?.includes("WiFi") && (
                          <Badge
                            variant="secondary"
                            className="text-xs py-0 h-4"
                          >
                            <Wifi size={9} className="mr-1" /> WiFi
                          </Badge>
                        )}
                      </div>

                      {/* Selection Button */}
                      <Button
                        variant={
                          selectedVehicleId === vehicle.id
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="w-full h-6 text-xs"
                        onClick={() => handleVehicleSelect(vehicle.id)}
                        disabled={!capacity.isOk}
                      >
                        {selectedVehicleId === vehicle.id
                          ? "Selected"
                          : "Select"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Render vertical layout with Uber-style thin cards
  const renderVerticalLayout = () => (
    <div className="animate-in fade-in slide-in-from-left-5 duration-500 space-y-2 h-full">
      {fareData.vehicleOptions.map((vehicle) => {
        const capacity = checkVehicleCapacity(vehicle);
        return (
          <Card
            key={vehicle.id}
            className={cn(
              "border transition-all duration-200 hover:bg-accent/5",
              selectedVehicleId === vehicle.id
                ? "border-primary bg-primary/5"
                : "border-border/30",
              !capacity.isOk && "opacity-70"
            )}
            onClick={() => capacity.isOk && handleVehicleSelect(vehicle.id)}
          >
            <CardContent className="p-3 flex items-center">
              {/* Left: Vehicle Image */}
              <div className="relative w-16 h-14 flex-shrink-0 flex items-center justify-center">
                {vehicle.id.includes("executive") ? (
                  <Image
                    src="/images/vehicles/mercedes-s-class.png"
                    alt={vehicle.name}
                    width={64}
                    height={42}
                    className="object-contain"
                  />
                ) : vehicle.id.includes("mpv") || vehicle.id.includes("van") ? (
                  <Image
                    src="/images/vehicles/mercedes-v-class.png"
                    alt={vehicle.name}
                    width={64}
                    height={42}
                    className="object-contain"
                  />
                ) : (
                  <Image
                    src="/images/vehicles/bmw-sedan.png"
                    alt={vehicle.name}
                    width={64}
                    height={42}
                    className="object-contain"
                  />
                )}
              </div>

              {/* Middle: Vehicle Details */}
              <div className="flex-1 ml-3">
                <h3 className="font-semibold text-base">{vehicle.name}</h3>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <Badge variant="secondary" className="h-4 mr-1">
                      {vehicle.capacity.passengers}
                    </Badge>
                    seats
                  </span>
                  <span className="flex items-center">
                    <Badge variant="secondary" className="h-4 mr-1">
                      {vehicle.capacity.luggage}
                    </Badge>
                    bags
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Clock size={10} className="text-muted-foreground" />
                    {vehicle.eta} min
                  </span>
                </div>
              </div>

              {/* Right: Price and Selection */}
              <div className="text-right ml-2">
                <div className="font-bold text-lg">£{vehicle.price.amount}</div>

                {selectedVehicleId === vehicle.id && (
                  <div className="text-xs text-primary font-medium">
                    Selected
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return layout === "vertical" ? renderVerticalLayout() : renderGridLayout();
}
