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
  ArrowLeft,
  Building
} from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/components/ui/use-toast";
import { locationSearchService, LocationSuggestion } from "@/lib/location-search-service";
import { v4 as uuidv4 } from 'uuid';
import { cn } from "@/lib/utils";

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

// Types for location data
export interface Location {
  address: string;
  latitude: number;
  longitude: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  type?: string;
  metadata?: {
    postcode?: string;
    city?: string;
    region?: string;
    category?: string;
    primaryType?: string;
  };
}

interface LocationSearchResult {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  metadata?: {
    postcode?: string;
    city?: string;
    region?: string;
    category?: string;
    primaryType?: string;
  };
}

interface UKLocationInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (location: Location) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  locationType?: 'pickup' | 'dropoff' | 'stop';
  showPopularLocations?: boolean;
  initialLocation?: Location | null;
  userLocation?: { latitude: number; longitude: number } | null;
  initialSuggestionsTitle?: string;
}

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
  userLocation = null,
  initialSuggestionsTitle = "Popular Locations"
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
  const [dropdownView, setDropdownView] = useState<'default' | 'airports' | 'trains' | 'cruise_terminals' | 'terminals'>('default');
  const [selectedCategory, setSelectedCategory] = useState<'airport' | 'train_station' | 'cruise_terminal' | null>(null);
  const [categoryLocations, setCategoryLocations] = useState<LocationSuggestion[]>([]);
  const [terminalLocations, setTerminalLocations] = useState<LocationSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>('');

  // Filtered locations based on search query
  const filteredCategoryLocations = useMemo(() => {
    if (!categorySearchQuery.trim()) {
      return categoryLocations;
    }
    
    const query = categorySearchQuery.toLowerCase();
    return categoryLocations.filter(location => 
      location.mainText?.toLowerCase().includes(query) ||
      location.address?.toLowerCase().includes(query) ||
      location.secondaryText?.toLowerCase().includes(query)
    );
  }, [categoryLocations, categorySearchQuery]);

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

  // Initialize input value on mount
  useEffect(() => {
    if (value && value.trim()) {
      console.log('UKLocationInput: Initializing input with value:', value);
      setInput(value);
    } else if (initialLocation?.address) {
      console.log('UKLocationInput: Initializing input with initialLocation:', initialLocation.address);
      setInput(initialLocation.address);
    }
  }, []); // Only run on mount

  // Update input when value prop changes (for URL parameter restoration)
  useEffect(() => {
    if (value !== undefined && value !== input) {
      console.log('UKLocationInput: Updating input from value prop:', value);
      setInput(value);
    }
  }, [value]);

  // Also handle initialLocation prop
  useEffect(() => {
    if (initialLocation?.address && !input) {
      console.log('UKLocationInput: Setting input from initialLocation:', initialLocation.address);
      setInput(initialLocation.address);
    }
  }, [initialLocation, input]);

  // Create current location option
  const createCurrentLocationOption = useCallback((): LocationSuggestion | null => {
    if (!userLocation) return null;
    
    return {
    id: 'current-location',
      address: 'Current Location',
    mainText: 'Current Location',
      secondaryText: 'Use your current location',
    name: 'Current Location',
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      coordinates: {
        lat: userLocation.latitude,
        lng: userLocation.longitude
      },
      metadata: {
      primaryType: 'current_location',
      region: 'UK'
      }
    };
  }, [userLocation]);

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

  // Fetch category-specific locations (airports, train stations, or cruise terminals)
  const fetchCategoryLocations = useCallback(async (category: 'airport' | 'train_station' | 'cruise_terminal') => {
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
  }, [showPopularLocations, fetchPopularLocations]);

  // Enhanced handleInputChange with debouncing
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
    }, 200, 0), // 200ms debounce, no character minimum
    [sessionToken]
  );

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    // ONLY show terminal selection for airports when we're in the airport category
    if (selectedCategory === 'airport' && (
        suggestion.metadata?.primaryType === 'airport' || 
        suggestion.metadata?.category === 'airport'
      )) {
      // Show terminal selection for airports only
      setSelectedLocation(suggestion);
      setDropdownView('terminals');
      
      // Fetch terminal information
      const fetchTerminals = async () => {
        try {
          setIsSearching(true);
          const response = await locationSearchService.fetchTerminalInfo(
            suggestion.metadata?.placeId || suggestion.id,
            selectedCategory
          );
          
          if (response.success && response.data) {
            setTerminalLocations(response.data);
          } else {
            setTerminalLocations([]);
          }
        } catch (error) {
          setTerminalLocations([]);
        } finally {
          setIsSearching(false);
        }
      };
      
      fetchTerminals();
      return;
    }

    // For ALL other cases (including train stations), directly select the location

    // For regular locations or terminals, proceed with normal selection
    // Ensure we have valid coordinates with proper precision
    const lat = suggestion.latitude || suggestion.coordinates?.lat || 0;
    const lng = suggestion.longitude || suggestion.coordinates?.lng || 0;
    
    // Validate coordinates are not zero or invalid
    if (lat === 0 && lng === 0) {
      console.error('Invalid coordinates received:', suggestion);
      return;
    }
    
    // Ensure coordinates have sufficient precision (at least 6 decimal places)
    const preciseLat = parseFloat(lat.toFixed(6));
    const preciseLng = parseFloat(lng.toFixed(6));
    
    setInput(suggestion.address);
    setShowSuggestions(false);
  
  // Create a properly formatted location object
  const selectedLocation: Location = {
        address: suggestion.address,
    latitude: preciseLat,
    longitude: preciseLng,
        coordinates: {
      lat: preciseLat,
      lng: preciseLng,
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
  setSelectedLocation(null);
};

  // Handle clear input
  const handleClear = useCallback(() => {
    setInput("");
    onChange?.("");
    setSuggestions([]);
    setShowSuggestions(false);
    setHasSearched(false);
    setDropdownView('default');
    setSelectedCategory(null);
    setCategoryLocations([]);
    setTerminalLocations([]);
    setSelectedLocation(null);
    
    // Call onSelect with cleared location to trigger parent component updates
    if (onSelect) {
      onSelect({
        address: "",
        latitude: 0,
        longitude: 0,
        coordinates: { lat: 0, lng: 0 },
        type: "landmark",
        metadata: {
          postcode: undefined,
          city: undefined,
          region: undefined,
          category: undefined,
        },
      });
    }
    
    inputRef.current?.focus();
  }, [onChange, onSelect]);

  // Determine what to show in dropdown
  const shouldShowPopular = !hasSearched && input.trim().length === 0 && showPopularLocations;
  
  // Combine suggestions with current location option
  const combinedSuggestions = [
    ...(createCurrentLocationOption() ? [createCurrentLocationOption()] : []),
    ...(shouldShowPopular ? popularLocations : suggestions)
  ];

  // Dropdown classes with improved dark mode styling
  const dropdownClasses = cn(
    "absolute z-50 w-full mt-1 bg-popover text-popover-foreground border border-border rounded-md shadow-lg overflow-hidden",
    "dark:bg-popover dark:text-popover-foreground dark:border-border",
    "max-h-[300px] overflow-y-auto"
  );

  // Render dropdown content based on current state
  const renderDropdownContent = () => {
    // Show category selection (airports/trains)
    if (dropdownView === 'default' && !input && showPopularLocations) {
      return (
        <div className="space-y-1">
          {/* Current Location Option */}
          {createCurrentLocationOption() && (
          <div 
            className="
              flex items-center 
                px-4 py-3 
              cursor-pointer 
              transition-colors duration-200 
              hover:bg-muted/70 
                text-foreground
              border-b border-border
            "
            onClick={(e) => {
              e.stopPropagation();
                handleSuggestionSelect(createCurrentLocationOption()!);
            }}
          >
              <div className="flex items-center space-x-3">
                <Navigation className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="font-medium text-sm">Current Location</div>
                  <div className="text-xs text-muted-foreground">Use your current location</div>
          </div>
              </div>
            </div>
          )}

          {/* Category Buttons */}
          <div className="px-4 py-2">
            <div className="text-xs font-medium text-muted-foreground mb-2">Quick Access</div>
            <div className="grid grid-cols-3 gap-2 w-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownView('airports');
                  setSelectedCategory('airport');
                  setCategorySearchQuery('');
                  fetchCategoryLocations('airport');
                }}
                className="
                  flex items-center justify-center space-x-2 
                  px-4 py-5 
                  text-sm font-semibold
                  bg-background border border-green-200 hover:border-green-300
                  text-green-600 hover:text-green-700
                  rounded-lg 
                  transition-colors duration-150
                  dark:bg-background dark:border-green-700 dark:hover:border-green-600
                  dark:text-green-400 dark:hover:text-green-300
                "
              >
                <Plane className="w-5 h-5" />
                <span>Airports</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownView('trains');
                  setSelectedCategory('train_station');
                  setCategorySearchQuery('');
                  fetchCategoryLocations('train_station');
                }}
                className="
                  flex items-center justify-center space-x-2 
                  px-4 py-5 
                  text-sm font-semibold
                  bg-background border border-blue-200 hover:border-blue-300
                  text-blue-600 hover:text-blue-700
                  rounded-lg 
                  transition-colors duration-150
                  dark:bg-background dark:border-blue-700 dark:hover:border-blue-600
                  dark:text-blue-400 dark:hover:text-blue-300
                "
              >
                <Train className="w-5 h-5" />
                <span>Stations</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownView('cruise_terminals');
                  setSelectedCategory('cruise_terminal');
                  setCategorySearchQuery('');
                  fetchCategoryLocations('cruise_terminal');
                }}
                className="
                  flex items-center justify-center space-x-2 
                  px-3 py-5 
                  text-sm font-semibold
                  bg-background border border-purple-200 hover:border-purple-300
                  text-purple-600 hover:text-purple-700
                  rounded-lg 
                  transition-colors duration-150
                  dark:bg-background dark:border-purple-700 dark:hover:border-purple-600
                  dark:text-purple-400 dark:hover:text-purple-300
                "
              >
                <Building className="w-5 h-5" />
                <span>Cruise</span>
              </button>
            </div>
          </div>

          {/* Popular Locations */}
          {popularLocations.length > 0 && (
            <div className="border-t border-border pt-2">
              <div className="px-4 py-2">
                <span className="text-xs font-medium text-muted-foreground">{initialSuggestionsTitle}</span>
              </div>
              <div className="space-y-1">
                {popularLocations.slice(0, 10).map((location, index) => (
            <div
                    key={location.id || index}
              className="
                      flex items-start 
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
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm break-words leading-tight">
                        {location.mainText || location.name || location.address}
                </div>
                      <div className="text-xs text-muted-foreground break-words leading-tight mt-1">
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

    // Show category results (airports/trains/cruise terminals)
    if (dropdownView === 'airports' || dropdownView === 'trains' || dropdownView === 'cruise_terminals') {
      return (
        <div className="space-y-1">
          {/* Back button */}
          <div 
            className="
              flex items-center 
              px-4 py-3 
              cursor-pointer 
              transition-colors duration-200 
              hover:bg-muted/70 
              text-foreground
              border-b border-border
            "
            onClick={(e) => {
              e.stopPropagation();
              setDropdownView('default');
              setSelectedCategory(null);
              setCategoryLocations([]);
            }}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            <span className="text-sm">Back to all locations</span>
          </div>

          {/* Category title */}
          <div className="px-4 py-2">
            <div className="text-xs font-medium text-muted-foreground">
              {dropdownView === 'airports' ? 'Airports' : 
               dropdownView === 'trains' ? 'Train Stations' : 
               'Cruise Terminals'}
            </div>
          </div>

          {/* Search input */}
          <div className="px-4 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search ${dropdownView === 'airports' ? 'airports' : 
                          dropdownView === 'trains' ? 'stations' : 
                          'cruise terminals'}...`}
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                onFocus={(e) => e.stopPropagation()}
                onBlur={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                className="w-full pl-10 pr-4 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Loading state */}
          {isSearching && (
            <div className="p-4 text-center text-muted-foreground">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-sm">Loading...</p>
              </div>
            </div>
          )}

          {/* Category results */}
          {!isSearching && filteredCategoryLocations.length > 0 && (
            <div className="space-y-1">
          {filteredCategoryLocations.map((location, index) => (
            <div
              key={location.id || index}
              className="
                    flex items-start 
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
                  <div className="flex items-start space-x-3">
                    {dropdownView === 'airports' ? (
                      <Plane className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : dropdownView === 'trains' ? (
                      <Train className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Building className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm break-words leading-tight">
                  {location.mainText || location.name || location.address}
                </div>
                      <div className="text-xs text-muted-foreground break-words leading-tight mt-1">
                  {location.secondaryText || location.address}
                      </div>
                </div>
              </div>
            </div>
          ))}
            </div>
          )}

          {/* No results */}
          {!isSearching && categoryLocations.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">No {dropdownView === 'airports' ? 'airports' : 
                dropdownView === 'trains' ? 'stations' : 'cruise terminals'} found</p>
            </div>
          )}

          {/* No filtered results */}
          {!isSearching && categoryLocations.length > 0 && filteredCategoryLocations.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">No results found for "{categorySearchQuery}"</p>
            </div>
          )}
        </div>
      );
    }

    // Show terminal selection
    if (dropdownView === 'terminals' && selectedLocation) {
      return (
        <div className="space-y-1">
          {/* Back button */}
            <div
              className="
                flex items-center 
                px-4 py-3 
                cursor-pointer 
                transition-colors duration-200 
                hover:bg-muted/70 
                text-foreground
              border-b border-border
              "
              onClick={(e) => {
                e.stopPropagation();
              setDropdownView(selectedCategory === 'airport' ? 'airports' : 'trains');
              setSelectedLocation(null);
              setTerminalLocations([]);
              }}
            >
            <ChevronLeft className="w-4 h-4 mr-2" />
            <span className="text-sm">Back to {selectedCategory === 'airport' ? 'airports' : 
              selectedCategory === 'train_station' ? 'stations' : 'cruise terminals'}</span>
                </div>

          {/* Selected location info */}
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-start space-x-3">
              {selectedCategory === 'airport' ? (
                <Plane className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              ) : selectedCategory === 'train_station' ? (
                <Train className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              ) : (
                <Building className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm break-words leading-tight">
                  {selectedLocation.mainText || selectedLocation.name || selectedLocation.address}
                </div>
                <div className="text-xs text-muted-foreground break-words leading-tight mt-1">
                  {selectedLocation.secondaryText || selectedLocation.address}
              </div>
            </div>
        </div>
          </div>

          {/* Terminal title */}
          <div className="px-4 py-2">
            <div className="text-xs font-medium text-muted-foreground">
              Select Terminal
            </div>
          </div>

          {/* Loading state */}
          {isSearching && (
        <div className="p-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-sm">Loading terminals...</p>
          </div>
        </div>
          )}

          {/* Terminal results */}
          {!isSearching && terminalLocations.length > 0 && (
            <div className="space-y-1">
              {terminalLocations.map((terminal, index) => (
                <div
                  key={terminal.id || index}
            className="
                    flex items-start 
                    px-4 py-3 
              cursor-pointer 
              transition-colors duration-200 
              hover:bg-muted/70 
              text-foreground
            "
            onClick={(e) => {
                    e.stopPropagation();
                    handleSuggestionSelect(terminal);
            }}
          >
                  <div className="flex items-start space-x-3">
                    <Building className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm break-words leading-tight">
                        {terminal.mainText || terminal.name || terminal.address}
          </div>
                      <div className="text-xs text-muted-foreground break-words leading-tight mt-1">
                        {terminal.secondaryText || terminal.address}
            </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No terminals found */}
          {!isSearching && terminalLocations.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">No terminals found</p>
              <p className="text-xs mt-1">You can select the main location instead</p>
              <button
                className="mt-2 px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
              onClick={(e) => {
                  e.stopPropagation();
                  handleSuggestionSelect(selectedLocation);
              }}
            >
                Select Main Location
              </button>
            </div>
          )}
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
                flex items-start 
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
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm break-words leading-tight">
                  {suggestion.mainText || suggestion.name || suggestion.address}
                      </div>
                <div className="text-xs text-muted-foreground break-words leading-tight mt-1">
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

    // No minimum character requirement - removed for better UX

    // Default fallback
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Start typing to search for locations</p>
      </div>
    );
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
            
            // Trigger search for any input (debouncing and minimum threshold handled in handleInputChange)
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
            "text-base", // Ensure readable text size on mobile
            className
          )}
          style={{
            WebkitAppearance: 'none', // Remove iOS styling
          }}
        />
        
        {/* Clear button */}
        {input && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="
              absolute right-[1px] top-1/2 -translate-y-1/2 
              bg-primary text-primary-foreground
              rounded-full p-0
              transition-colors
              hover:bg-primary/90
            "
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Dropdown */}
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
            max-h-[75vh]
            overflow-y-auto
          "
          style={{
            position: 'absolute',
            transform: 'translateY(0)', // Remove vertical offset
            boxShadow: '0 10px 25px rgba(0,0,0,0.1) dark:rgba(0,0,0,0.3)' // Theme-aware shadow
          }}
          onMouseDown={(e) => {
            // Prevent dropdown from closing when clicking inside
            // Don't prevent default on mobile to allow input focus
            if (!('ontouchstart' in window)) {
              e.preventDefault();
            }
          }}
        >
          {/* Dropdown content */}
          {renderDropdownContent()}
        </div>
      )}
    </div>
  );
}
