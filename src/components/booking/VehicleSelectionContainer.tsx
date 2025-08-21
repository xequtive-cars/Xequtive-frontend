import React from "react";
import { VehicleOption, FareResponse } from "./common/types";
import { BookingSummary } from "./booking-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Location } from "@/components/map/MapComponent";
import Image from "next/image";

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

interface VehicleSelectionContainerProps {
  fareData: FareResponse;
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  additionalStops: Location[];
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
  selectedVehicle: VehicleOption | null;
}

const VehicleSelectionContainer: React.FC<VehicleSelectionContainerProps> = ({
  fareData,
  pickupLocation,
  dropoffLocation,
  additionalStops,
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
  selectedVehicle,
}) => {
  // Check if capacity is exceeded for any vehicle
  const checkCapacityExceeded = (vehicle: VehicleOption) => {
    const totalPassengers = passengers;
    const totalLuggage = checkedLuggage + mediumLuggage + handLuggage;

    return (
      vehicle.capacity.passengers < totalPassengers ||
      vehicle.capacity.luggage < totalLuggage
    );
  };

  // Render price breakdown if available
  const renderPriceBreakdown = (vehicle: VehicleOption) => {
    if (!vehicle.price.breakdown) return null;

    const breakdown = vehicle.price.breakdown;

    // Only show breakdown items with non-zero values
    const items = [
      { label: "Base Fare", value: breakdown.baseFare },
      { label: "Distance Charge", value: breakdown.distanceCharge },
      { label: "Additional Stop Fee", value: breakdown.additionalStopFee },
      { label: "Time Surcharge", value: breakdown.timeMultiplier },
      { label: "Special Location Fees", value: breakdown.specialLocationFees },
      { label: "Waiting Charge", value: breakdown.waitingCharge },
    ].filter((item) => item.value > 0);

    if (items.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t border-border/40">
        <h4 className="text-sm font-medium mb-2">Price Breakdown</h4>
        <div className="space-y-1 text-sm">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-muted-foreground">{item.label}:</span>
              <span>£{item.value.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between font-semibold pt-1 border-t border-border/40 mt-2">
            <span>Total:</span>
            <span>£{vehicle.price.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  if (
    !fareData ||
    !fareData.vehicleOptions ||
    fareData.vehicleOptions.length === 0
  ) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600">
          No vehicle options available for your route.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Please try a different route or contact customer support.
        </p>
      </div>
    );
  }

  // Sort vehicles by custom order instead of price
  const sortedVehicles = [...fareData.vehicleOptions].sort(
    (a, b) =>
      getVehicleTypeOrder(a.id, a.name) - getVehicleTypeOrder(b.id, b.name)
  );

  return (
    <div className="space-y-6">
      <BookingSummary
        pickupLocation={pickupLocation}
        dropoffLocation={dropoffLocation}
        additionalStops={additionalStops}
        date={selectedDate}
        time={selectedTime}
        passengers={passengers}
        checkedLuggage={checkedLuggage}
        mediumLuggage={mediumLuggage}
        handLuggage={handLuggage}
        babySeat={babySeat}
        childSeat={childSeat}
        boosterSeat={boosterSeat}
        wheelchair={wheelchair}
        className="mb-6"
      />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Select a Vehicle</h2>
        <Button variant="ghost" onClick={onBack} size="sm">
          Back to Form
        </Button>
      </div>

      <div className="space-y-4">
        {sortedVehicles.map((vehicle) => {
          const exceededCapacity = checkCapacityExceeded(vehicle);
          return (
            <Card
              key={vehicle.id}
              className={cn(
                "border transition-all duration-200",
                selectedVehicle?.id === vehicle.id
                  ? "border-primary shadow-md"
                  : "hover:border-muted-foreground/20 border-border/60",
                exceededCapacity && "opacity-80"
              )}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Vehicle Image - Increased size by making it more prominent within its container */}
                  <div className="w-full sm:w-32 h-32 bg-muted/30 rounded-md overflow-hidden relative">
                    {vehicle.imageUrl ? (
                      <Image
                        src={vehicle.imageUrl}
                        alt={vehicle.name}
                        className="h-full w-full object-cover scale-110"
                        width={128}
                        height={128}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Image
                          src={getVehicleImagePath(vehicle.id)}
                          alt={vehicle.name}
                          width={128}
                          height={128}
                          className="object-contain scale-150" /* Increased scale from 125% to 150% */
                        />
                      </div>
                    )}
                  </div>

                  {/* Vehicle Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{vehicle.name}</h3>
                      <div className="text-lg font-bold">
                        £{vehicle.price.amount.toFixed(2)}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {vehicle.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge
                        variant={
                          !exceededCapacity ||
                          vehicle.capacity.passengers >= passengers
                            ? "outline"
                            : "destructive"
                        }
                        className="text-xs py-0 h-5"
                      >
                        <Users className="h-3 w-3 mr-1" />{" "}
                        {vehicle.capacity.passengers} Passengers
                      </Badge>
                      <Badge
                        variant={
                          !exceededCapacity ||
                          vehicle.capacity.luggage >=
                            checkedLuggage + mediumLuggage + handLuggage
                            ? "outline"
                            : "destructive"
                        }
                        className="text-xs py-0 h-5"
                      >
                        <Briefcase className="h-3 w-3 mr-1" />{" "}
                        {vehicle.capacity.luggage} Luggage
                      </Badge>
                      {vehicle.features?.includes("WiFi") && (
                        <Badge variant="secondary" className="text-xs py-0 h-5">
                          <Wifi className="h-3 w-3 mr-1" /> WiFi
                        </Badge>
                      )}
                    </div>

                    {/* Show features list if available */}
                    {vehicle.features && vehicle.features.length > 0 && (
                      <div className="text-xs text-muted-foreground mb-3">
                        <span className="font-medium">Features:</span>{" "}
                        {vehicle.features.join(", ")}
                      </div>
                    )}

                    {/* Show price breakdown if this is the selected vehicle */}
                    {selectedVehicle?.id === vehicle.id &&
                      renderPriceBreakdown(vehicle)}

                    <div className="mt-2">
                      <Button
                        onClick={() => onSelectVehicle(vehicle)}
                        disabled={exceededCapacity}
                        className={
                          selectedVehicle?.id === vehicle.id
                            ? "bg-primary"
                            : "bg-primary/90 hover:bg-primary"
                        }
                        size="sm"
                      >
                        {selectedVehicle?.id === vehicle.id
                          ? "Selected"
                          : "Select"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default VehicleSelectionContainer;
