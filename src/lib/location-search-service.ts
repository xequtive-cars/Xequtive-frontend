export interface LocationMetadata {
  postcode: string | undefined;
  city: string | undefined;
  region: string | undefined;
  category: string | undefined;
  airportCode?: string;
  terminalOptions?: string[];
  terminalCoordinates?: {
    [key: string]: { lat: number; lng: number };
  };
}

export interface LocationSearchResult {
  address: string;
  coordinates: { lat: number; lng: number };
  type:
    | "airport"
    | "station"
    | "landmark"
    | "address"
    | "poi"
    | "terminal"
    | "postcode"
    | "street"
    | "building"
    | "area"
    | "hospital";
  metadata: LocationMetadata;
}

interface LocationBase {
  address: string;
  type: LocationType;
  metadata: LocationMetadata;
}

interface MapboxFeature {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  properties: {
    [key: string]: string | number | boolean | null | undefined;
    category?: string;
  };
  text: string;
  place_name: string;
  center: [number, number];
  context?: Array<{
    id: string;
    text: string;
    wikidata?: string;
    short_code?: string;
  }>;
}

interface MapboxResponse {
  features: MapboxFeature[];
}

// UK major airports with terminal coordinates
const UK_AIRPORTS: LocationBase[] = [
  {
    address: "London Heathrow Airport (LHR)",
    type: "airport",
    metadata: {
      postcode: "TW6 2GW",
      city: "London",
      region: "Greater London",
      category: "airport",
      airportCode: "LHR",
      terminalOptions: ["Terminal 2", "Terminal 3", "Terminal 4", "Terminal 5"],
      terminalCoordinates: {
        "Terminal 2": { lat: 51.4712, lng: -0.4527 },
        "Terminal 3": { lat: 51.4713, lng: -0.4566 },
        "Terminal 4": { lat: 51.4591, lng: -0.4487 },
        "Terminal 5": { lat: 51.4722, lng: -0.4869 },
      },
    },
  },
  {
    address: "London Gatwick Airport (LGW)",
    type: "airport",
    metadata: {
      postcode: "RH6 0NP",
      city: "Gatwick",
      region: "West Sussex",
      category: "airport",
      airportCode: "LGW",
      terminalOptions: ["North Terminal", "South Terminal"],
      terminalCoordinates: {
        "North Terminal": { lat: 51.1572, lng: -0.1606 },
        "South Terminal": { lat: 51.1537, lng: -0.1588 },
      },
    },
  },
  {
    address: "Manchester Airport (MAN)",
    type: "airport",
    metadata: {
      postcode: "M90 1QX",
      city: "Manchester",
      region: "Greater Manchester",
      category: "airport",
      airportCode: "MAN",
      terminalOptions: ["Terminal 1", "Terminal 2", "Terminal 3"],
      terminalCoordinates: {
        "Terminal 1": { lat: 53.365, lng: -2.2728 },
        "Terminal 2": { lat: 53.3659, lng: -2.269 },
        "Terminal 3": { lat: 53.3636, lng: -2.2715 },
      },
    },
  },
  // Keep other airports with single terminals as they are
  {
    address: "London Stansted Airport (STN)",
    type: "airport",
    metadata: {
      postcode: "CM24 1QW",
      city: "Stansted Mountfitchet",
      region: "Essex",
      category: "airport",
      airportCode: "STN",
      terminalOptions: ["Main Terminal"],
      terminalCoordinates: {
        "Main Terminal": { lat: 51.886, lng: 0.2389 },
      },
    },
  },
  {
    address: "London Luton Airport (LTN)",
    type: "airport",
    metadata: {
      postcode: "LU2 9LY",
      city: "Luton",
      region: "Bedfordshire",
      category: "airport",
      airportCode: "LTN",
      terminalOptions: ["Main Terminal"],
    },
  },
  {
    address: "London City Airport (LCY)",
    type: "airport",
    metadata: {
      postcode: "E16 2PX",
      city: "London",
      region: "Greater London",
      category: "airport",
      airportCode: "LCY",
      terminalOptions: ["Main Terminal"],
    },
  },
  {
    address: "Birmingham Airport (BHX)",
    type: "airport",
    metadata: {
      postcode: "B26 3QJ",
      city: "Birmingham",
      region: "West Midlands",
      category: "airport",
      airportCode: "BHX",
      terminalOptions: ["Main Terminal"],
    },
  },
  {
    address: "Edinburgh Airport (EDI)",
    type: "airport",
    metadata: {
      postcode: "EH12 9DN",
      city: "Edinburgh",
      region: "Scotland",
      category: "airport",
      airportCode: "EDI",
      terminalOptions: ["Main Terminal"],
    },
  },
  {
    address: "Glasgow Airport (GLA)",
    type: "airport",
    metadata: {
      postcode: "PA3 2SW",
      city: "Glasgow",
      region: "Scotland",
      category: "airport",
      airportCode: "GLA",
      terminalOptions: ["Main Terminal"],
    },
  },
  {
    address: "Bristol Airport (BRS)",
    type: "airport",
    metadata: {
      postcode: "BS48 3DY",
      city: "Bristol",
      region: "Somerset",
      category: "airport",
      airportCode: "BRS",
      terminalOptions: ["Main Terminal"],
    },
  },
];

