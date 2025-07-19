/**
 * Location Search Service - Mapbox Implementation
 * Handles all location-related API calls with robust error handling
 * Uses Mapbox SDK directly for cost optimization and better performance
 */

import mapboxgl from 'mapbox-gl';
import { ukLocationSearchService } from './uk-location-search';
import { UK_AIRPORTS, UK_STATIONS, searchLocations, findLocationById, getTerminalsByLocationId } from './uk-airports-stations';

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export interface LocationSuggestion {
  id: string;
  address: string;
  mainText?: string;
  secondaryText?: string;
  name?: string;
  latitude?: number;
  longitude?: number;
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
}

export interface LocationSearchResponse {
  success: boolean;
  data?: LocationSuggestion[];
  error?: {
    message: string;
    details?: string;
  };
}

export interface PlaceDetailsResponse {
  success: boolean;
  data?: LocationSuggestion;
  error?: {
    message: string;
    details?: string;
  };
}

// Expand popular locations data structure
export interface PopularLocationCategory {
  airports: LocationSuggestion[];
  trainStations: LocationSuggestion[];
  popularCities: LocationSuggestion[];
}

class LocationSearchService {
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private cache = new Map<string, { data: any; timestamp: number; expiresAt: number }>();
  
  // Pre-defined popular locations for instant loading
  private readonly fallbackPopularLocations = [
    {
      id: 'london-city',
      address: 'City of London, London, UK',
      mainText: 'City of London',
      secondaryText: 'Financial District, London',
      name: 'City of London',
      latitude: 51.5156,
      longitude: -0.0919,
      coordinates: { lat: 51.5156, lng: -0.0919 },
      metadata: { primaryType: 'locality', region: 'UK' }
    },
    {
      id: 'canary-wharf',
      address: 'Canary Wharf, London E14, UK',
      mainText: 'Canary Wharf',
      secondaryText: 'Business District, London E14',
      name: 'Canary Wharf',
      latitude: 51.5054,
      longitude: -0.0235,
      coordinates: { lat: 51.5054, lng: -0.0235 },
      metadata: { primaryType: 'locality', region: 'UK' }
    },
    {
      id: 'westminster',
      address: 'Westminster, London SW1A, UK',
      mainText: 'Westminster',
      secondaryText: 'Government District, London SW1A',
      name: 'Westminster',
      latitude: 51.4994,
      longitude: -0.1269,
      coordinates: { lat: 51.4994, lng: -0.1269 },
      metadata: { primaryType: 'locality', region: 'UK' }
    },
    {
      id: 'covent-garden',
      address: 'Covent Garden, London WC2E, UK',
      mainText: 'Covent Garden',
      secondaryText: 'Theatre District, London WC2E',
      name: 'Covent Garden',
      latitude: 51.5118,
      longitude: -0.1246,
      coordinates: { lat: 51.5118, lng: -0.1246 },
      metadata: { primaryType: 'locality', region: 'UK' }
    },
    {
      id: 'oxford-street',
      address: 'Oxford Street, London W1, UK',
      mainText: 'Oxford Street',
      secondaryText: 'Shopping District, London W1',
      name: 'Oxford Street',
      latitude: 51.5154,
      longitude: -0.1447,
      coordinates: { lat: 51.5154, lng: -0.1447 },
      metadata: { primaryType: 'route', region: 'UK' }
    },
    {
      id: 'shoreditch',
      address: 'Shoreditch, London E1, UK',
      mainText: 'Shoreditch',
      secondaryText: 'Creative Quarter, London E1',
      name: 'Shoreditch',
      latitude: 51.5252,
      longitude: -0.0781,
      coordinates: { lat: 51.5252, lng: -0.0781 },
      metadata: { primaryType: 'locality', region: 'UK' }
    },
    {
      id: 'kensington',
      address: 'Kensington, London SW7, UK',
      mainText: 'Kensington',
      secondaryText: 'Museums District, London SW7',
      name: 'Kensington',
      latitude: 51.4989,
      longitude: -0.1773,
      coordinates: { lat: 51.4989, lng: -0.1773 },
      metadata: { primaryType: 'locality', region: 'UK' }
    },
    {
      id: 'greenwich',
      address: 'Greenwich, London SE10, UK',
      mainText: 'Greenwich',
      secondaryText: 'Maritime District, London SE10',
      name: 'Greenwich',
      latitude: 51.4816,
      longitude: -0.0052,
      coordinates: { lat: 51.4816, lng: -0.0052 },
      metadata: { primaryType: 'locality', region: 'UK' }
    }
  ];

