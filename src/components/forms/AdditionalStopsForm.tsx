import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import MapComponent, {
  Location as MapLocation,
} from "@/components/map/MapComponent";
import { Location } from "@/types/form";
import { v4 as uuidv4 } from "uuid";
import { useState, useCallback } from "react";

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
    </div>
  );
}

interface AdditionalStopsFormProps {
  additionalStops: Location[];
  setAdditionalStops: React.Dispatch<React.SetStateAction<Location[]>>;
  handleAddStop: () => void;
  handleRemoveStop: (index: number) => void;
}

export default function AdditionalStopsForm({
  additionalStops,
  setAdditionalStops,
  handleAddStop,
  handleRemoveStop,
}: AdditionalStopsFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">Additional Stops</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddStop}
          className="h-8 text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Stop
        </Button>
      </div>

      {additionalStops.length > 0 ? (
        <div className="space-y-4">
          {additionalStops.map((stop, index) => (
            <div
              key={stop.id || index}
              className="bg-card border rounded-md p-2"
            >
              <div className="flex items-center mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Stop {index + 1}</p>
                </div>
                <div className="flex items-center gap-2">
                  {stop.address && (
                    <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {stop.address}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStop(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="h-[250px] border rounded-md overflow-hidden">
                <LocationSearch
                  onLocationSelect={(location) => {
                    const newStops = [...additionalStops];
                    newStops[index] = {
                      ...location,
                      id: stop.id || uuidv4(),
                    };
                    setAdditionalStops(newStops);
                  }}
                  initialAddress={stop.address}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-4 text-center bg-muted/50 rounded-md">
          No additional stops. Click &quot;Add Stop&quot; to add intermediate
          destinations.
        </p>
      )}
    </div>
  );
}