// UK Major train stations without coordinates
const UK_STATIONS: LocationBase[] = [
  {
    address: "London King's Cross Station",
    type: "station",
    metadata: {
      postcode: "N1 9AL",
      city: "London",
      region: "Greater London",
      category: "rail",
    },
  },
  {
    address: "London Waterloo Station",
    type: "station",
    metadata: {
      postcode: "SE1 8SW",
      city: "London",
      region: "Greater London",
      category: "rail",
    },
  },
  {
    address: "London Liverpool Street Station",
    type: "station",
    metadata: {
      postcode: "EC2M 7PY",
      city: "London",
      region: "Greater London",
      category: "rail",
    },
  },
  {
    address: "London Victoria Station",
    type: "station",
    metadata: {
      postcode: "SW1V 1JU",
      city: "London",
      region: "Greater London",
      category: "rail",
    },
  },
  {
    address: "London Paddington Station",
    type: "station",
    metadata: {
      postcode: "W2 1HQ",
      city: "London",
      region: "Greater London",
      category: "rail",
    },
  },
  {
    address: "Manchester Piccadilly Station",
    type: "station",
    metadata: {
      postcode: "M1 2QF",
      city: "Manchester",
      region: "Greater Manchester",
      category: "rail",
    },
  },
  {
    address: "Birmingham New Street Station",
    type: "station",
    metadata: {
      postcode: "B2 4QA",
      city: "Birmingham",
      region: "West Midlands",
      category: "rail",
    },
  },
  {
    address: "Edinburgh Waverley Station",
    type: "station",
    metadata: {
      postcode: "EH1 1BB",
      city: "Edinburgh",
      region: "Scotland",
      category: "rail",
    },
  },
  {
    address: "Glasgow Central Station",
    type: "station",
    metadata: {
      postcode: "G1 3SL",
      city: "Glasgow",
      region: "Scotland",
      category: "rail",
    },
  },
  {
    address: "Leeds Station",
    type: "station",
    metadata: {
      postcode: "LS1 4DY",
      city: "Leeds",
      region: "West Yorkshire",
      category: "rail",
    },
  },
];