  /**
   * Get data from cache if available and not expired
   */
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  /**
   * Set data in cache with expiration
   */
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.cacheTimeout
    });
  }

  /**
   * Fetch location suggestions using Mapbox Geocoding API
   * Implements minimum 3 character threshold and debouncing
   */
  async fetchLocationSuggestions(
    input: string,
    sessionToken?: string
  ): Promise<LocationSearchResponse> {
    try {
      // Validate input
      if (!input || typeof input !== 'string') {
        return {
          success: false,
          error: {
            message: 'Invalid input',
            details: 'Search query must be a non-empty string'
          }
        };
      }

      const trimmedInput = input.trim();
      
      // Minimum 3 character threshold as per requirements
      if (trimmedInput.length < 3) {
        return {
          success: true,
          data: []
        };
      }

      // Check cache first
      const cacheKey = `search_${trimmedInput}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached
        };
      }

      // Only log search queries longer than 2 characters to reduce noise
      if (trimmedInput.length > 2) {
        console.log(`🔍 Mapbox Location Search: "${trimmedInput}"`);
      }

      // Use enhanced search from UK location search service for better results
      const enhancedResponse = await ukLocationSearchService.enhancedSearch(trimmedInput);
      
      if (enhancedResponse.success && enhancedResponse.data) {
        // Cache the results
        this.setCachedData(cacheKey, enhancedResponse.data);
        return enhancedResponse;
      }

      // Fallback to original Mapbox search if enhanced search fails
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!token) {
        return {
          success: false,
          error: {
            message: 'Missing Mapbox token',
            details: 'Mapbox access token is not configured'
          }
        };
      }

      // Construct URL with optimized parameters for UK locations
      const params = new URLSearchParams({
        access_token: token,
        country: 'gb', // UK only
        autocomplete: 'true',
        limit: '10', // Increased limit for better results
        language: 'en'
        // Removed restrictive types parameter to search everything
      });

      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmedInput)}.json?${params}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'force-cache' // Use cache for cost optimization
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mapbox Geocoding API Error:', errorText);
        
        // Try enhanced search as fallback
        try {
          console.log('Trying enhanced search as fallback...');
          const enhancedResponse = await ukLocationSearchService.enhancedSearch(trimmedInput);
          
          if (enhancedResponse.success && enhancedResponse.data && enhancedResponse.data.length > 0) {
            console.log(`Enhanced search found ${enhancedResponse.data.length} results`);
            return enhancedResponse;
          }
        } catch (fallbackError) {
          console.error('Enhanced search fallback failed:', fallbackError);
        }

        return {
          success: false,
          error: {
            message: `HTTP error! status: ${response.status}`,
            details: errorText
          }
        };
      }

      const data = await response.json();

      if (!data.features || !Array.isArray(data.features)) {
        // Try enhanced search as fallback
        try {
          console.log('No results from Mapbox, trying enhanced search...');
          const enhancedResponse = await ukLocationSearchService.enhancedSearch(trimmedInput);
          
          if (enhancedResponse.success && enhancedResponse.data && enhancedResponse.data.length > 0) {
            console.log(`Enhanced search found ${enhancedResponse.data.length} results`);
            return enhancedResponse;
          }
        } catch (fallbackError) {
          console.error('Enhanced search fallback failed:', fallbackError);
        }
        
        return {
          success: true,
          data: []
        };
      }

      // Convert Mapbox features to our format
      const suggestions: LocationSuggestion[] = data.features
        .map((feature: any, index: number) => ({
          id: feature.id || `mapbox-${index}`,
          address: feature.place_name || 'Unknown Location',
          mainText: feature.text || 'Unknown Location',
          secondaryText: feature.place_name || '',
          name: feature.text || 'Unknown Location',
          latitude: feature.center?.[1] || 0,
          longitude: feature.center?.[0] || 0,
          coordinates: {
            lat: feature.center?.[1] || 0,
            lng: feature.center?.[0] || 0
          },
          metadata: {
            primaryType: feature.place_type?.[0] || 'place',
            postcode: this.extractPostcode(feature.context),
            city: this.extractCity(feature.context),
            region: 'UK',
            category: feature.place_type?.[0] || 'place',
            placeId: feature.id
          }
        }));

      // Also search hardcoded airports and stations
      const hardcodedResults = searchLocations(trimmedInput);
      const hardcodedSuggestions: LocationSuggestion[] = hardcodedResults.map(location => ({
        id: location.id,
        address: location.address,
        mainText: location.name,
        secondaryText: location.address,
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        coordinates: {
          lat: location.latitude,
          lng: location.longitude
        },
        metadata: {
          primaryType: location.metadata.primaryType,
          postcode: location.postcode,
          city: location.city,
          region: 'UK',
          category: location.metadata.category,
          placeId: location.id
        }
      }));

      // Combine API results with hardcoded results
      const allSuggestions = [...suggestions, ...hardcodedSuggestions];

      // If we don't have enough results, try enhanced search
      if (allSuggestions.length < 3) {
        console.log(`Not enough results (${allSuggestions.length}), trying enhanced search...`);
        
        try {
          const enhancedResponse = await ukLocationSearchService.enhancedSearch(trimmedInput);
          
          if (enhancedResponse.success && enhancedResponse.data && enhancedResponse.data.length > allSuggestions.length) {
            console.log(`Enhanced search found ${enhancedResponse.data.length} results`);
            return enhancedResponse;
          }
        } catch (error) {
          console.error('Enhanced search failed:', error);
        }
      }

      // Cache the results
      this.setCachedData(cacheKey, allSuggestions);

            return {
        success: true,
        data: allSuggestions
      };

    } catch (error) {
      console.error('Error in Mapbox location search:', error);
      return {
        success: false,
        error: {
          message: 'Search failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Extract postcode from Mapbox context
   */
  private extractPostcode(context: any[]): string | undefined {
    if (!context || !Array.isArray(context)) return undefined;
    const postcodeContext = context.find(ctx => ctx.id?.startsWith('postcode'));
    return postcodeContext?.text;
  }

  /**
   * Extract city from Mapbox context
   */
  private extractCity(context: any[]): string | undefined {
    if (!context || !Array.isArray(context)) return undefined;
    const cityContext = context.find(ctx => ctx.id?.startsWith('place'));
    return cityContext?.text;
  }

  /**
   * Fetch popular locations (returns cached fallback data)
   */
  async fetchPopularLocations(): Promise<LocationSearchResponse> {
    try {
      // Check cache first
      const cacheKey = 'popular_locations';
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached
        };
      }

      // Use fallback data for instant loading
      const popularLocations = [...this.fallbackPopularLocations];
      
      // Cache the results
      this.setCachedData(cacheKey, popularLocations);

      return {
        success: true,
        data: popularLocations
      };
    } catch (error) {
      console.error('Error fetching popular locations:', error);
      return {
        success: false,
        error: {
          message: 'Failed to fetch popular locations',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Fetch category-specific locations (airports or train stations)
   */
  async fetchCategoryLocations(category: 'airport' | 'train_station'): Promise<LocationSearchResponse> {
    try {
      // Check cache first
      const cacheKey = `category_${category}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached
        };
      }

      // Use hardcoded data for instant loading
      const categoryLocations = category === 'airport' ? UK_AIRPORTS : UK_STATIONS;
      
      // Cache the results
      this.setCachedData(cacheKey, categoryLocations);

      return {
        success: true,
        data: categoryLocations
      };
    } catch (error) {
      console.error(`Error fetching ${category} locations:`, error);
      
      // Try enhanced search as fallback
      try {
        console.log(`Trying enhanced search as fallback for ${category}...`);
        const enhancedResponse = await ukLocationSearchService.searchByCategory(category === 'airport' ? 'airports' : 'train_stations');
        
        if (enhancedResponse.success && enhancedResponse.data) {
          return enhancedResponse;
        }
      } catch (fallbackError) {
        console.error('Enhanced search fallback failed:', fallbackError);
      }
      
      // Final fallback to hardcoded data
      const fallbackData = this.getFallbackCategoryData(category);
      return {
        success: true,
        data: fallbackData
      };
    }
  }

  /**
   * Get fallback data for specific categories
   */
  private getFallbackCategoryData(category: 'airport' | 'train_station'): LocationSuggestion[] {
    if (category === 'airport') {
      return [
        {
          id: 'heathrow',
          address: 'Heathrow Airport, London TW6, UK',
          mainText: 'Heathrow Airport',
          secondaryText: 'London TW6, UK',
          name: 'Heathrow Airport',
          latitude: 51.4700,
          longitude: -0.4543,
          coordinates: { lat: 51.4700, lng: -0.4543 },
          metadata: { primaryType: 'airport', region: 'UK' }
        },
        {
          id: 'gatwick',
          address: 'Gatwick Airport, London RH6, UK',
          mainText: 'Gatwick Airport',
          secondaryText: 'London RH6, UK',
          name: 'Gatwick Airport',
          latitude: 51.1537,
          longitude: -0.1821,
          coordinates: { lat: 51.1537, lng: -0.1821 },
          metadata: { primaryType: 'airport', region: 'UK' }
        },
        {
          id: 'stansted',
          address: 'Stansted Airport, London CM24, UK',
          mainText: 'Stansted Airport',
          secondaryText: 'London CM24, UK',
          name: 'Stansted Airport',
          latitude: 51.8860,
          longitude: 0.2389,
          coordinates: { lat: 51.8860, lng: 0.2389 },
          metadata: { primaryType: 'airport', region: 'UK' }
        },
        {
          id: 'luton',
          address: 'Luton Airport, London LU2, UK',
          mainText: 'Luton Airport',
          secondaryText: 'London LU2, UK',
          name: 'Luton Airport',
          latitude: 51.8747,
          longitude: -0.3683,
          coordinates: { lat: 51.8747, lng: -0.3683 },
          metadata: { primaryType: 'airport', region: 'UK' }
        }
      ];
    } else {
      return [
        {
          id: 'kings-cross',
          address: 'King\'s Cross Station, London N1, UK',
          mainText: 'King\'s Cross Station',
          secondaryText: 'London N1, UK',
          name: 'King\'s Cross Station',
          latitude: 51.5320,
          longitude: -0.1233,
          coordinates: { lat: 51.5320, lng: -0.1233 },
          metadata: { primaryType: 'train_station', region: 'UK' }
        },
        {
          id: 'paddington',
          address: 'Paddington Station, London W2, UK',
          mainText: 'Paddington Station',
          secondaryText: 'London W2, UK',
          name: 'Paddington Station',
          latitude: 51.5154,
          longitude: -0.1755,
          coordinates: { lat: 51.5154, lng: -0.1755 },
          metadata: { primaryType: 'train_station', region: 'UK' }
        },
        {
          id: 'waterloo',
          address: 'Waterloo Station, London SE1, UK',
          mainText: 'Waterloo Station',
          secondaryText: 'London SE1, UK',
          name: 'Waterloo Station',
          latitude: 51.5033,
          longitude: -0.1145,
          coordinates: { lat: 51.5033, lng: -0.1145 },
          metadata: { primaryType: 'train_station', region: 'UK' }
        },
        {
          id: 'victoria',
          address: 'Victoria Station, London SW1, UK',
          mainText: 'Victoria Station',
          secondaryText: 'London SW1, UK',
          name: 'Victoria Station',
          latitude: 51.4965,
          longitude: -0.1441,
          coordinates: { lat: 51.4965, lng: -0.1441 },
          metadata: { primaryType: 'train_station', region: 'UK' }
        }
      ];
    }
  }

  /**
   * Fetch place details using Mapbox Geocoding API
   */
  async fetchPlaceDetails(
    placeId: string,
    sessionToken?: string
  ): Promise<PlaceDetailsResponse> {
    try {
      // Check cache first
      const cacheKey = `details_${placeId}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached
        };
      }

      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!token) {
        return {
          success: false,
          error: {
            message: 'Missing Mapbox token',
            details: 'Mapbox access token is not configured'
          }
        };
      }

      // Use Mapbox Geocoding API to get place details
      const params = new URLSearchParams({
        access_token: token,
        country: 'gb',
        types: 'address,postcode,poi,place',
        language: 'en'
      });

      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(placeId)}.json?${params}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mapbox Place Details API Error:', errorText);
        
        return {
          success: false,
          error: {
            message: `HTTP error! status: ${response.status}`,
            details: errorText
          }
        };
      }

      const data = await response.json();

      if (!data.features || !Array.isArray(data.features) || data.features.length === 0) {
        return {
          success: false,
          error: {
            message: 'Place not found',
            details: 'No details available for this place'
          }
        };
      }

      const feature = data.features[0];
      const placeDetails: LocationSuggestion = {
        id: feature.id || placeId,
        address: feature.place_name || 'Unknown Location',
        mainText: feature.text || 'Unknown Location',
        secondaryText: feature.place_name || '',
        name: feature.text || 'Unknown Location',
        latitude: feature.center?.[1] || 0,
        longitude: feature.center?.[0] || 0,
        coordinates: {
          lat: feature.center?.[1] || 0,
          lng: feature.center?.[0] || 0
        },
        metadata: {
          primaryType: feature.place_type?.[0] || 'place',
          postcode: this.extractPostcode(feature.context),
          city: this.extractCity(feature.context),
          region: 'UK',
          category: feature.place_type?.[0] || 'place',
          placeId: feature.id
        }
      };

      // Cache the results
      this.setCachedData(cacheKey, placeDetails);

      return {
        success: true,
        data: placeDetails
      };

    } catch (error) {
      console.error('Error fetching place details:', error);
      return {
        success: false,
        error: {
          message: 'Failed to fetch place details',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Validate location coordinates
   */
  validateLocationCoordinates(location: LocationSuggestion): boolean {
    if (!location.latitude || !location.longitude) {
      return false;
    }
    
    const lat = location.latitude;
    const lng = location.longitude;
    
    // UK bounds validation
    return lat >= 49.9 && lat <= 60.9 && lng >= -8.2 && lng <= 1.8;
  }

  /**
   * Format location for display
   */
  formatLocationDisplay(location: LocationSuggestion): string {
    return location.address || location.mainText || location.name || 'Unknown Location';
  }

  /**
   * Fetch terminal info using improved UK location search service
   */
  async fetchTerminalInfo(placeId: string, category: 'airport' | 'train_station'): Promise<LocationSearchResponse> {
    try {
      // Use the improved UK location search service
      return await ukLocationSearchService.searchTerminals(placeId, category);
    } catch (error) {
      console.error('Error fetching terminal info:', error);
      return {
        success: false,
        error: {
          message: 'Failed to fetch terminal info',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Export singleton instance
export const locationSearchService = new LocationSearchService();

