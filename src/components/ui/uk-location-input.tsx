"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import {
  LocationSearchResult,
  locationSearchService,
} from "@/lib/location-search-service";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

// Add terminal to the metadata type to avoid type errors
type LocationWithTerminal = LocationSearchResult & {
  metadata?: {
    terminal?: string;
    airportCode?: string;
    terminalOptions?: string[];
    postcode?: string;
    city?: string;
    region?: string;
    terminalCoordinates?: {
      [key: string]: { lat: number; lng: number };
    };
  };
};

interface UkLocationInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onSelect" | "onChange"
  > {
  onSelect?: (location: LocationSearchResult) => void;
  onChange?: (value: string) => void;
  onLocationSelect?: (location: LocationSearchResult) => void;
  onMapClick?: (location: LocationSearchResult) => void;
  initialLocation?: LocationSearchResult | null;
  placeholder?: string;
  suggestionsTitle?: string;
  initialSuggestionsTitle?: string;
  locationType?: "pickup" | "dropoff" | "stop";
  userLocation?: { latitude: number; longitude: number } | null;
  className?: string;
  onClear?: () => void;
  showInitialSuggestions?: boolean;
}

export function UkLocationInput({
  onSelect,
  onLocationSelect,
  onChange,
  onMapClick,
  initialLocation,
  placeholder = "Search for a location",
  suggestionsTitle = "Search results",
  initialSuggestionsTitle = "Suggested locations",
  locationType,
  userLocation,
  className,
  onClear,
  showInitialSuggestions = false,
  ...props
}: UkLocationInputProps) {
  const [value, setValue] = useState(
    initialLocation ? initialLocation.address : ""
  );
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSearchResult | null>(initialLocation || null);
  const [selectedAirport, setSelectedAirport] =
    useState<LocationSearchResult | null>(
      initialLocation?.type === "airport" ? initialLocation : null
    );
  const [terminalOptions, setTerminalOptions] = useState<string[]>([]);
  const [showTerminals, setShowTerminals] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Initialize portal container when component mounts
  useEffect(() => {
    // Only run in browser
    if (typeof document !== "undefined") {
      setPortalContainer(document.body);
    }
  }, []);

  // Update dropdown position when it's opened or input changes position
  useEffect(() => {
    if ((isSuggestionsOpen || showTerminals) && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();

      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isSuggestionsOpen, showTerminals]);

  // Handle input change
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setValue(query);
    setSelectedLocation(null);
    setSelectedAirport(null);
    setShowTerminals(false);

    // Call onChange prop if provided
    if (onChange) {
      onChange(query);
    }

    if (query.length > 0) {
      setIsSearching(true);
      const results = await locationSearchService.searchLocations(
        query,
        locationType,
        userLocation
      );
      setSuggestions(results);
      setIsSearching(false);
    } else {
      // Show suggested locations when input is empty
      const suggestedLocations =
        await locationSearchService.getSuggestedLocations(
          locationType,
          userLocation
        );
      setSuggestions(suggestedLocations);
    }

    setIsSuggestionsOpen(true);
  };

  // Handle selection of a location from suggestions
  const handleSelectLocation = (location: LocationSearchResult) => {
    // Format the display address
    const displayAddress =
      locationSearchService.formatLocationForDisplay(location);
    setValue(displayAddress);

    // Call onChange with the new value
    if (onChange) {
      onChange(displayAddress);
    }

    // If it's an airport, show terminal options
    if (
      location.type === "airport" &&
      location.metadata?.terminalOptions?.length
    ) {
      setSelectedAirport(location);
      setTerminalOptions(location.metadata.terminalOptions);
      setShowTerminals(true);
    } else {
      // Otherwise, just select the location
      setSelectedLocation(location);
      setShowTerminals(false);
      setIsSuggestionsOpen(false);

      if (onSelect) onSelect(location);
      // Support both onSelect and onLocationSelect for backward compatibility
      if (onLocationSelect) onLocationSelect(location);
      if (location.type === "airport" && onMapClick) onMapClick(location);
    }
  };

  // Handle terminal selection
  const handleTerminalSelection = (terminal: string) => {
    if (!selectedAirport) return;

    // Create the full address with terminal
    const fullAddress = `${selectedAirport.address}, ${terminal}`;
    setValue(fullAddress);

    // Get terminal-specific coordinates if available
    const terminalCoords =
      selectedAirport.metadata?.terminalCoordinates?.[terminal];

    // Create a modified location with terminal info and coordinates
    const locationWithTerminal: LocationWithTerminal = {
      ...selectedAirport,
      address: fullAddress,
      coordinates: terminalCoords || selectedAirport.coordinates,
      metadata: {
        ...selectedAirport.metadata,
        terminal: terminal,
      },
    };

    // Set the selected location with terminal
    setSelectedLocation(locationWithTerminal);
    setShowTerminals(false);
    setIsSuggestionsOpen(false);

    // Notify parent components
    if (onSelect) onSelect(locationWithTerminal);
    if (onMapClick) onMapClick(locationWithTerminal);
  };

  // Handle the clear button click
  const handleClear = async () => {
    setValue("");
    setSelectedLocation(null);
    setSelectedAirport(null);
    setShowTerminals(false);
    inputRef.current?.focus();

    // Get suggested locations again
    try {
      const suggestedLocations =
        await locationSearchService.getSuggestedLocations(
          locationType,
          userLocation
        );
      setSuggestions(suggestedLocations);
      setIsSuggestionsOpen(true);
    } catch {
      // Silently handle error
    }

    // Call the onClear callback if provided
    if (onClear) {
      onClear();
    }
  };

  // Handle focus on input
  const handleFocus = async () => {
    // Always show dropdown when input is focused
    setIsSuggestionsOpen(true);

    if (!selectedLocation) {
      try {
        setIsSearching(true);
        const suggestedLocations =
          await locationSearchService.getSuggestedLocations(
            locationType,
            userLocation
          );
        setSuggestions(suggestedLocations);
      } catch {
        // Silently handle error
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Add scroll handler
  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const bottom =
      Math.floor(e.currentTarget.scrollHeight - e.currentTarget.scrollTop) ===
      e.currentTarget.clientHeight;

    if (bottom && !isLoadingMore) {
      setIsLoadingMore(true);
      // Simulate loading more items
      setTimeout(() => {
        setIsLoadingMore(false);
      }, 1000);
    }
  };

  // Modify the initial suggestions loading logic
  useEffect(() => {
    const loadInitialSuggestions = async () => {
      try {
        if (showInitialSuggestions || !value) {
          const suggestedLocations =
            await locationSearchService.getSuggestedLocations(
              locationType,
              userLocation
            );
          setSuggestions(suggestedLocations);
          // Do not automatically open suggestions
          // setIsSuggestionsOpen(true);
        }
      } catch {
        // Silently handle error
      }
    };

    loadInitialSuggestions();
  }, [showInitialSuggestions, locationType, userLocation, value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        inputRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsSuggestionsOpen(false);
        setShowTerminals(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Render dropdown in portal
  const renderDropdown = () => {
    if (!portalContainer || (!isSuggestionsOpen && !showTerminals)) return null;

    return createPortal(
      <div
        ref={suggestionsRef}
        className={cn(
          "fixed bg-background border border-border rounded-md shadow-lg max-h-[480px] overflow-y-auto", // Increased by 20% from 400px
          locationType === "stop" && "location-dropdown-stop"
        )}
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          zIndex: 9999,
        }}
      >
        {showTerminals ? (
          <>
            <div className="p-2 sticky top-0 bg-background border-b border-border">
              <h3 className="text-sm font-medium">Select Terminal</h3>
            </div>
            <ul className="py-1" onScroll={handleScroll}>
              {terminalOptions.map((terminal, index) => (
                <li
                  key={`${terminal}-${index}`}
                  className="px-3 py-2 hover:bg-accent flex items-center cursor-pointer"
                  onClick={() => handleTerminalSelection(terminal)}
                >
                  <span className="text-sm">{terminal}</span>
                </li>
              ))}
              {isLoadingMore && (
                <li className="px-3 py-2 text-center text-sm text-muted-foreground">
                  Loading more...
                </li>
              )}
            </ul>
          </>
        ) : (
          <>
            <div className="p-2 sticky top-0 bg-background border-b border-border">
              <h3 className="text-sm font-medium">
                {value ? suggestionsTitle : initialSuggestionsTitle}
              </h3>
            </div>
            {isSearching && suggestions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No locations found
              </div>
            ) : (
              <ul className="py-1" onScroll={handleScroll}>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={`${suggestion.address}-${index}`}
                    className="px-3 py-2 hover:bg-accent flex items-center justify-between cursor-pointer"
                    onClick={() => handleSelectLocation(suggestion)}
                  >
                    <div className="flex items-center">
                      <div>
                        <span className="text-sm">{suggestion.address}</span>
                        {suggestion.type === "airport" &&
                          suggestion.metadata?.airportCode && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({suggestion.metadata.airportCode})
                            </span>
                          )}
                        {suggestion.metadata?.city &&
                          suggestion.type !== "airport" && (
                            <div className="text-xs text-muted-foreground">
                              {suggestion.metadata.city}
                            </div>
                          )}
                      </div>
                    </div>
                  </li>
                ))}
                {isLoadingMore && (
                  <li className="px-3 py-2 text-center text-sm text-muted-foreground">
                    Loading more...
                  </li>
                )}
              </ul>
            )}
          </>
        )}
      </div>,
      portalContainer
    );
  };

  return (
    <div
      className={cn(
        "relative w-full",
        locationType === "stop" && "stop-location-input",
        className
      )}
    >
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={cn("pr-10", "[&:not(:placeholder-shown)]:pr-10")}
          {...props}
        />
        {/* Only show the clear button if this is not a stop location input */}
        {value && locationType !== "stop" ? (
          <div
            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
            onClick={handleClear}
          >
            <X className="h-4 w-4 text-foreground hover:text-primary transition-colors" />
          </div>
        ) : (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none opacity-0">
            <X className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {renderDropdown()}
    </div>
  );
}