// UK popular landmarks without coordinates
const UK_LANDMARKS: LocationBase[] = [
  {
    address: "Big Ben, Westminster",
    type: "landmark",
    metadata: {
      postcode: "SW1A 0AA",
      city: "London",
      region: "Greater London",
      category: "landmark",
    },
  },
  {
    address: "Tower Bridge, London",
    type: "landmark",
    metadata: {
      postcode: "SE1 2UP",
      city: "London",
      region: "Greater London",
      category: "landmark",
    },
  },
  {
    address: "Buckingham Palace",
    type: "landmark",
    metadata: {
      postcode: "SW1A 1AA",
      city: "London",
      region: "Greater London",
      category: "landmark",
    },
  },
  {
    address: "Edinburgh Castle",
    type: "landmark",
    metadata: {
      postcode: "EH1 2NG",
      city: "Edinburgh",
      region: "Scotland",
      category: "landmark",
    },
  },
  {
    address: "Stonehenge",
    type: "landmark",
    metadata: {
      postcode: "SP4 7DE",
      city: "Amesbury",
      region: "Wiltshire",
      category: "landmark",
    },
  },
  {
    address: "Roman Baths",
    type: "landmark",
    metadata: {
      postcode: "BA1 1LZ",
      city: "Bath",
      region: "Somerset",
      category: "landmark",
    },
  },
  {
    address: "Tower of London",
    type: "landmark",
    metadata: {
      postcode: "EC3N 4AB",
      city: "London",
      region: "Greater London",
      category: "landmark",
    },
  },
  {
    address: "St Paul's Cathedral",
    type: "landmark",
    metadata: {
      postcode: "EC4M 8AD",
      city: "London",
      region: "Greater London",
      category: "landmark",
    },
  },
  {
    address: "Westminster Abbey",
    type: "landmark",
    metadata: {
      postcode: "SW1P 3PA",
      city: "London",
      region: "Greater London",
      category: "landmark",
    },
  },
  {
    address: "London Eye",
    type: "landmark",
    metadata: {
      postcode: "SE1 7PB",
      city: "London",
      region: "Greater London",
      category: "landmark",
    },
  },
];

// First fix the type issue
export type LocationType =
  | "airport"
  | "station"
  | "landmark"
  | "address"
  | "poi"
  | "terminal"
  | "postcode"
  | "street"
  | "building"
  | "area"
  | "hospital";

class LocationSearchService {
  private mapboxToken: string;
  private coordinatesCache: Map<string, { lat: number; lng: number }>;

  constructor() {
    this.mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
    this.coordinatesCache = new Map();
  }

  private async getCoordinatesForLocation(
    location: LocationBase
  ): Promise<{ lat: number; lng: number } | null> {
    try {
      // First check cache
      if (this.coordinatesCache.has(location.address)) {
        return this.coordinatesCache.get(location.address)!;
      }

      // If not in cache, fetch from Mapbox
      const searchQuery = `${location.address}, ${location.metadata.city}, ${location.metadata.postcode}`;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchQuery
      )}.json?access_token=${this.mapboxToken}&country=gb&limit=1`;

      const response = await fetch(url);
      const data = (await response.json()) as MapboxResponse;

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const coordinates = { lat, lng };
        // Cache the result
        this.coordinatesCache.set(location.address, coordinates);
        return coordinates;
      }

      return null;
    } catch (error) {
      console.error("Error getting coordinates:", error);
      return null;
    }
  }

  async getSuggestedLocations(
    type?: "pickup" | "dropoff" | "stop",
    userLocation?: { latitude: number; longitude: number } | null
  ): Promise<LocationSearchResult[]> {
    try {
      const suggestions: LocationSearchResult[] = [];

      // 1. Add current location if available
      if (userLocation) {
        const currentLocationAddress = await this.reverseGeocode(
          userLocation.latitude,
          userLocation.longitude
        );
        suggestions.push({
          address: currentLocationAddress || "📍 Use My Current Location",
          coordinates: {
            lat: userLocation.latitude,
            lng: userLocation.longitude,
          },
          type: "landmark",
          metadata: {
            postcode: undefined,
            city: undefined,
            region: undefined,
            category: "current_location",
          },
        });
      }

      // 2. Get coordinates for all static locations if not cached
      const allLocations = [...UK_AIRPORTS, ...UK_STATIONS, ...UK_LANDMARKS];
      const locationsWithCoordinates = await Promise.all(
        allLocations.map(async (location) => {
          const coordinates = await this.getCoordinatesForLocation(location);
          return coordinates ? { ...location, coordinates } : null;
        })
      );

      // Filter out locations where we couldn't get coordinates
      const validLocations = locationsWithCoordinates.filter(
        (loc): loc is LocationSearchResult => loc !== null
      );

      // 3. Sort all locations by distance from user if available
      if (userLocation) {
        validLocations.sort((a, b) => {
          const distA = this.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            a.coordinates.lat,
            a.coordinates.lng
          );
          const distB = this.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            b.coordinates.lat,
            b.coordinates.lng
          );
          return distA - distB;
        });
      }

      // 4. Add sorted locations by type
      const airports = validLocations
        .filter((loc) => loc.type === "airport")
        .slice(0, 5);
      const stations = validLocations
        .filter((loc) => loc.type === "station")
        .slice(0, 3);
      const landmarks = validLocations
        .filter((loc) => loc.type === "landmark")
        .slice(0, 5);

      suggestions.push(...airports, ...stations, ...landmarks);

      // 5. Add nearby POIs if user location is available
      if (userLocation) {
        const nearbyPOIs = await this.getNearbyPOIs(userLocation);
        suggestions.push(...nearbyPOIs.slice(0, 3));
      }

      return suggestions;
    } catch (error) {
      console.error("Error getting suggested locations:", error);
      return [];
    }
  }

  async searchLocations(
    query: string,
    locationType?: "pickup" | "dropoff" | "stop",
    userLocation?: { latitude: number; longitude: number } | null
  ): Promise<LocationSearchResult[]> {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const normalizedQuery = query.toLowerCase().trim();

      // First search Mapbox
      let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${
        this.mapboxToken
      }&country=gb&types=address,poi,place,postcode&limit=5&autocomplete=true`;

