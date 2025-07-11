"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Navigation, 
  Plane, 
  Train, 
  ChevronLeft, 
  Loader2,
  X,
  ArrowLeft
} from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/components/ui/use-toast";
import { locationSearchService, LocationSuggestion } from "@/lib/location-search-service";
import { v4 as uuidv4 } from 'uuid';
import { cn } from "@/lib/utils";

// Custom debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export interface Location {
  id?: string;
  address: string;
  mainText?: string;
  secondaryText?: string;
  name?: string;
  latitude: number;
  longitude: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  metadata?: {
    primaryType?: string;
    postcode?: string;
    city?: string;
    region?: string;
    type?: string;
    category?: string;
    placeId?: string;
    terminalId?: string;
    terminalName?: string;
    parentPlaceId?: string;
  };
  type?: string;
}

interface UKLocationInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (location: Location) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  locationType?: "pickup" | "dropoff" | "stop";
  showPopularLocations?: boolean;
  initialLocation?: Location | null;
}

// Add type-safe event handling for click outside
const useClickOutside = (
  ref: React.RefObject<HTMLDivElement>, 
  handler: () => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener as EventListener);
    document.addEventListener('touchstart', listener as EventListener);

    return () => {
      document.removeEventListener('mousedown', listener as EventListener);
      document.removeEventListener('touchstart', listener as EventListener);
    };
  }, [ref, handler]);
};

