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
 * - Minimum 3 character threshold and debouncing for cost optimization
 *
 * Any modifications to this component should be carefully reviewed as they
 * may break existing functionality.
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

interface Location {
  address: string;
  longitude: number;
  latitude: number;
}

interface LocationInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: Location) => void;
  className?: string;
  userLocation?: { latitude: number; longitude: number } | null;
}

// Enhanced debounce function with minimum character threshold
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  minChars: number = 3
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    const query = args[0] as string;
    
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Only proceed if query meets minimum character threshold
    if (query && query.trim().length >= minChars) {
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    } else if (query && query.trim().length < minChars) {
      // Clear suggestions if query is too short
      func('' as any);
    }
  };
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

  // Fetch location suggestions from Mapbox with debouncing and minimum character threshold
  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (!query.trim() || query.trim().length < 3) {
        setSuggestions([]);
        setHoveredIndex(null);
        return;
      }

      setIsLoading(true);
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) {
          console.error('Mapbox token not available');
          return;
        }

        // Build Mapbox Geocoding API URL with optimized parameters
        const params = new URLSearchParams({
          access_token: token,
          country: 'gb', // UK only
          autocomplete: 'true',
          limit: '5', // Limit results for cost optimization
          types: 'address,postcode,poi,place', // Optimized types
          language: 'en'
        });

        // Add proximity if user location is available
        if (userLocation) {
          params.append('proximity', `${userLocation.longitude},${userLocation.latitude}`);
        }

        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`;

        const response = await fetch(url);
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
          if (!selectedLocationsCache.has(query)) {
            setShowSuggestions(true);
          }
        }
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300, 3), // 300ms debounce, 3 character minimum
    [userLocation]
  );

  // Handle input change with debouncing
  useEffect(() => {
    // Skip API call if a selection was just made or if this value was previously selected
    if (
      selectionMadeRef.current ||
      (value && selectedLocationsCache.has(value))
    ) {
      return;
    }

    fetchSuggestions(value);
  }, [value, fetchSuggestions]);

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
          // 2. Has at least 3 characters (minimum threshold)
          // 3. Has suggestions available
          // 4. Not in the cache of previously selected locations
          if (
            !selectionMadeRef.current &&
            value.trim().length >= 3 &&
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

      {/* Minimum character message */}
      {value.trim().length > 0 && value.trim().length < 3 && (
        <div className="absolute z-10 w-full min-w-[300px] mt-1">
          <div className="rounded-lg border shadow-md bg-popover/95 backdrop-blur-sm supports-[backdrop-filter]:bg-popover/85 overflow-hidden max-w-[calc(100vw-2rem)]">
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-1 px-2">
                Please enter at least 3 characters to search
              </div>
            </div>
          </div>
        </div>
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