      // Add proximity if user location is available
      if (userLocation) {
        url += `&proximity=${userLocation.longitude},${userLocation.latitude}`;
      }

      const response = await fetch(url);
      const data = (await response.json()) as MapboxResponse;

      const mapboxResults = data.features.map((feature) => ({
        address: feature.place_name,
        coordinates: {
          lat: feature.center[1],
          lng: feature.center[0],
        },
        type: this.determineLocationType(feature),
        metadata: {
          postcode: this.extractPostcode(feature),
          city: this.extractCity(feature),
          region: this.extractRegion(feature),
          category: feature.properties.category as string | undefined,
        },
      }));

      // Then search static locations
      const allStaticLocations = [
        ...UK_AIRPORTS,
        ...UK_STATIONS,
        ...UK_LANDMARKS,
      ];
      const filteredLocations = allStaticLocations.filter((location) => {
        const address = location.address.toLowerCase();
        const city = location.metadata.city?.toLowerCase() || "";
        const airportCode = location.metadata.airportCode?.toLowerCase() || "";
        const postcode = location.metadata.postcode?.toLowerCase() || "";

        return (
          address.includes(normalizedQuery) ||
          city.includes(normalizedQuery) ||
          airportCode.includes(normalizedQuery) ||
          postcode.includes(normalizedQuery)
        );
      });

      // Get coordinates for filtered locations
      const staticResults = await Promise.all(
        filteredLocations.map(async (location) => {
          // For airports with terminal coordinates, use those directly
          if (
            location.type === "airport" &&
            location.metadata.terminalCoordinates &&
            location.metadata.terminalCoordinates["Main Terminal"]
          ) {
            return {
              ...location,
              coordinates:
                location.metadata.terminalCoordinates["Main Terminal"],
            } as LocationSearchResult;
          }

          // For other locations, get coordinates from cache or Mapbox
          const coordinates = await this.getCoordinatesForLocation(location);
          return coordinates
            ? ({
                ...location,
                coordinates,
              } as LocationSearchResult)
            : null;
        })
      );

      // Combine all results
      const allResults = [
        ...staticResults.filter((r): r is LocationSearchResult => r !== null),
        ...mapboxResults,
      ];

      // Sort results by relevance
      const sortedResults = this.sortResults(allResults, normalizedQuery);

