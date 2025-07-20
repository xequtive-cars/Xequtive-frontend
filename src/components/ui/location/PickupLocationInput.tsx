import UKLocationInput from "@/components/ui/uk-location-input";
import { LocationSearchResponse } from "@/lib/location-search-service";

interface PickupLocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: {
    address: string;
    longitude: number;
    latitude: number;
  }) => void;
  userLocation: { latitude: number; longitude: number } | null;
  disabled?: boolean;
  className?: string;
}

/**
 * A specialized input component for pickup locations
 * This will eventually be extended with airport-specific suggestions
 * and other pickup-specific functionality
 */
export function PickupLocationInput({
  value,
  onChange,
  onLocationSelect,
  userLocation,
  disabled,
  className,
}: PickupLocationInputProps) {
  // Create a wrapper to convert UkLocationInput's location format to our component's format
  const handleLocationSelect = (location: any) => {
    onLocationSelect({
      address: location.address,
      longitude: location.coordinates.lng,
      latitude: location.coordinates.lat,
    });
  };

  return (
          <UKLocationInput
      placeholder="Enter pickup location"
      value={value}
      onChange={onChange}
              onSelect={handleLocationSelect}
      locationType="pickup"
      initialSuggestionsTitle="Suggested pickup locations"
      userLocation={userLocation}
      className={`bg-muted/40 text-sm h-10 [&>input]:h-10 [&>input]:text-sm rounded-md [&>input]:rounded-md [&>input]:px-3 [&>input]:bg-muted/40 [&_ul]:z-[100] [&_ul]:bg-background [&_ul]:backdrop-filter-none [&_ul]:shadow-lg ${
        className || ""
      }`}
      disabled={disabled}
    />
  );
}
