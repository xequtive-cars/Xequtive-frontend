"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Location } from "@/components/map/MapComponent";
import Image from "next/image";
import React from "react";

// Import types from our common types file
import { VehicleOption, FareResponse } from "./common/types";

// Re-export the types
export type { VehicleOption, FareResponse };

// Helper function to get vehicle image path based on vehicle ID
const getVehicleImagePath = (vehicleId: string): string => {
  if (vehicleId.includes("standard")) {
    return "/images/vehicles/xequtive-1-removebg-preview.png";
  } else if (vehicleId.includes("executive")) {
    return "/images/vehicles/xequtive-2-removebg-preview.png";
  } else if (vehicleId.includes("mpv") || vehicleId.includes("van")) {
    return "/images/vehicles/xequtive-5-removebg-preview.png";
  } else if (vehicleId.includes("estate")) {
    return "/images/vehicles/xequtive-6-removebg-preview.png";
  } else if (vehicleId.includes("luxury")) {
    return "/images/vehicles/xequtive-8-removebg-preview.png";
  } else if (vehicleId.includes("vip")) {
    return "/images/vehicles/xequtive-9-removebg-preview.png";
  }
  // Default image
  return "/images/vehicles/xequtive-3-removebg-preview.png";
};

// Helper function to get vehicle type order for sorting
const getVehicleTypeOrder = (
  vehicleId: string,
  vehicleName: string
): number => {
  // First convert both id and name to lowercase for case-insensitive matching
  const id = vehicleId.toLowerCase();
  const name = vehicleName.toLowerCase();

  // Direct name matching - most reliable approach
  if (name.includes("standard saloon")) return 1;
  if (name.includes("estate")) return 2;
  if (name.includes("mpv-6") || name.includes("large-mpv")) return 3;
  if (name.includes("mpv-8") || name.includes("extra-large-mpv")) return 4;
  if (name.includes("executive saloon")) return 5;
  if (name.includes("executive mpv")) return 6;
  if (name.includes("vip") && name.includes("saloon")) return 7;
  if (name.includes("vip") && (name.includes("mpv") || name.includes("suv"))) return 8;
  if (
    name.includes("wheelchair") ||
    name.includes("wav") ||
    name.includes("accessible")
  )
    return 9;

  // Fallback to ID-based checks if name doesn't match specific patterns
  if (id.includes("standard")) return 1;
  if (id.includes("estate")) return 2;
  if (id.includes("large-mpv") || id.includes("mpv-6")) return 3;
  if (id.includes("extra-large-mpv") || id.includes("mpv-8")) return 4;
  if (id.includes("executive-saloon")) return 5;
  if (id.includes("executive-mpv")) return 6;
  if (id.includes("vip") && !id.includes("mpv")) return 7;
  if (id.includes("vip-mpv") || (id.includes("vip") && id.includes("mpv"))) return 8;
  if (id.includes("wav")) return 9;

  // Default sorting
  return 10;
};

interface VehicleSelectionProps {
  fareData: FareResponse;
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  additionalStops?: Location[];
  selectedDate: Date | undefined;
  selectedTime: string;
  passengers: number;
  checkedLuggage: number;
  mediumLuggage: number;
  handLuggage: number;
  babySeat?: number;
  childSeat?: number;
  boosterSeat?: number;
  wheelchair?: number;
  onBack: () => void;
  onSelectVehicle: (vehicle: VehicleOption) => void;
  layout?: "grid" | "vertical"; // Optional layout prop, defaults to grid
  bookingType?: 'one-way' | 'hourly' | 'return';
  hours?: number;
}

