"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, X, Navigation, Plane, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Create a cache to track locations that have been selected
// This will persist between component unmounts and remounts
const selectedLocationsCache = new Map<string, boolean>();

// Major UK airports and their coordinates
const ukAirports = [
  {
    id: "airport-lhr",
    place_name: "London Heathrow Airport (LHR)",
    center: [-0.4542955, 51.4700223] as [number, number],
    type: "airport",
    icon: <Plane className="h-3.5 w-3.5" />,
    terminals: [
      {
        name: "Terminal 2",
        coordinates: [-0.4508, 51.4713] as [number, number],
      },
      {
        name: "Terminal 3",
        coordinates: [-0.4527, 51.4732] as [number, number],
      },
      {
        name: "Terminal 4",
        coordinates: [-0.4483, 51.4585] as [number, number],
      },
      {
        name: "Terminal 5",
        coordinates: [-0.4889, 51.4722] as [number, number],
      },
    ],
  },
  {
    id: "airport-lgw",
    place_name: "London Gatwick Airport (LGW)",
    center: [-0.1821, 51.1537] as [number, number],
    type: "airport",
    icon: <Plane className="h-3.5 w-3.5" />,
    terminals: [
      {
        name: "North Terminal",
        coordinates: [-0.1644, 51.1561] as [number, number],
      },
      {
        name: "South Terminal",
        coordinates: [-0.1644, 51.1542] as [number, number],
      },
    ],
  },
  {
    id: "airport-stn",
    place_name: "London Stansted Airport (STN)",
    center: [0.2351, 51.886] as [number, number],
    type: "airport",
    icon: <Plane className="h-3.5 w-3.5" />,
  },
  {
    id: "airport-ltn",
    place_name: "London Luton Airport (LTN)",
    center: [-0.3677, 51.8763] as [number, number],
    type: "airport",
    icon: <Plane className="h-3.5 w-3.5" />,
  },
  {
    id: "airport-lcy",
    place_name: "London City Airport (LCY)",
    center: [0.055, 51.5048] as [number, number],
    type: "airport",
    icon: <Plane className="h-3.5 w-3.5" />,
  },
  {
    id: "airport-man",
    place_name: "Manchester Airport (MAN)",
    center: [-2.271, 53.3537] as [number, number],
    type: "airport",
    icon: <Plane className="h-3.5 w-3.5" />,
    terminals: [
      {
        name: "Terminal 1",
        coordinates: [-2.271, 53.3537] as [number, number],
      },
      {
        name: "Terminal 2",
        coordinates: [-2.2814, 53.3559] as [number, number],
      },
      {
        name: "Terminal 3",
        coordinates: [-2.2731, 53.3505] as [number, number],
      },
    ],
  },
  {
    id: "airport-bhx",
    place_name: "Birmingham Airport (BHX)",
    center: [-1.75, 52.45] as [number, number],
    type: "airport",
    icon: <Plane className="h-3.5 w-3.5" />,
  },
  {
    id: "airport-gla",
    place_name: "Glasgow Airport (GLA)",
    center: [-4.4351, 55.8642] as [number, number],
    type: "airport",
    icon: <Plane className="h-3.5 w-3.5" />,
  },
  {
    id: "airport-edi",
    place_name: "Edinburgh Airport (EDI)",
    center: [-3.3616, 55.95] as [number, number],
    type: "airport",
    icon: <Plane className="h-3.5 w-3.5" />,
  },
  {
    id: "airport-brs",
    place_name: "Bristol Airport (BRS)",
    center: [-2.7196, 51.3827] as [number, number],
    type: "airport",
    icon: <Plane className="h-3.5 w-3.5" />,
  },
];

// Popular UK locations
const popularUkLocations = [
  {
    id: "pop-london",
    place_name: "Central London",
    center: [-0.1276, 51.5074] as [number, number],
    type: "popular",
    icon: <Star className="h-3.5 w-3.5" />,
  },
  {
    id: "pop-manchester",
    place_name: "Manchester City Centre",
    center: [-2.2426, 53.4808] as [number, number],
    type: "popular",
    icon: <Star className="h-3.5 w-3.5" />,
  },
  {
    id: "pop-birmingham",
    place_name: "Birmingham City Centre",
    center: [-1.9006, 52.4814] as [number, number],
    type: "popular",
    icon: <Star className="h-3.5 w-3.5" />,
  },
  {
    id: "pop-liverpool",
    place_name: "Liverpool City Centre",
    center: [-2.9916, 53.4075] as [number, number],
    type: "popular",
    icon: <Star className="h-3.5 w-3.5" />,
  },
  {
    id: "pop-edinburgh",
    place_name: "Edinburgh City Centre",
    center: [-3.1883, 55.9533] as [number, number],
    type: "popular",
    icon: <Star className="h-3.5 w-3.5" />,
  },
];

