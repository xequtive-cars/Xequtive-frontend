"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Wifi, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Location } from "@/components/map/MapComponent";
import Image from "next/image";
import React from "react";

// Import types from hourly booking
import { HourlyVehicleOption, HourlyFareResponse } from "@/types/hourlyBooking";

// Re-export the types
export type { HourlyVehicleOption, HourlyFareResponse };

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
  fareData: HourlyFareResponse;
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
  onSelectVehicle: (vehicle: HourlyVehicleOption) => void;
  layout?: "grid" | "vertical"; // Optional layout prop, defaults to grid
  hours?: number; // Add hours for hourly bookings
  bookingType?: 'one-way' | 'hourly' | 'return'; // Add booking type
}

export default function HourlyVehicleSelection({
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
  hours = 4, // Default hours for hourly bookings
  bookingType = 'hourly', // Default to hourly booking
}: VehicleSelectionProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Sort vehicles by type order
  const sortedVehicles = fareData.fare?.vehicleOptions 
    ? [...fareData.fare.vehicleOptions].sort(
        (a, b) => getVehicleTypeOrder(a.id, a.name) - getVehicleTypeOrder(b.id, b.name)
      )
    : [];

  const checkVehicleCapacity = (vehicle: HourlyVehicleOption) => {
    const totalLuggage = checkedLuggage + mediumLuggage + handLuggage;
    const isOk = vehicle.capacity.passengers >= passengers && vehicle.capacity.luggage >= totalLuggage;
    return { isOk, message: isOk ? "" : "Insufficient capacity" };
  };

  const getPassengerLuggageSummary = () => {
    const totalLuggage = checkedLuggage + mediumLuggage + handLuggage;
    const parts = [];
    
    if (passengers > 0) {
      parts.push(`${passengers} passenger${passengers !== 1 ? "s" : ""}`);
    }
    
    if (totalLuggage > 0) {
      parts.push(`${totalLuggage} bag${totalLuggage !== 1 ? "s" : ""}`);
    }
    
    return parts.join(", ") || "No passengers or luggage";
  };

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    const vehicle = fareData.fare?.vehicleOptions?.find((v: HourlyVehicleOption) => v.id === vehicleId);
    if (vehicle) {
      onSelectVehicle(vehicle);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getJourneySummary = () => {
    const parts = [];
    
    if (pickupLocation?.address) {
      parts.push(`From: ${pickupLocation.address}`);
    }
    
    if (dropoffLocation?.address) {
      parts.push(`To: ${dropoffLocation.address}`);
    }
    
    if (selectedDate) {
      parts.push(`Date: ${format(selectedDate, "MMM dd, yyyy")}`);
    }
    
    if (selectedTime) {
      parts.push(`Time: ${selectedTime}`);
    }
    
    if (hours) {
      parts.push(`Duration: ${hours} hours`);
    }
    
    const passengerSummary = getPassengerLuggageSummary();
    if (passengerSummary) {
      parts.push(`Passengers: ${passengerSummary}`);
    }
    
    return parts;
  };

  // Render grid layout with vehicle showcase
  const renderGridLayout = () => (
    <div className="animate-in fade-in slide-in-from-left-5 duration-500">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Select Vehicle</h2>
        <Button variant="ghost" onClick={onBack} size="sm">
          Back to Form
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedVehicles.map((vehicle) => {
          const capacity = checkVehicleCapacity(vehicle);
          const vehicleImagePath = getVehicleImagePath(vehicle.id);
          const totalPrice = vehicle.price.amount * hours;

          return (
            <Card
              key={vehicle.id}
              className={cn(
                "border transition-all duration-200 hover:bg-accent/5 cursor-pointer",
                selectedVehicleId === vehicle.id
                  ? "border-primary bg-primary/5"
                  : "border-border/30",
                !capacity.isOk && "opacity-70"
              )}
              onClick={() => capacity.isOk && handleVehicleSelect(vehicle.id)}
            >
              <CardContent className="p-4">
                {/* Vehicle Image */}
                <div className="relative w-full h-32 mb-4 flex items-center justify-center bg-muted/20 rounded-lg">
                  <Image
                    src={vehicleImagePath}
                    alt={vehicle.name}
                    width={200}
                    height={120}
                    className="object-contain"
                  />
                </div>

                {/* Vehicle Details */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{vehicle.name}</h3>
                    <p className="text-sm text-muted-foreground">{vehicle.description}</p>
                  </div>

                  {/* Capacity */}
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="h-6">
                      {vehicle.capacity.passengers} Passengers
                    </Badge>
                    <Badge variant="secondary" className="h-6">
                      {vehicle.capacity.luggage} Luggage
                    </Badge>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Hourly Rate:</span>
                      <span className="font-semibold">£{vehicle.price.amount}/hour</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total ({hours}h):</span>
                      <span className="font-bold text-lg">£{totalPrice}</span>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedVehicleId === vehicle.id && (
                    <div className="flex items-center text-primary font-medium">
                      <Check className="h-4 w-4 mr-2" />
                      Selected
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // Render vertical layout with larger images and enlarged text
  const renderVerticalLayout = () => (
    <div className="animate-in fade-in slide-in-from-left-5 duration-500 space-y-2 h-full">
      {sortedVehicles.map((vehicle) => {
        const capacity = checkVehicleCapacity(vehicle);
        const vehicleImagePath = getVehicleImagePath(vehicle.id);
        // Calculate total price based on booking type
        const totalPrice = bookingType === 'hourly' 
          ? vehicle.price.amount * hours 
          : vehicle.price.amount; // For one-way and return, use base price

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
                <h3 className="font-bold text-[17px] sm:text-2xl md:text-xl mb-1 sm:mb-2">
                  {vehicle.name}
                </h3>

                <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-muted-foreground">
                  <span className="flex items-center">
                    <Badge
                      variant="secondary"
                      className="h-5 sm:h-6 mr-1 text-xs sm:text-sm"
                    >
                      {vehicle.capacity.passengers}
                    </Badge>
                    Passengers
                  </span>
                  <span className="flex items-center">
                    <Badge
                      variant="secondary"
                      className="h-5 sm:h-6 mr-1 text-xs sm:text-sm"
                    >
                      {vehicle.capacity.luggage}
                    </Badge>
                    Luggage
                  </span>
                </div>
              </div>

              {/* Right: Price - responsive text sizes */}
              <div className="text-right ml-2">
                <div className="font-bold text-xl sm:text-2xl md:text-2xl tracking-tight font-mono">
                  {bookingType === 'hourly' ? (
                    `£${vehicle.price.amount}/hour`
                  ) : (
                    `£${vehicle.price.amount}`
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {bookingType === 'hourly' ? (
                    `Total: £${totalPrice}`
                  ) : (
                    `Base Price`
                  )}
                </div>

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
    !fareData.fare?.vehicleOptions ||
    fareData.fare.vehicleOptions.length === 0
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