export default function VehicleSelection({
  fareData,
  pickupLocation,
  dropoffLocation,
  additionalStops = [],
  selectedDate,
  selectedTime,
  passengers,
  checkedLuggage,
  mediumLuggage,
  handLuggage,
  babySeat = 0,
  childSeat = 0,
  boosterSeat = 0,
  wheelchair = 0,
  onBack,
  onSelectVehicle,
  layout = "grid", // Default to grid layout
  bookingType = 'one-way',
  hours = 1,
}: VehicleSelectionProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  );
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // Update the sorting logic to use both ID and name
  const sortedVehicles = React.useMemo(() => {
    if (!fareData || !fareData.vehicleOptions) return [];

    // Filter out Estate class vehicles (commented out for future use)
    const filtered = fareData.vehicleOptions.filter(vehicle => {
      const id = vehicle.id.toLowerCase();
      const name = vehicle.name.toLowerCase();
      // Comment out Estate class - don't delete from backend, just remove from frontend
      // Comment out MPV-8 - don't delete from backend, just remove from frontend
      return !id.includes("estate") && !name.includes("estate") &&
             !id.includes("mpv-8") && !name.includes("mpv-8");
    });

    const sorted = [...filtered].sort(
      (a, b) =>
        getVehicleTypeOrder(a.id, a.name) - getVehicleTypeOrder(b.id, b.name)
    );

    // Debug logging to check for duplicates

    return sorted;
  }, [fareData]);

  // Check if the vehicle capacity meets requirements
  const checkVehicleCapacity = (vehicle: VehicleOption) => {
    const passengerOk = vehicle.capacity.passengers >= passengers;
    const luggageOk =
      vehicle.capacity.luggage >= checkedLuggage + mediumLuggage + handLuggage;
    return { passengerOk, luggageOk, isOk: passengerOk && luggageOk };
  };

  // Get passenger and luggage summary
  const getPassengerLuggageSummary = () => {
    if (
      passengers === 0 &&
      checkedLuggage === 0 &&
      mediumLuggage === 0 &&
      handLuggage === 0
    ) {
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
        `${checkedLuggage} large ${checkedLuggage === 1 ? "luggage" : "luggage"}`
      );
    }
    if (mediumLuggage > 0) {
      luggageParts.push(
        `${mediumLuggage} medium ${mediumLuggage === 1 ? "luggage" : "luggage"}`
      );
    }
    if (handLuggage > 0) {
      luggageParts.push(
        `${handLuggage} small ${handLuggage === 1 ? "luggage" : "luggage"}`
      );
    }

    if (luggageParts.length > 0) {
      parts.push(luggageParts.join(" and "));
    }

    return parts.join(" with ");
  };

  // Handle vehicle selection
  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = sortedVehicles.find((v) => v.id === vehicleId);
    if (vehicle) {
      // Trigger callback with the selected vehicle
      onSelectVehicle(vehicle);
      setSelectedVehicleId(vehicleId);
    }
  };

  // Helper function to format duration in hours:minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Get journey summary
  const getJourneySummary = () => {
    if (!pickupLocation || !dropoffLocation) return null;

    // Extract distance and duration data with fallbacks
    let distance = 0;
    if (
      fareData &&
      "journey" in fareData &&
      fareData.journey &&
      typeof fareData.journey.distance_miles === "number"
    ) {
      distance = fareData.journey.distance_miles;
    }

    let duration = 0;
    if (
      fareData &&
      "journey" in fareData &&
      fareData.journey &&
      typeof fareData.journey.duration_minutes === "number"
    ) {
      duration = fareData.journey.duration_minutes;
    }

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
                    ? `${distance.toFixed(1)} miles`
                    : "Calculating..."}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. time:</span>
                <span className="font-medium">{formatDuration(duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Passengers:</span>
                <span className="font-medium">
                  {getPassengerLuggageSummary()}
                </span>
              </div>

              {/* Display stops if any */}
              {additionalStops && additionalStops.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stops:</span>
                  <span className="font-medium">
                    {additionalStops.length} stop{additionalStops.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* Display additional requests if any */}
              {(babySeat > 0 || childSeat > 0 || boosterSeat > 0 || wheelchair > 0) && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Additional Requests:</span>
                  <span className="font-medium">
                    {[
                      babySeat > 0 && `${babySeat} baby seat${babySeat !== 1 ? "s" : ""}`,
                      childSeat > 0 && `${childSeat} child seat${childSeat !== 1 ? "s" : ""}`,
                      boosterSeat > 0 && `${boosterSeat} booster seat${boosterSeat !== 1 ? "s" : ""}`,
                      wheelchair > 0 && `${wheelchair} wheelchair${wheelchair !== 1 ? "s" : ""}`
                    ].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}

              {/* Display fee notifications if any */}
              {fareData.notifications && fareData.notifications.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/30">
                  <span className="text-muted-foreground font-medium block mb-1">
                    Additional Fees:
                  </span>
                  <ul className="text-xs space-y-1 text-amber-700">
                    {fareData.notifications.map((notification, index) => (
                      <li key={index} className="flex items-start gap-1.5">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5"></span>
                        <span>{notification}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Only render journey summary for grid layout
  const renderGridLayout = () => (
    <div className="animate-in fade-in slide-in-from-left-5 duration-500 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Select Vehicle</h2>
      </div>

      {/* Mobile & Tablet View: Vehicle Selection First */}
      <div className="lg:hidden">
        {/* Vehicle selection container with increased height */}
        <div className="mb-6 overflow-y-auto max-h-[calc(85vh-8rem+100px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sortedVehicles.map((vehicle) => renderVehicleCard(vehicle))}
          </div>
        </div>

        {/* Journey summary displayed after vehicle selection */}
        <div className="mt-4">{getJourneySummary()}</div>
      </div>

      {/* Desktop View: Journey Summary First */}
      <div className="hidden lg:block">
        {/* Journey Summary */}
        {getJourneySummary()}

        {/* Vehicle Options */}
        <div className="overflow-y-auto pr-2 flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sortedVehicles.map((vehicle) => renderVehicleCard(vehicle))}
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to render a vehicle card (extracted for reuse)
  const renderVehicleCard = (vehicle: VehicleOption) => {
    const capacity = checkVehicleCapacity(vehicle);
    
    const vehicleImagePath = getVehicleImagePath(vehicle.id);

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
        <CardContent className="py-2 px-3">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2">
              {/* Vehicle Image - responsive sizing */}
              <div className="relative w-16 sm:w-20 md:w-24 h-12 sm:h-14 md:h-16 flex-shrink-0 flex items-center justify-center">
                <Image
                  src={vehicleImagePath}
                  alt={vehicle.name}
                  width={80}
                  height={50}
                  className="object-contain transform scale-125 sm:scale-150 md:scale-175"
                />
              </div>

              <div className="flex-1 flex justify-between items-center gap-2 min-w-0">
                <h3 className="font-bold text-lg sm:text-xl md:text-xl truncate min-w-0 flex-1">
                  {vehicle.name}
                </h3>
                <div className="text-right min-w-0 flex-shrink-0">
                  {bookingType === 'return' ? (
                    <div className="space-y-1">
                      <div className="font-bold text-sm sm:text-lg md:text-xl tracking-tight font-mono text-foreground notranslate whitespace-nowrap">
                        £{vehicle.price.amount}
                      </div>
                    </div>
                  ) : bookingType === 'hourly' ? (
                    <div className="space-y-1">
                      <div className="font-bold text-sm sm:text-lg md:text-xl tracking-tight font-mono notranslate whitespace-nowrap">
                        £{vehicle.price.amount}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        Total for {hours}h
                      </div>
                      {vehicle.hourlyRate ? (
                        <div className="text-xs text-foreground font-medium notranslate">
                          £{vehicle.hourlyRate}/hour
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground notranslate">
                          £{(vehicle.price.amount / hours).toFixed(0)}/hour
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="font-bold text-sm sm:text-lg md:text-xl tracking-tight font-mono notranslate whitespace-nowrap">
                      £{vehicle.price.amount}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description - with better spacing */}
            <div className="text-xs sm:text-sm text-muted-foreground mt-1 mb-2 line-clamp-1">
              {vehicle.description}
            </div>

            {/* Capacity Badges - responsive sizing */}
            <div className="mt-auto">
                                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                      <Badge
                        variant={capacity.passengerOk ? "outline" : "destructive"}
                        className="text-xs sm:text-sm py-0 h-5 sm:h-6"
                      >
                        {vehicle.capacity.passengers} Passengers
                      </Badge>
                      <Badge
                        variant={capacity.luggageOk ? "outline" : "destructive"}
                        className="text-xs sm:text-sm py-0 h-5 sm:h-6"
                      >
                        {vehicle.capacity.luggage} Luggage
                      </Badge>
                {vehicle.features?.includes("WiFi") && (
                  <Badge
                    variant="secondary"
                    className="text-xs sm:text-sm py-0 h-5 sm:h-6"
                  >
                    <Wifi size={12} className="mr-1" /> WiFi
                  </Badge>
                )}
              </div>

              {/* Selection Button */}
              <Button
                variant={
                  selectedVehicleId === vehicle.id ? "default" : "outline"
                }
                size="sm"
                className="w-full h-7 sm:h-8 text-xs sm:text-sm font-medium"
                onClick={() => handleVehicleSelect(vehicle.id)}
                disabled={!capacity.isOk}
              >
                {selectedVehicleId === vehicle.id ? "Selected" : "Select"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render vertical layout with larger images and enlarged text
  const renderVerticalLayout = () => (
    <div className="animate-in fade-in slide-in-from-left-5 duration-500 space-y-2 h-full">
      {sortedVehicles.map((vehicle) => {
        const capacity = checkVehicleCapacity(vehicle);
        const vehicleImagePath = getVehicleImagePath(vehicle.id);

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
            <CardContent className="py-2 px-3 flex items-center">
              {/* Left: Vehicle Image - responsive sizing */}
              <div className="relative w-20 sm:w-24 md:w-28 h-14 sm:h-16 flex-shrink-0 flex items-center justify-center">
                <Image
                  src={vehicleImagePath}
                  alt={vehicle.name}
                  width={112}
                  height={70}
                  className="object-contain transform scale-150 sm:scale-175 md:scale-200"
                />
              </div>

              {/* Middle: Vehicle Details - responsive text sizes */}
              <div className="flex-1 ml-3 sm:ml-4">
                <h3 className="font-bold text-sm xs:text-[17px] sm:text-2xl md:text-xl mb-1 sm:mb-2">
                  {vehicle.name}
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs xs:text-sm sm:text-base text-muted-foreground">
                  <span className="flex items-center">
                    <Badge
                      variant="secondary"
                      className="h-4 xs:h-5 sm:h-6 mr-1 text-xs"
                    >
                      {vehicle.capacity.passengers}
                    </Badge>
                    Passengers
                  </span>
                  <span className="flex items-center">
                    <Badge
                      variant="secondary"
                      className="h-4 xs:h-5 sm:h-6 mr-1 text-xs"
                    >
                      {vehicle.capacity.luggage}
                    </Badge>
                    Luggage
                  </span>
                </div>
              </div>

              {/* Right: Price - responsive text sizes */}
              <div className="text-right ml-2">
                {bookingType === 'return' ? (
                  <div className="space-y-1">
                    <div className="font-bold text-lg xs:text-xl sm:text-2xl md:text-2xl tracking-tight font-mono text-foreground">
                      £{vehicle.price.amount}
                    </div>
                  </div>
                ) : bookingType === 'hourly' ? (
                  <div className="space-y-1">
                    <div className="font-bold text-lg xs:text-xl sm:text-2xl md:text-2xl tracking-tight font-mono">
                      £{vehicle.price.amount}
                    </div>
                    {vehicle.hourlyRate ? (
                      <div className="text-xs text-foreground font-medium notranslate">
                        £{vehicle.hourlyRate}/hour
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground notranslate">
                        £{(vehicle.price.amount / hours).toFixed(0)}/hour
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="font-bold text-lg xs:text-xl sm:text-2xl md:text-2xl tracking-tight font-mono">
                    £{vehicle.price.amount}
                  </div>
                )}

                {selectedVehicleId === vehicle.id && (
                  <div className="text-xs sm:text-sm text-primary font-medium">
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

  return layout === "vertical" ? renderVerticalLayout() : renderGridLayout();
}
