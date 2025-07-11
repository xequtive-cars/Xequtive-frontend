/**
 * Location Search Service
 * Handles all location-related API calls with robust error handling
 */

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
  private readonly baseUrl = '/api/places';
  private readonly timeout = 10000; // 10 seconds
  private retryCount = 2;
  
  // Add caching for better performance
  private cache = new Map<string, { data: any; timestamp: number; expiresAt: number }>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
  
  // Pre-defined popular locations for instant loading (excluding airports and trains as they have dedicated sections)
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
   * Get fallback data for specific categories (airports/train stations)
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
          address: 'Gatwick Airport, Horley RH6 0NP, UK',
          mainText: 'Gatwick Airport',
          secondaryText: 'Horley RH6 0NP, UK',
          name: 'Gatwick Airport',
          latitude: 51.1537,
          longitude: -0.1821,
          coordinates: { lat: 51.1537, lng: -0.1821 },
          metadata: { primaryType: 'airport', region: 'UK' }
        },
        {
          id: 'stansted',
          address: 'Stansted Airport, Bishop\'s Stortford CM24 1QW, UK',
          mainText: 'Stansted Airport',
          secondaryText: 'Bishop\'s Stortford CM24 1QW, UK',
          name: 'Stansted Airport',
          latitude: 51.8860,
          longitude: 0.2389,
          coordinates: { lat: 51.8860, lng: 0.2389 },
          metadata: { primaryType: 'airport', region: 'UK' }
        },
        {
          id: 'luton',
          address: 'Luton Airport, Luton LU2 9LY, UK',
          mainText: 'Luton Airport',
          secondaryText: 'Luton LU2 9LY, UK',
          name: 'Luton Airport',
          latitude: 51.8763,
          longitude: -0.3717,
          coordinates: { lat: 51.8763, lng: -0.3717 },
          metadata: { primaryType: 'airport', region: 'UK' }
        }
      ];
    } else if (category === 'train_station') {
      return [
        {
          id: 'kings-cross',
          address: 'King\'s Cross Station, London N1C 4AX, UK',
          mainText: 'King\'s Cross Station',
          secondaryText: 'London N1C 4AX, UK',
          name: 'King\'s Cross Station',
          latitude: 51.5308,
          longitude: -0.1238,
          coordinates: { lat: 51.5308, lng: -0.1238 },
          metadata: { primaryType: 'train_station', region: 'UK' }
        },
        {
          id: 'paddington',
          address: 'Paddington Station, London W2 1HB, UK',
          mainText: 'Paddington Station',
          secondaryText: 'London W2 1HB, UK',
          name: 'Paddington Station',
          latitude: 51.5154,
          longitude: -0.1755,
          coordinates: { lat: 51.5154, lng: -0.1755 },
          metadata: { primaryType: 'train_station', region: 'UK' }
        },
        {
          id: 'victoria',
          address: 'Victoria Station, London SW1V 1JU, UK',
          mainText: 'Victoria Station',
          secondaryText: 'London SW1V 1JU, UK',
          name: 'Victoria Station',
          latitude: 51.4952,
          longitude: -0.1441,
          coordinates: { lat: 51.4952, lng: -0.1441 },
          metadata: { primaryType: 'train_station', region: 'UK' }
        },
        {
          id: 'liverpool-street',
          address: 'Liverpool Street Station, London EC2M 7QH, UK',
          mainText: 'Liverpool Street Station',
          secondaryText: 'London EC2M 7QH, UK',
          name: 'Liverpool Street Station',
          latitude: 51.5179,
          longitude: -0.0823,
          coordinates: { lat: 51.5179, lng: -0.0823 },
          metadata: { primaryType: 'train_station', region: 'UK' }
        }
      ];
    }
    return [];
  }

  /**
   * Create an AbortController with timeout
   */
  private createTimeoutController(timeoutMs: number = this.timeout): AbortController {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeoutMs);
    return controller;
  }

  /**
   * Enhanced fetch with retry logic and better error handling
   */
  private async fetchWithRetry(
    url: string, 
    options: RequestInit = {}, 
    retries: number = this.retryCount
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = this.createTimeoutController();
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        // If successful or client error (4xx), don't retry
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          return response;
        }

        // Server error (5xx) - retry
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on abort (timeout) or client errors
        if (lastError.name === 'AbortError' || lastError.message.includes('400')) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Fetch location suggestions based on user input
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
      if (trimmedInput.length === 0) {
        return {
          success: true,
          data: []
        };
      }

      // Only log search queries longer than 2 characters to reduce noise
      if (trimmedInput.length > 2) {
        console.log(`🔍 Location Search: "${trimmedInput}"`);
      }

      // Fetch suggestions from API
      const response = await fetch(`/api/places?input=${encodeURIComponent(trimmedInput)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Location Search API Error:', errorText);
        
        return {
          success: false,
          error: {
            message: `HTTP error! status: ${response.status}`,
            details: errorText
          }
        };
      }

      const data = await response.json();
      
      // Only log API response details in development or for debugging
      if (process.env.NODE_ENV === 'development' && trimmedInput.length > 2) {
        console.log('Places API Response:', data);
      }

      // Validate response structure
      if (!data.suggestions || !Array.isArray(data.suggestions)) {
        return {
          success: false,
          error: {
            message: 'Invalid API response',
            details: 'Suggestions are missing or not an array'
          }
        };
      }

      // Map and validate suggestions
      const suggestions = data.suggestions.map((suggestion: any) => ({
        id: suggestion.id || `suggestion-${Math.random().toString(36).substr(2, 9)}`,
        address: suggestion.address || suggestion.formattedAddress || 'Unknown Location',
        mainText: suggestion.mainText || suggestion.displayName?.text || 'Unknown Location',
        secondaryText: suggestion.secondaryText || suggestion.formattedAddress || '',
        name: suggestion.name || suggestion.displayName?.text || '',
        latitude: suggestion.latitude || suggestion.coordinates?.lat || 0,
        longitude: suggestion.longitude || suggestion.coordinates?.lng || 0,
        coordinates: suggestion.coordinates || { 
          lat: suggestion.latitude || 0, 
          lng: suggestion.longitude || 0 
        },
        metadata: {
          primaryType: suggestion.metadata?.primaryType || suggestion.types?.[0] || 'location',
          placeId: suggestion.id,
          ...suggestion.metadata
        }
      }));

      return {
        success: true,
        data: suggestions
      };
    } catch (error) {
      console.error('❌ Location Search Error:', error);
      
      return {
        success: false,
        error: {
          message: 'Failed to fetch location suggestions',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Fetch popular locations for initial display with caching and instant fallback
   */
  async fetchPopularLocations(): Promise<LocationSearchResponse> {
    const cacheKey = 'popular_locations';
    
    try {
      // Check cache first
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        return {
          success: true,
          data: cachedData
        };
      }

      // Return fallback data immediately while fetching fresh data in background
      const fallbackPromise = Promise.resolve({
        success: true,
        data: this.fallbackPopularLocations
      });

      // Fetch fresh data in background
      this.fetchFreshPopularLocations(cacheKey);

      return fallbackPromise;
    } catch (error) {
      console.error('Error fetching popular locations:', error);
      return {
        success: true,
        data: this.fallbackPopularLocations
      };
    }
  }

  /**
   * Fetch fresh popular locations in background
   */
  private async fetchFreshPopularLocations(cacheKey: string): Promise<void> {
    try {
      const response = await fetch(`/api/places?popular=true`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.suggestions && data.suggestions.length > 0) {
          // Cache the fresh data
          this.setCachedData(cacheKey, data.suggestions);
        }
      }
    } catch (error) {
      console.error('Background fetch of popular locations failed:', error);
    }
  }

  /**
   * Fetch category-specific locations (airports or train stations) with caching
   */
  async fetchCategoryLocations(category: 'airport' | 'train_station'): Promise<LocationSearchResponse> {
    const cacheKey = `category_${category}`;
    
    try {
      // Check cache first
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        console.log(`✅ Using cached ${category} locations (${cachedData.length} items)`);
        return {
          success: true,
          data: cachedData
        };
      }

      console.log(`🔍 Fetching ${category} locations from API...`);
      
      const response = await fetch(`/api/places?category=${category}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`${category} locations API Error:`, errorText);
        
        // Return fallback data for airports and train stations
        const fallbackData = this.getFallbackCategoryData(category);
        
        return {
          success: true,
          data: fallbackData
        };
      }

      const data = await response.json();
      console.log(`✅ Successfully fetched ${data.suggestions?.length || 0} ${category} locations`);
      
      // Cache the data
      if (data.success && data.suggestions && data.suggestions.length > 0) {
        this.setCachedData(cacheKey, data.suggestions);
      }
      
      return {
        success: true,
        data: data.suggestions || []
      };
    } catch (error) {
      console.error(`Error fetching ${category} locations:`, error);
      
      // Return fallback data on error
      const fallbackData = this.fallbackPopularLocations.filter(loc => 
        loc.metadata?.primaryType === category
      );
      
      return {
        success: true,
        data: fallbackData
      };
    }
  }

  /**
   * Fetch detailed place information including coordinates
   */
  async fetchPlaceDetails(
    placeId: string,
    sessionToken?: string
  ): Promise<PlaceDetailsResponse> {
    try {
      if (!placeId || typeof placeId !== 'string') {
        return {
          success: false,
          error: {
            message: 'Invalid place ID',
            details: 'Place ID must be a non-empty string'
          }
        };
      }

      console.log(`[LocationSearchService] Fetching details for place: ${placeId}`);

      const url = new URL('/api/places/details', window.location.origin);
      url.searchParams.set('placeid', placeId);
      
      if (sessionToken) {
        url.searchParams.set('sessiontoken', sessionToken);
      }

      const response = await this.fetchWithRetry(url.toString());

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[LocationSearchService] Place details error ${response.status}:`, errorText);
        
        return {
          success: false,
          error: {
            message: `Failed to get location details (${response.status})`,
            details: errorText
          }
        };
      }

      const data = await response.json();

      if (!data.success) {
        console.warn('[LocationSearchService] Place details API error:', data.error);
        return {
          success: false,
          error: data.error || { message: 'Failed to get location details' }
        };
      }

      console.log('[LocationSearchService] Successfully fetched place details');

      return {
        success: true,
        data: data.data
      };

    } catch (error) {
      console.error('[LocationSearchService] Place details network error:', error);
      
      return {
        success: false,
        error: {
          message: 'Failed to get location details',
          details: error instanceof Error ? error.message : 'Network error'
        }
      };
    }
  }

  /**
   * Validate if a location has required coordinates
   */
  validateLocationCoordinates(location: LocationSuggestion): boolean {
    return !!(
      location.latitude && 
      location.longitude && 
      typeof location.latitude === 'number' && 
      typeof location.longitude === 'number' &&
      !isNaN(location.latitude) &&
      !isNaN(location.longitude)
    );
  }

  /**
   * Format location for display
   */
  formatLocationDisplay(location: LocationSuggestion): string {
    if (location.mainText && location.secondaryText) {
      return `${location.mainText}, ${location.secondaryText}`;
    }
    return location.address || location.name || 'Unknown location';
  }

  /**
   * Fetch terminal/platform information for airports and train stations
   */
  async fetchTerminalInfo(placeId: string, category: 'airport' | 'train_station'): Promise<LocationSearchResponse> {
    try {
      const response = await fetch(`/api/places?terminals=true&placeId=${encodeURIComponent(placeId)}&category=${category}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Terminal Info API Error:', errorText);
        
        return {
          success: false,
          error: {
            message: `HTTP error! status: ${response.status}`,
            details: errorText
          }
        };
      }

      const data = await response.json();
      
      // Convert terminal data to LocationSuggestion format
      const terminals = data.terminals?.map((terminal: any) => ({
        id: `${placeId}-${terminal.id}`,
        address: terminal.name,
        mainText: terminal.name,
        secondaryText: category === 'airport' ? 'Terminal' : 'Platform',
        name: terminal.name,
        latitude: 0, // Terminals don't have separate coordinates
        longitude: 0,
        coordinates: { lat: 0, lng: 0 },
        metadata: {
          primaryType: terminal.type,
          category: category,
          parentPlaceId: placeId,
          terminalId: terminal.id
        }
      })) || [];

      return {
        success: true,
        data: terminals
      };
    } catch (error) {
      console.error('Error fetching terminal info:', error);
      return {
        success: false,
        error: {
          message: 'Failed to fetch terminal information',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Export singleton instance
export const locationSearchService = new LocationSearchService();

