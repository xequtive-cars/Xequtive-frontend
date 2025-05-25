import { UkLocationInput } from "@/components/ui/uk-location-input";
import { LocationSearchResult } from "@/lib/location-search-service";

interface StopLocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: {
    address: string;
    longitude: number;
    latitude: number;
  }) => void;
  userLocation: { latitude: number; longitude: number } | null;
  stopNumber: number;
  disabled?: boolean;
  className?: string;
}

/**
 * A specialized input component for intermediate stop locations
 * This will eventually be extended with stop-specific suggestions
 * and other intermediate location functionality
 */
export function StopLocationInput({
  value,
  onChange,
  onLocationSelect,
  userLocation,
  stopNumber,
  disabled,
  className,
}: StopLocationInputProps) {
  // Create a wrapper to convert UkLocationInput's location format to our component's format
  const handleLocationSelect = (location: LocationSearchResult) => {
    onLocationSelect({
      address: location.address,
      longitude: location.coordinates.lng,
      latitude: location.coordinates.lat,
    });
  };

  return (
    <UkLocationInput
      placeholder={`Enter stop ${stopNumber}`}
      value={value}
      onChange={onChange}
      onLocationSelect={handleLocationSelect}
      locationType="stop"
      initialSuggestionsTitle="Suggested stop locations"
      userLocation={userLocation}
      className={`text-sm h-10 rounded-md pr-12 bg-muted/40 w-full [&>input]:h-10 [&>input]:text-sm [&>input]:rounded-md [&>input]:pr-12 [&>input]:bg-muted/40 [&_ul]:z-[9999] [&_ul]:bg-background [&_ul]:backdrop-filter-none [&_ul]:shadow-lg ${
        className || ""
      }`}
      disabled={disabled}
    />
  );
}