export default function UKLocationInput({
  value = "",
  onChange,
  onSelect,
  placeholder = "Enter location",
  disabled = false,
  className = "",
  locationType = "pickup",
  showPopularLocations = true,
  initialLocation = null,
}: UKLocationInputProps) {
  // State management
  const [input, setInput] = useState(initialLocation?.address || value || "");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | undefined>(undefined);
  const [popularLocations, setPopularLocations] = useState<LocationSuggestion[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  // State for dropdown view management
  const [dropdownView, setDropdownView] = useState<'default' | 'airports' | 'trains' | 'terminals'>('default');
  const [selectedCategory, setSelectedCategory] = useState<'airport' | 'train_station' | null>(null);
  const [categoryLocations, setCategoryLocations] = useState<LocationSuggestion[]>([]);
  const [terminalLocations, setTerminalLocations] = useState<LocationSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Input focus/blur handlers
  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Check if the blur is caused by clicking within the dropdown
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && suggestionsRef.current?.contains(relatedTarget)) {
      // Don't close dropdown if clicking within it
      return;
    }
    
    // Use setTimeout to allow for suggestion clicks, but with longer delay for categories
    setTimeout(() => {
      setShowSuggestions(false);
    }, 300);
  };

  // Handle input click - ensure dropdown opens
  const handleInputClick = () => {
    setShowSuggestions(true);
  };

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't close if clicking on input or dropdown
      if (
        inputRef.current &&
        !inputRef.current.contains(target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(target)
      ) {
        setShowSuggestions(false);
        setDropdownView('default');
        setSelectedCategory(null);
        setCategoryLocations([]);
      }
    };

    // Only add listener when dropdown is visible
    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  // Hooks
  const { getCurrentLocation } = useGeolocation();
  const { toast } = useToast();

  // Initialize session token
  useEffect(() => {
    setSessionToken(uuidv4());
  }, []);

  // Update input when value prop changes (for URL parameter restoration)
  useEffect(() => {
    if (value !== undefined && value !== input) {
      setInput(value);
    }
  }, [value, input]);

  // Create current location option
  const createCurrentLocationOption = (): LocationSuggestion => ({
    id: 'current-location',
    address: 'Use current location',
    mainText: 'Current Location',
    secondaryText: 'Use your current GPS location',
    name: 'Current Location',
      latitude: 0,
      longitude: 0,
      metadata: {
      primaryType: 'current_location',
      region: 'UK'
      }
    });

  // Handle current location selection
  const handleCurrentLocationSelect = async () => {
    try {
      setIsSearching(true);
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      
      const { latitude, longitude } = position.coords;
      
             // Create location object for current position
       const currentLocation: LocationSuggestion = {
         id: 'current-location',
         address: 'Current Location',
         mainText: 'Current Location',
         secondaryText: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
         latitude,
         longitude,
         coordinates: { lat: latitude, lng: longitude },
         metadata: {
           primaryType: 'current_location'
         }
       };

      // Location selection logging removed to prevent infinite loops
      
      // Call the selection handler
      handleSuggestionSelect(currentLocation);
      
    } catch (error) {
      // Only log critical geolocation errors
      if (error instanceof GeolocationPositionError && error.code === 1) {
        // Permission denied - this is expected behavior, don't log
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch popular locations from API
  const fetchPopularLocations = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await locationSearchService.fetchPopularLocations();
      
              if (response.success && response.data) {
          setPopularLocations(response.data);
        } else {
          // Failed to fetch popular locations - use fallback data
        setPopularLocations([]);
      }
          } catch (error) {
        // Error fetching popular locations - use fallback data
        setPopularLocations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch category-specific locations (airports or train stations)
  const fetchCategoryLocations = useCallback(async (category: 'airport' | 'train_station') => {
    try {
      setIsSearching(true);
      
      const response = await locationSearchService.fetchCategoryLocations(category);
      
              if (response.success && response.data) {
          setCategoryLocations(response.data);
        } else {
          // Failed to fetch category locations - use fallback
        setCategoryLocations([]);
      }
          } catch (error) {
        // Error fetching category locations - use fallback
        setCategoryLocations([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Load popular locations on component mount
  useEffect(() => {
    if (showPopularLocations) {
      fetchPopularLocations();
    }
  }, [showPopularLocations]); // Remove fetchPopularLocations from dependency array to prevent infinite loop

  // Modify handleInputChange to track searching state
  const handleInputChange = useCallback(
    debounce(async (value: string) => {
      if (!value.trim()) {
        setSuggestions([]);
        setHasSearched(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        const response = await locationSearchService.fetchLocationSuggestions(value, sessionToken);
        
        if (response.success && response.data) {
          setSuggestions(response.data);
        } else {
          setSuggestions([]);
          // Location search failed - clear suggestions
        }
      } catch (error) {
        // Location search error - clear suggestions
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [sessionToken]
  );

  // Remove excessive debug logging - only log when there are actual changes
  // Debug logging removed to prevent infinite loops

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
      setInput(suggestion.address);
      setShowSuggestions(false);
    
    // Create a properly formatted location object
    const selectedLocation: Location = {
          address: suggestion.address,
      latitude: suggestion.latitude || suggestion.coordinates?.lat || 0,
      longitude: suggestion.longitude || suggestion.coordinates?.lng || 0,
          coordinates: {
        lat: suggestion.latitude || suggestion.coordinates?.lat || 0,
        lng: suggestion.longitude || suggestion.coordinates?.lng || 0,
      },
      type: suggestion.metadata?.primaryType || "landmark",
      metadata: {
        postcode: suggestion.metadata?.postcode,
        city: suggestion.metadata?.city,
        region: suggestion.metadata?.region,
        category: suggestion.metadata?.category,
        primaryType: suggestion.metadata?.primaryType,
      },
    };

    // Location selection logging removed to prevent infinite loops

    // Update URL parameters based on location type
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      
      const locationData = {
        address: selectedLocation.address,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      };

      // Update URL parameter based on location type
      if (locationType === 'pickup') {
        params.set('pickup', encodeURIComponent(JSON.stringify(locationData)));
      } else if (locationType === 'dropoff') {
        params.set('dropoff', encodeURIComponent(JSON.stringify(locationData)));
      }

      // Update URL without refreshing the page
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
          }

    // Call the onSelect callback with the properly formatted location
    if (onSelect) {
      onSelect(selectedLocation);
        }

    // Clear suggestions after selection
    setSuggestions([]);
    setDropdownView('default');
  };

  // Handle clear input
  const handleClear = useCallback(() => {
    setInput("");
    onChange?.("");
    setSuggestions([]);
    setShowSuggestions(false);
    setHasSearched(false);
    inputRef.current?.focus();
  }, [onChange]);

  // Determine what to show in dropdown
  const shouldShowPopular = !hasSearched && input.trim().length === 0 && showPopularLocations;
  
  // Combine suggestions with current location option
  const combinedSuggestions = [
    ...(createCurrentLocationOption() ? [createCurrentLocationOption()] : []),
    ...(shouldShowPopular ? popularLocations : suggestions)
  ];

  // Remove the excessive debug logging that was causing console spam
  // Debug logging is now handled in the previous useEffect with selective logging

  // Dropdown classes with improved dark mode styling
  const dropdownClasses = cn(
    "absolute z-50 w-full mt-1 bg-popover text-popover-foreground border border-border rounded-md shadow-lg overflow-hidden",
    "dark:bg-popover dark:text-popover-foreground dark:border-border",
    "max-h-[300px] overflow-y-auto"
  );

  // Render dropdown content based on current state
  const renderDropdownContent = () => {
    // Show terminal selection when in terminal view
    if (dropdownView === 'terminals') {
      
      if (isSearching) {
        return (
          <div className="p-4 text-center text-muted-foreground">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p>Loading terminals...</p>
            </div>
          </div>
        );
      }

      if (terminalLocations.length === 0) {
        return (
          <div className="p-4 text-center text-muted-foreground">
            <p>No terminals found</p>
          </div>
        );
      }

      return (
        <div className="space-y-1">
          {/* Back button */}
          <div 
            className="
              flex items-center 
              px-4 py-2 
              cursor-pointer 
              transition-colors duration-200 
              hover:bg-muted/70 
              text-muted-foreground
              border-b border-border
            "
            onClick={(e) => {
              e.stopPropagation();
              setDropdownView(selectedCategory === 'airport' ? 'airports' : 'trains');
              setTerminalLocations([]);
              setSelectedLocation(null);
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm">Back to {selectedCategory === 'airport' ? 'Airports' : 'Train Stations'}</span>
          </div>

          {/* Terminal/Platform options */}
          {terminalLocations.map((terminal, index) => (
            <div
              key={terminal.id || index}
              className="
                flex items-center 
                px-4 py-3 
                cursor-pointer 
                transition-colors duration-200 
                hover:bg-muted/70 
                text-foreground
              "
              onClick={(e) => {
                e.stopPropagation();
                handleTerminalSelect(terminal);
              }}
            >
              <div className="flex-1">
                <div className="font-medium text-sm truncate">
                  {terminal.mainText || terminal.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {terminal.secondaryText}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Show category locations when in category view (regardless of input)
    if (dropdownView === 'airports' || dropdownView === 'trains') {
      // Rendering category locations
      
      if (isSearching) {
        return (
          <div className="p-4 text-center text-muted-foreground">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p>Loading {dropdownView}...</p>
            </div>
          </div>
        );
      }

      if (categoryLocations.length === 0) {
        return (
          <div className="p-4 text-center text-muted-foreground">
            <p>No {dropdownView} found</p>
          </div>
        );
      }

      return (
        <div className="space-y-1">
          {/* Back button */}
          <div 
            className="
              flex items-center 
              px-4 py-2 
              cursor-pointer 
              transition-colors duration-200 
              hover:bg-muted/70 
              text-muted-foreground
              border-b border-border
            "
            onClick={(e) => {
              e.stopPropagation();
              setDropdownView('default');
              setSelectedCategory(null);
              setCategoryLocations([]);
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm">Back</span>
          </div>

          {/* Category locations */}
          {categoryLocations.map((location, index) => (
            <div
              key={location.id || index}
              className="
                flex items-center 
                px-4 py-3 
                cursor-pointer 
                transition-colors duration-200 
                hover:bg-muted/70 
                text-foreground
              "
              onClick={(e) => {
                e.stopPropagation();
                // Instead of directly selecting, fetch terminals first
                if (selectedCategory) {
                  fetchTerminalInfo(location, selectedCategory);
                }
              }}
            >
              <div className="flex-1">
                <div className="font-medium text-sm truncate">
                  {location.mainText || location.name || location.address}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {location.secondaryText || location.address}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Show search results when user is typing
    if (input && suggestions.length > 0) {
      return (
        <div className="space-y-1">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id || index}
              className="
                flex items-center 
                px-4 py-3 
                cursor-pointer 
                transition-colors duration-200 
                hover:bg-muted/70 
                text-foreground
              "
              onClick={(e) => {
                e.stopPropagation();
                handleSuggestionSelect(suggestion);
              }}
            >
              <div className="flex-1">
                <div className="font-medium text-sm truncate">
                  {suggestion.mainText || suggestion.name || suggestion.address}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {suggestion.secondaryText || suggestion.address}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Show loading state when searching
    if (input && loading) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p>Searching...</p>
          </div>
        </div>
      );
    }

    // Show no results when search completed but no results
    if (input && hasSearched && suggestions.length === 0 && !loading) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>No locations found</p>
        </div>
      );
    }

    // Show current location and categories only when input is empty and not in category view
    if (!input && dropdownView === 'default') {
      return (
        <div className="space-y-2">
          {/* Current location option */}
          <div 
            className="
              flex items-center 
              px-4 py-3.5 
              cursor-pointer 
              transition-colors duration-200 
              hover:bg-muted/70 
              text-foreground
              space-x-3
            "
            onClick={(e) => {
              e.stopPropagation(); // Prevent dropdown from closing
              handleCurrentLocationSelect();
              setShowSuggestions(false);
            }}
          >
            <MapPin className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Use current location</span>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 gap-2 px-4 py-2">
            <div
              className="
                flex flex-col items-center justify-center 
                p-3 rounded-lg 
                bg-muted/50 
                hover:bg-muted/70 
                transition-colors duration-200
                text-foreground
                cursor-pointer
              "
              onClick={(e) => {
                e.stopPropagation(); // Prevent dropdown from closing
                setDropdownView('airports');
                setSelectedCategory('airport');
                fetchCategoryLocations('airport');
              }}
            >
              <Plane className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <span className="text-xs">Airports</span>
            </div>

            <div
              className="
                flex flex-col items-center justify-center 
                p-3 rounded-lg 
                bg-muted/50 
                hover:bg-muted/70 
                transition-colors duration-200
                text-foreground
                cursor-pointer
              "
              onClick={(e) => {
                e.stopPropagation(); // Prevent dropdown from closing
                setDropdownView('trains');
                setSelectedCategory('train_station');
                fetchCategoryLocations('train_station');
              }}
            >
              <Train className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <span className="text-xs">Train Stations</span>
            </div>
          </div>

          {/* Popular locations */}
          {popularLocations.length > 0 && (
            <div className="border-t border-border pt-2">
              <div className="px-4 py-2">
                <span className="text-xs font-medium text-muted-foreground">Popular Locations</span>
              </div>
              <div className="space-y-1">
                {popularLocations.slice(0, 10).map((location, index) => (
                  <div
                    key={location.id || index}
                    className="
                      flex items-center 
                      px-4 py-3 
                      cursor-pointer 
                      transition-colors duration-200 
                      hover:bg-muted/70 
                      text-foreground
                    "
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSuggestionSelect(location);
                    }}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm truncate">
                        {location.mainText || location.name || location.address}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {location.secondaryText || location.address}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Default fallback
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Start typing to search for locations</p>
      </div>
    );
  };

  // Fetch terminal/platform information for selected airport or train station
  const fetchTerminalInfo = useCallback(async (location: LocationSuggestion, category: 'airport' | 'train_station') => {
    try {
      setIsSearching(true);
      
      const response = await locationSearchService.fetchTerminalInfo(location.id || '', category);
      
      if (response.success && response.data) {
        setTerminalLocations(response.data);
        setSelectedLocation(location);
        setDropdownView('terminals');
      } else {
        // If no terminals found, select the location directly
        handleSuggestionSelect(location);
      }
    } catch (error) {
      // If error, select the location directly
      handleSuggestionSelect(location);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle terminal selection
  const handleTerminalSelect = (terminal: LocationSuggestion) => {
    if (selectedLocation) {
      // Combine the parent location with terminal information
      const combinedLocation: LocationSuggestion = {
        ...selectedLocation,
        id: terminal.id,
        address: `${selectedLocation.address} - ${terminal.name}`,
        mainText: `${selectedLocation.mainText} - ${terminal.name}`,
        secondaryText: selectedLocation.secondaryText,
        metadata: {
          ...selectedLocation.metadata,
          terminalId: terminal.metadata?.terminalId,
          terminalName: terminal.name
        }
      };
      
      handleSuggestionSelect(combinedLocation);
    }
  };

  return (
    <div 
      className={cn(
        "relative w-full", // Add relative positioning
        className
      )}
    >
      {/* Input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            const value = e.target.value;
            setInput(value);
            onChange?.(value);
            
            // Always show suggestions dropdown when typing
            setShowSuggestions(true);
            
            // Trigger search for any input
            handleInputChange(value);
          }}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onClick={handleInputClick}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full px-3 py-2 border border-input rounded-md",
            "bg-background text-foreground",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
        />
        
        {/* Clear button */}
        {input && (
          <button
            type="button"
            onClick={() => {
              setInput('');
              setSuggestions([]);
              setDropdownView('default');
              setHasSearched(false);
              
              // Update URL to remove location parameter
              if (typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                
                if (locationType === 'pickup') {
                  params.delete('pickup');
                } else if (locationType === 'dropoff') {
                  params.delete('dropoff');
                } else if (locationType === 'stop') {
                  // For stops, we need to handle this differently since there might be multiple
                  // The parent component should handle stop removal
                }
                
                const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
                window.history.replaceState({}, '', newUrl);
              }
              
              // Call onChange to clear the input value
              if (onChange) {
                onChange('');
              }
              
              // Call onSelect with null to clear the selection
              if (onSelect) {
                onSelect({
                  address: '',
                  latitude: 0,
                  longitude: 0,
                  coordinates: { lat: 0, lng: 0 },
                  type: 'landmark',
                  metadata: {}
                });
              }
            }}
            className="absolute right-[1px] top-1/2 -translate-y-1/2 bg-background dark:bg-background hover:bg-background/80 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 bg-background dark:bg-background" />
          </button>
        )}
      </div>

      {/* Dropdown suggestions */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="
            absolute z-[9999] 
            left-0 right-0 
            top-full 
            bg-background 
            border border-border 
            rounded-lg shadow-lg 
            overflow-hidden
            w-full
            max-w-md
            mx-auto
            max-h-[65vh]
            overflow-y-auto
          "
          style={{
            position: 'absolute',
            transform: 'translateY(0)', // Remove vertical offset
            boxShadow: '0 10px 25px rgba(0,0,0,0.1) dark:rgba(0,0,0,0.3)' // Theme-aware shadow
          }}
          onMouseDown={(e) => {
            // Prevent dropdown from closing when clicking inside
            e.preventDefault();
          }}
        >
          {/* Dropdown content */}
          {renderDropdownContent()}
        </div>
      )}
    </div>
  );
}