// Type for location suggestions
interface LocationSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
  type?: string;
  icon?: React.ReactNode;
  distance?: number;
  terminals?: Array<{ name: string; coordinates: [number, number] }>;
}

interface UkLocationInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: {
    address: string;
    longitude: number;
    latitude: number;
  }) => void;
  className?: string;
  showInitialSuggestions?: boolean;
  type?: "pickup" | "dropoff" | "stop";
  initialSuggestionsTitle?: string;
  userLocation?: { latitude: number; longitude: number } | null;
}

export function UkLocationInput({
  placeholder = "Search UK locations...",
  value,
  onChange,
  onLocationSelect,
  className,
  showInitialSuggestions = false,
  type = "pickup",
  initialSuggestionsTitle = "Suggested locations",
  userLocation = null,
}: UkLocationInputProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [initialSuggestions, setInitialSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showInitial, setShowInitial] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectionMadeRef = useRef<boolean>(false);
  const valueRef = useRef<string>(value);
  const currentUserLocation = useRef<{
    latitude: number;
    longitude: number;
  } | null>(userLocation);

  // Set initial states to closed and check if we already have a pre-selected value
  useEffect(() => {
    setShowSuggestions(false);
    setShowInitial(false);

    // If we have an initial value (from URL params, etc.), mark it as selected
    if (value && value.trim() !== "") {
      selectionMadeRef.current = true;
      selectedLocationsCache.set(value, true);

      // Reset selection flag after a delay to allow normal interaction
      setTimeout(() => {
        selectionMadeRef.current = false;
      }, 500);
    }
  }, []);

  // Update valueRef when value changes
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Update current user location when provided
  useEffect(() => {
    currentUserLocation.current = userLocation;
  }, [userLocation]);

  // Calculate distance between two coordinates using the Haversine formula
  const deg2rad = useCallback((deg: number): number => {
    return deg * (Math.PI / 180);
  }, []);

  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Radius of the earth in km
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
          Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c; // Distance in km
      return d;
    },
    [deg2rad]
  );

  // Prepare initial suggestions to show before the user types anything
  const prepareInitialSuggestions = useCallback(async () => {
    const suggestions: LocationSuggestion[] = [];

    // Add current location suggestion if available
    if (currentUserLocation.current) {
      setIsFetching(true);

      try {
        // Reverse geocode the current location to get the address
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
        const { latitude, longitude } = currentUserLocation.current;
        const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&country=gb&types=address,place,neighborhood,locality,postcode`;

        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          suggestions.push({
            id: "current-location",
            place_name: `Current Location: ${feature.place_name}`,
            center: [longitude, latitude] as [number, number],
            type: "current",
            icon: <Navigation className="h-3.5 w-3.5" />,
          });
        } else {
          suggestions.push({
            id: "current-location",
            place_name: "Current Location",
            center: [longitude, latitude] as [number, number],
            type: "current",
            icon: <Navigation className="h-3.5 w-3.5" />,
          });
        }
      } catch (error) {
        console.error("Error reverse geocoding current location:", error);
        // Fallback to basic current location suggestion
        suggestions.push({
          id: "current-location",
          place_name: "Current Location",
          center: [
            currentUserLocation.current.longitude,
            currentUserLocation.current.latitude,
          ] as [number, number],
          type: "current",
          icon: <Navigation className="h-3.5 w-3.5" />,
        });
      } finally {
        setIsFetching(false);
      }
    }

    // Add UK airports with distance if user location is available
    const airportsWithDistance = [...ukAirports].map((airport) => {
      let distance = 0;
      if (currentUserLocation.current) {
        distance = calculateDistance(
          currentUserLocation.current.latitude,
          currentUserLocation.current.longitude,
          airport.center[1],
          airport.center[0]
        );
      }
      return { ...airport, distance };
    });

    // Sort airports by distance if user location available
    if (currentUserLocation.current) {
      airportsWithDistance.sort(
        (a, b) => (a.distance || 0) - (b.distance || 0)
      );
    }

    // Get top 5 nearest airports and ensure proper typing
    const nearestAirports: LocationSuggestion[] = airportsWithDistance
      .slice(0, 5)
      .map((airport) => ({
        ...airport,
        center: airport.center as [number, number],
      }));

    // Add popular locations with distance if user location is available
    const locationsWithDistance = [...popularUkLocations].map((location) => {
      let distance = 0;
      if (currentUserLocation.current) {
        distance = calculateDistance(
          currentUserLocation.current.latitude,
          currentUserLocation.current.longitude,
          location.center[1],
          location.center[0]
        );
      }
      return { ...location, distance };
    });

    // Sort popular locations by distance if user location available
    if (currentUserLocation.current) {
      locationsWithDistance.sort(
        (a, b) => (a.distance || 0) - (b.distance || 0)
      );
    }

    // Get top 4 nearest popular locations and ensure proper typing
    const nearestLocations: LocationSuggestion[] = locationsWithDistance
      .slice(0, 4)
      .map((location) => ({
        ...location,
        center: location.center as [number, number],
      }));

    // Set initial suggestions - combine all suggestions
    setInitialSuggestions([
      ...suggestions,
      ...nearestAirports,
      ...nearestLocations,
    ]);
  }, [calculateDistance]);

  // Prepare initial suggestions when the component loads or user location changes
  useEffect(() => {
    if (showInitialSuggestions) {
      prepareInitialSuggestions();
      // Don't automatically set showInitial to true if we already have a value
    }
  }, [showInitialSuggestions, userLocation, prepareInitialSuggestions]);

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

        // Don't automatically show initial suggestions when field is empty
        setShowInitial(false);
        return;
      }

      setIsLoading(true);
      setShowInitial(false);

      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

        // Build a UK-specific query with proper options
        // country=gb ensures UK only results
        // types includes detailed location types
        // proximity parameter for prioritizing nearby results if user location is available
        let endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          value
        )}.json?access_token=${token}&country=gb&types=address,place,neighborhood,locality,postcode,poi,region&limit=8`;

        // Add proximity parameter if user location is available
        if (currentUserLocation.current) {
          endpoint += `&proximity=${currentUserLocation.current.longitude},${currentUserLocation.current.latitude}`;
        }

        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.features) {
          // Map the results to our format
          const mapboxResults = data.features.map(
            (feature: {
              id: string;
              place_name: string;
              center: [number, number];
              place_type: string[];
            }) => {
              // Determine if this is an airport, might need enhancement with a better database
              const isAirport =
                feature.place_name.toLowerCase().includes("airport") ||
                feature.place_name.toLowerCase().includes("heathrow") ||
                feature.place_name.toLowerCase().includes("gatwick") ||
                feature.place_name.toLowerCase().includes("stansted") ||
                feature.place_name.toLowerCase().includes("luton");

              // Calculate distance if user location is available
              let distance = 0;
              if (currentUserLocation.current) {
                distance = calculateDistance(
                  currentUserLocation.current.latitude,
                  currentUserLocation.current.longitude,
                  feature.center[1],
                  feature.center[0]
                );
              }

              return {
                id: feature.id,
                place_name: feature.place_name,
                center: feature.center,
                type: isAirport ? "airport" : feature.place_type[0],
                icon: isAirport ? (
                  <Plane className="h-3.5 w-3.5" />
                ) : (
                  <MapPin className="h-3.5 w-3.5" />
                ),
                distance,
              };
            }
          );

          // If we have user location, ensure results are sorted by proximity
          if (currentUserLocation.current) {
            mapboxResults.sort(
              (a: LocationSuggestion, b: LocationSuggestion) =>
                (a.distance || 0) - (b.distance || 0)
            );
          }

          setSuggestions(mapboxResults);

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
  }, [value, showInitialSuggestions, userLocation, calculateDistance]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setShowInitial(false);
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

    // Check if this is an airport with terminal selection
    const airport = ukAirports.find((a) => a.id === suggestion.id);
    const isAirportWithTerminals =
      airport && airport.terminals && airport.terminals.length > 0;

    if (isAirportWithTerminals && type === "pickup") {
      // If it's an airport with terminals and it's a pickup, show terminal options
      const terminalSuggestions = airport.terminals!.map((terminal, idx) => ({
        id: `${airport.id}-terminal-${idx}`,
        place_name: `${airport.place_name} - ${terminal.name}`,
        center: terminal.coordinates as [number, number],
        type: "terminal",
        icon: <Plane className="h-3.5 w-3.5" />,
      }));

      setSuggestions(terminalSuggestions);
      // Don't hide the suggestions yet
      setShowSuggestions(true);
      setShowInitial(false);

      // But still update the input with the airport name
      onChange(suggestion.place_name);

      // Reset selection after a short delay to allow terminal selection
      setTimeout(() => {
        selectionMadeRef.current = false;
      }, 100);

      return;
    }

    onLocationSelect({
      address: suggestion.place_name,
      longitude: suggestion.center[0],
      latitude: suggestion.center[1],
    });
    onChange(suggestion.place_name);
    setShowSuggestions(false);
    setShowInitial(false);
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
    setShowInitial(false);

    // Also clear the selected location on the map
    onLocationSelect({
      address: "",
      longitude: 0,
      latitude: 0,
    });

    // Also remove from cache if it existed there
    if (valueRef.current) {
      selectedLocationsCache.delete(valueRef.current);
    }

    // Reset selection flag after a short delay
    setTimeout(() => {
      selectionMadeRef.current = false;
    }, 500);
  };

  return (
    <div ref={containerRef} className={`relative ${className || ""}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          // Skip if a selection was just made
          if (!selectionMadeRef.current) {
            // If the user is typing something new, remove the cached status
            if (value && e.target.value !== value) {
              selectedLocationsCache.delete(value);
            }
            onChange(e.target.value);
          }
        }}
        onFocus={() => {
          // Intentionally leave both showInitial and showSuggestions false on focus
          // They will only be shown when the user clicks the input or types
        }}
        onClick={() => {
          // Show initial suggestions when the field is empty and clicked
          if (
            value.trim().length === 0 &&
            showInitialSuggestions &&
            initialSuggestions.length > 0
          ) {
            setShowInitial(true);
            return;
          }

          // Show typed suggestions when clicked if content exists
          if (
            !selectionMadeRef.current &&
            value.trim().length >= 2 &&
            suggestions.length > 0 &&
            !selectedLocationsCache.has(value)
          ) {
            setShowSuggestions(true);
          }
        }}
        className="focus-visible:ring-2 focus-visible:ring-offset-0"
      />

      {/* Loading indicator */}
      {(isLoading || isFetching) && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Clear button - show when there's text and not loading */}
      {!isLoading && value.trim().length > 0 && (
        <div
          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer bg-background rounded-full p-1 hover:bg-accent transition-colors"
          onClick={handleClear}
        >
          <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
        </div>
      )}

      {/* Initial suggestions dropdown */}
      {showInitial && initialSuggestions.length > 0 && (
        <div className="absolute z-10 w-full min-w-[300px] mt-1">
          <div className="rounded-lg border shadow-md bg-popover/95 backdrop-blur-sm supports-[backdrop-filter]:bg-popover/85 overflow-hidden max-w-[calc(100vw-2rem)]">
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-1 px-2">
                {initialSuggestionsTitle}
              </div>
              <div className="space-y-0.5 max-h-[300px] overflow-y-auto pr-1">
                {initialSuggestions.map((suggestion, index) => (
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
                    <div
                      className={`mr-2 shrink-0 mt-0.5 ${
                        hoveredIndex === index
                          ? "text-primary-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {suggestion.icon || <MapPin className="h-3.5 w-3.5" />}
                    </div>
                    <span
                      className="font-medium break-words whitespace-normal"
                      title={suggestion.place_name}
                    >
                      {suggestion.place_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Normal search suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full min-w-[300px] mt-1">
          <div className="rounded-lg border shadow-md bg-popover/95 backdrop-blur-sm supports-[backdrop-filter]:bg-popover/85 overflow-hidden max-w-[calc(100vw-2rem)]">
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-1 px-2">
                UK Locations
              </div>
              <div className="space-y-0.5 max-h-[300px] overflow-y-auto pr-1">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.id}-${index}`}
                    onClick={() => handleSelectLocation(suggestion)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={cn(
                      "flex items-start px-2 py-2 text-sm rounded cursor-pointer transition-colors",
                      hoveredIndex === index
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent/50"
                    )}
                  >
                    <div
                      className={cn(
                        "mr-2 shrink-0 mt-0.5",
                        hoveredIndex === index
                          ? "text-primary-foreground"
                          : "text-foreground"
                      )}
                    >
                      {suggestion.icon || <MapPin className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex flex-col">
                      <span
                        className="font-medium break-words whitespace-normal"
                        title={suggestion.place_name}
                      >
                        {suggestion.place_name}
                      </span>
                      {suggestion.distance && (
                        <span className="text-xs text-muted-foreground">
                          {suggestion.distance < 1
                            ? `${Math.round(suggestion.distance * 1000)}m away`
                            : `${suggestion.distance.toFixed(1)}km away`}
                        </span>
                      )}
                    </div>
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
