import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import MapComponent, {
  Location as MapLocation,
} from "@/components/map/MapComponent";
import CustomDatePicker from "./CustomDatePicker";
import CustomTimePicker from "./CustomTimePicker";
import { FormData, Location } from "@/types/form";
import React, { useState, useCallback } from "react";

// Create a LocationSearch component to handle location selection
interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
  initialAddress?: string;
}

function LocationSearch({
  onLocationSelect,
  initialAddress,
}: LocationSearchProps) {
  const [searchLocation, setSearchLocation] = useState<MapLocation | null>(
    initialAddress
      ? {
          latitude: 0,
          longitude: 0,
          address: initialAddress,
        }
      : null
  );

  const handleUserLocationChange = useCallback(
    (location: { latitude: number; longitude: number } | null) => {
      if (location) {
        setSearchLocation((prev) => ({
          latitude: location.latitude,
          longitude: location.longitude,
          address: prev?.address || "",
        }));

        const newLocation: Location = {
          address: searchLocation?.address || "",
          coordinates: {
            lat: location.latitude,
            lng: location.longitude,
          },
        };
        onLocationSelect(newLocation);
      }
    },
    [onLocationSelect, searchLocation]
  );

  return (
    <div className="h-full">
      <MapComponent
        pickupLocation={searchLocation}
        showCurrentLocation={true}
        onUserLocationChange={handleUserLocationChange}
        className="h-full"
      />
      {/* We're not using the placeholder directly since MapComponent doesn't have a placeholder prop */}
    </div>
  );
}

interface TripDetailsFormProps {
  pickupLocation: Location | null;
  setPickupLocation: (location: Location) => void;
  dropoffLocation: Location | null;
  setDropoffLocation: (location: Location) => void;
}

export default function TripDetailsForm({
  pickupLocation,
  setPickupLocation,
  dropoffLocation,
  setDropoffLocation,
}: TripDetailsFormProps) {
  const form = useFormContext<FormData>();
  const pickupDate = form.watch("pickupDate");

  return (
    <div className="bg-muted/30 p-4 rounded-lg space-y-4">
      <h3 className="text-base font-medium">Trip Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="pickupDate"
          render={() => (
            <CustomDatePicker
              name="pickupDate"
              label="Pickup Date"
              placeholder="Select date"
            />
          )}
        />

        <FormField
          control={form.control}
          name="pickupTime"
          render={() => (
            <CustomTimePicker
              name="pickupTime"
              label="Pickup Time"
              placeholder="Select time"
              selectedDate={pickupDate ? new Date(pickupDate) : undefined}
            />
          )}
        />
      </div>

      <div className="space-y-4">
        {/* Pickup and Dropoff Locations in a 50/50 layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pickup Location */}
          <div className="bg-card border rounded-md p-2">
            <div className="flex items-center mb-2">
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Pickup Location</p>
              </div>
              <div>
                {pickupLocation && (
                  <p className="text-xs text-muted-foreground">
                    {pickupLocation.address.substring(0, 50)}
                    {pickupLocation.address.length > 50 ? "..." : ""}
                  </p>
                )}
              </div>
            </div>
            <div className="h-[300px] border rounded-md overflow-hidden mb-2">
              <LocationSearch
                onLocationSelect={setPickupLocation}
                initialAddress={pickupLocation?.address}
              />
            </div>
          </div>

          {/* Dropoff Location */}
          <div className="bg-card border rounded-md p-2">
            <div className="flex items-center mb-2">
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Dropoff Location</p>
              </div>
              <div>
                {dropoffLocation && (
                  <p className="text-xs text-muted-foreground">
                    {dropoffLocation.address.substring(0, 50)}
                    {dropoffLocation.address.length > 50 ? "..." : ""}
                  </p>
                )}
              </div>
            </div>
            <div className="h-[300px] border rounded-md overflow-hidden mb-2">
              <LocationSearch
                onLocationSelect={setDropoffLocation}
                initialAddress={dropoffLocation?.address}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
