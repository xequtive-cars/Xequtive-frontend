/*
 * FINAL IMPLEMENTATION - DO NOT MODIFY
 *
 * This LocationInput component is in its final form and has been thoroughly tested.
 * It provides the following functionality:
 * - Advanced UK location search with Mapbox Places API integration
 * - Support for house numbers, full addresses, postcodes, airports, stations, POIs
 * - Auto-suggestions dropdown with proper styling
 * - Clear button (X) to reset input
 * - Loading indicator during API requests
 * - Proper handling of selection events
 * - Proximity-based results using user's location
 *
 * Any modifications to this component should be carefully reviewed as they
 * may break existing functionality.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, X } from "lucide-react";

// Create a cache to track locations that have been selected
// This will persist between component unmounts and remounts
const selectedLocationsCache = new Map<string, boolean>();

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
  text: string;
  context?: Array<{
    id: string;
    text: string;
    wikidata?: string;
    short_code?: string;
  }>;
}

interface LocationSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
  text: string;
  context?: Array<{
    id: string;
    text: string;
    wikidata?: string;
    short_code?: string;
  }>;
}

interface LocationInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: {
    address: string;
    longitude: number;
    latitude: number;
  }) => void;
  className?: string;
  userLocation?: { latitude: number; longitude: number } | null;
}

export function LocationInput({
  placeholder = "Search locations...",
  value,
  onChange,
  onLocationSelect,
  className,
  userLocation,
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectionMadeRef = useRef<boolean>(false);
  const valueRef = useRef<string>(value);

  // Update valueRef when value changes
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Check if this value has been selected before
  useEffect(() => {
    if (value && selectedLocationsCache.has(value)) {
      // Value is in the cache, so it was selected previously
      // Don't show suggestions for it
      selectionMadeRef.current = true;
    }
  }, [value]);

  // Fetch location suggestions from Mapbox
  useEffect(() => {
    // Skip API call if a selection was just made or if this value was previously selected
    if (
      selectionMadeRef.current ||
      (value && selectedLocationsCache.has(value))
    ) {
      return;
    }

    const fetchSuggestions = async () => {
      if (value.trim().length < 2) {
        setSuggestions([]);
        setHoveredIndex(null);
        return;
      }

      setIsLoading(true);
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        let endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          value
        )}.json?access_token=${token}&country=gb&autocomplete=true&limit=5&types=address,postcode,poi,place`;

        // Add proximity if user location is available
        if (userLocation) {
          endpoint += `&proximity=${userLocation.longitude},${userLocation.latitude}`;
        }

        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.features) {
          setSuggestions(
            data.features.map((feature: MapboxFeature) => ({
              id: feature.id,
              place_name: feature.place_name,
              center: feature.center,
              place_type: feature.place_type,
              text: feature.text,
              context: feature.context,
            }))
          );
          // Only show suggestions if the input is focused and wasn't previously selected
          if (!selectedLocationsCache.has(value)) {
            setShowSuggestions(true);
          }
        }
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce requests
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value, userLocation]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setHoveredIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectLocation = (suggestion: LocationSuggestion) => {
    // Set selection flag to prevent reopening
    selectionMadeRef.current = true;

    // Add to the global cache of selected locations
    selectedLocationsCache.set(suggestion.place_name, true);

    onLocationSelect({
      address: suggestion.place_name,
      longitude: suggestion.center[0],
      latitude: suggestion.center[1],
    });
    onChange(suggestion.place_name);
    setShowSuggestions(false);
    setHoveredIndex(null);
    setSuggestions([]);

    // Reset selection flag after a short delay
    setTimeout(() => {
      selectionMadeRef.current = false;
    }, 500);
  };

  // Clear input handler
  const handleClear = () => {
    selectionMadeRef.current = true;
    onChange("");
    setSuggestions([]);
    setShowSuggestions(false);

    // Also remove from cache if it existed there
    if (valueRef.current) {
      selectedLocationsCache.delete(valueRef.current);
    }

    // Reset selection flag after a short delay
    setTimeout(() => {
      selectionMadeRef.current = false;
    }, 500);
  };

  const getLocationIcon = (suggestion: LocationSuggestion) => {
    return (
      <MapPin
        className={`h-4 w-4 mr-2 shrink-0 mt-0.5 ${
          hoveredIndex === suggestions.indexOf(suggestion)
            ? "text-primary-foreground"
            : "text-foreground"
        }`}
      />
    );
  };

  const formatSuggestionText = (suggestion: LocationSuggestion) => {
    return suggestion.place_name;
  };

  return (
    <div ref={containerRef} className={`relative ${className || ""}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          onChange(newValue);
          if (!newValue) {
            handleClear();
          } else if (selectionMadeRef.current) {
            selectionMadeRef.current = false;
          }
        }}
        onFocus={() => {
          // Only show suggestions if:
          // 1. Not recently selected
          // 2. Has at least 2 characters
          // 3. Has suggestions available
          // 4. Not in the cache of previously selected locations
          if (
            !selectionMadeRef.current &&
            value.trim().length >= 2 &&
            suggestions.length > 0 &&
            !selectedLocationsCache.has(value)
          ) {
            setShowSuggestions(true);
          }
        }}
        className="focus-visible:ring-2 focus-visible:ring-offset-0 pr-8"
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Clear button - show when there's text and not loading */}
      {!isLoading && value.trim().length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full min-w-[300px] mt-1">
          <div className="rounded-lg border shadow-md bg-popover/95 backdrop-blur-sm supports-[backdrop-filter]:bg-popover/85 overflow-hidden max-w-[calc(100vw-2rem)]">
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-1 px-2">
                Suggestions
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.id}-${index}`}
                    onClick={() => handleSelectLocation(suggestion)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`flex items-start px-2 py-2 text-sm rounded cursor-pointer transition-colors ${
                      hoveredIndex === index
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent/50"
                    }`}
                  >
                    {getLocationIcon(suggestion)}
                    <span
                      className="font-medium break-words whitespace-normal"
                      title={suggestion.place_name}
                    >
                      {formatSuggestionText(suggestion)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