      // Remove duplicates and return
      return this.deduplicateResults(sortedResults);
    } catch (error) {
      console.error("Error searching locations:", error);
      return [];
    }
  }

  private async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<string | null> {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${this.mapboxToken}&country=gb&types=address`;
      const response = await fetch(url);
      const data = (await response.json()) as MapboxResponse;

      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }

      return null;
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      return null;
    }
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private async getNearbyPOIs(userLocation: {
    latitude: number;
    longitude: number;
  }): Promise<LocationSearchResult[]> {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/poi.json?proximity=${userLocation.longitude},${userLocation.latitude}&access_token=${this.mapboxToken}&country=gb&types=poi&limit=5`;
      const response = await fetch(url);
      const data = (await response.json()) as MapboxResponse;

      return data.features.map((feature) => ({
        address: feature.place_name,
        coordinates: {
          lat: feature.center[1],
          lng: feature.center[0],
        },
        type: this.determineLocationType(feature),
        metadata: {
          postcode: this.extractPostcode(feature),
          city: this.extractCity(feature),
          region: this.extractRegion(feature),
          category: feature.properties.category as string | undefined,
        },
      }));
    } catch (error) {
      console.error("Error getting nearby POIs:", error);
      return [];
    }
  }

  private filterAirports(query: string): LocationBase[] {
    return UK_AIRPORTS.filter((airport) =>
      airport.address.toLowerCase().includes(query.toLowerCase())
    );
  }

  private deduplicateResults(
    results: LocationSearchResult[]
  ): LocationSearchResult[] {
    const seen = new Set<string>();
    return results.filter((result) => {
      const key = `${result.address}-${result.coordinates.lat}-${result.coordinates.lng}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private determineLocationType(feature: MapboxFeature): LocationType {
    const placeType = feature.place_type?.[0];
    const category = feature.properties?.category;

    if (placeType === "poi" && category === "airport") return "airport";
    if (placeType === "poi" && category === "rail") return "station";
    if (placeType === "address") return "building";
    if (placeType === "postcode") return "postcode";
    if (placeType === "poi" && category === "hospital") return "hospital";
    if (placeType === "place") return "area";
    if (placeType === "poi") return "poi";

    return "landmark";
  }

  private extractPostcode(feature: MapboxFeature): string | undefined {
    const context = feature.context || [];
    const postcodeEntry = context.find((c) => c.id.startsWith("postcode"));
    return postcodeEntry?.text;
  }

  private extractCity(feature: MapboxFeature): string | undefined {
    const context = feature.context || [];
    const cityEntry = context.find((c) => c.id.startsWith("place"));
    return cityEntry?.text;
  }

  private extractRegion(feature: MapboxFeature): string | undefined {
    const context = feature.context || [];
    const regionEntry = context.find((c) => c.id.startsWith("region"));
    return regionEntry?.text;
  }

  formatLocationForDisplay(location: LocationSearchResult): string {
    if (location.type === "airport" && location.metadata.airportCode) {
      return `${location.address} (${location.metadata.airportCode})`;
    }
    return location.address;
  }

  private sortResults(
    results: LocationSearchResult[],
    query: string
  ): LocationSearchResult[] {
    return results.sort((a, b) => {
      const aAddress = a.address.toLowerCase();
      const bAddress = b.address.toLowerCase();
      const aMetadata = a.metadata;
      const bMetadata = b.metadata;

      // Exact matches first
      if (aAddress === query) return -1;
      if (bAddress === query) return 1;

      // Then airport code matches
      const aAirportMatch = aMetadata.airportCode?.toLowerCase() === query;
      const bAirportMatch = bMetadata.airportCode?.toLowerCase() === query;
      if (aAirportMatch && !bAirportMatch) return -1;
      if (!aAirportMatch && bAirportMatch) return 1;

      // Then starts with query
      if (aAddress.startsWith(query) && !bAddress.startsWith(query)) return -1;
      if (!aAddress.startsWith(query) && bAddress.startsWith(query)) return 1;

      // Then postcode matches
      const aPostcodeMatch = aMetadata.postcode?.toLowerCase().includes(query);
      const bPostcodeMatch = bMetadata.postcode?.toLowerCase().includes(query);
      if (aPostcodeMatch && !bPostcodeMatch) return -1;
      if (!aPostcodeMatch && bPostcodeMatch) return 1;

      // Then city matches
      const aCityMatch = aMetadata.city?.toLowerCase().includes(query);
      const bCityMatch = bMetadata.city?.toLowerCase().includes(query);
      if (aCityMatch && !bCityMatch) return -1;
      if (!aCityMatch && bCityMatch) return 1;

      // Finally, contains query
      if (aAddress.includes(query) && !bAddress.includes(query)) return -1;
      if (!aAddress.includes(query) && bAddress.includes(query)) return 1;

      return 0;
    });
  }

  // Location Search Enhancement Utilities
  private normalizeTokens(query: string): string[] {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')  // Remove special characters
      .split(/\s+/)             // Split into tokens
      .filter(token => token.length > 1);  // Remove very short tokens
  }

  private extractSemanticTypes(tokens: string[]): string[] {
    const SEMANTIC_TYPES = {
      terminal: ['terminal', 't', 'term'],
      airport: ['airport', 'airp', 'apt'],
      station: ['station', 'stn'],
      landmark: ['landmark', 'mark']
    };
    return tokens.filter(token => 
      Object.values(SEMANTIC_TYPES)
        .flat()
        .includes(token)
    );
  }

  private calculateTokenMatchScore(
    queryTokens: string[], 
    locationTokens: string[]
  ): number {
    const matchedTokens = queryTokens.filter(qt => 
      locationTokens.some(lt => 
        lt.includes(qt) || qt.includes(lt)
      )
    );

    return matchedTokens.length / queryTokens.length;
  }

  private enhanceLocationResults(
    originalResults: LocationSearchResult[], 
    query: string
  ): LocationSearchResult[] {
    const tokens = this.normalizeTokens(query);
    const semanticTypes = this.extractSemanticTypes(tokens);

    // Enhance results with additional scoring
    const enhancedResults = originalResults.map(result => {
      const locationTokens = this.normalizeTokens(result.address);
      
      // Calculate base match score
      let score = this.calculateTokenMatchScore(tokens, locationTokens);

      // Semantic type boosting
      semanticTypes.forEach(type => {
        if (result.type.includes(type) || 
            locationTokens.includes(type)) {
          score *= 1.3;  // 30% boost for semantic match
        }
      });

      // Prioritize exact matches
      if (tokens.every(token => 
        locationTokens.includes(token)
      )) {
        score *= 1.5;  // 50% boost for exact matches
      }

      return { ...result, score };
    });

    // Sort by enhanced score
    return enhancedResults
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map(({ score, ...result }) => result);
  }

  // Enhanced search method
  async searchLocationsWithEnhancement(
    query: string,
    locationType?: "pickup" | "dropoff" | "stop",
    userLocation?: { latitude: number; longitude: number } | null
  ): Promise<LocationSearchResult[]> {
    // Original search method call
    const originalResults = await this.searchLocations(
      query, 
      locationType, 
      userLocation
    );

    // If original results are empty or low confidence, enhance search
    if (originalResults.length === 0) {
      // Fallback to enhanced search strategies
      const fallbackResults = this.performFallbackSearch(query);
      
      if (fallbackResults.length > 0) {
        return fallbackResults;
      }
    }

    // Enhance existing results
    return this.enhanceLocationResults(originalResults, query);
  }

  private performFallbackSearch(query: string): LocationSearchResult[] {
    const tokens = this.normalizeTokens(query);
    const semanticTypes = this.extractSemanticTypes(tokens);

    // Check curated locations (airports, stations)
    const curatedLocations = [
      ...UK_AIRPORTS,
      ...UK_STATIONS
    ].filter(location => 
      tokens.every(token => 
        this.normalizeTokens(location.address)
          .some(lt => lt.includes(token))
      )
    );

    // Convert curated locations to search results
    return curatedLocations.map(location => ({
      address: location.address,
      coordinates: { 
        lat: location.metadata.terminalCoordinates?.["Main Terminal"]?.lat || 0, 
        lng: location.metadata.terminalCoordinates?.["Main Terminal"]?.lng || 0 
      },
      type: location.type,
      metadata: location.metadata
    }));
  }
}

export const locationSearchService = new LocationSearchService();

